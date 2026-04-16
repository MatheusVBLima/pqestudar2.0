

## Diagnóstico: como sua chave Brevo é usada neste projeto

### O que encontrei no código

**1. A chave NÃO está exposta no código-fonte**
- Procurei por `BREVO_API_KEY` e `xkeysib` (prefixo padrão das chaves Brevo) em todo o repositório.
- A chave aparece **uma única vez**, dentro da Edge Function `subscribe-newsletter-brevo/index.ts`, lida via `Deno.env.get('BREVO_API_KEY')`. Esse é o uso correto — a chave vive como Supabase Secret e nunca chega ao frontend.
- `.env`, `index.html`, `AdminBrevo.tsx` e qualquer outro arquivo do client **não contêm a chave**. O painel admin nem oferece campo para editar a API key (só lista ID, tags, mensagens).

**2. Único ponto onde a chave é efetivamente usada**
- Edge Function `subscribe-newsletter-brevo`, chamada de 4 lugares no site (Home hero, /sobre, /assine, newsletter-form).
- Faz `GET` e `POST` em `https://api.brevo.com/v3/contacts` com header `api-key`.

**3. Pontos frágeis identificados nessa Edge Function**

| # | Problema | Risco |
|---|----------|-------|
| A | `verify_jwt` **não** está declarado em `config.toml` para `subscribe-newsletter-brevo`. Como hoje as funções gerenciadas pela Lovable rodam por padrão sem JWT, ela é **publicamente invocável** por qualquer pessoa com a URL e a `anon key` (que é pública). | Alto: bot pode chamar em loop |
| B | Rate limit é **3 tentativas / 5 min por IP** — fácil de driblar com proxies rotativos. | Médio |
| C | `console.error('Brevo API error:', responseText)` loga a resposta crua da Brevo. Em alguns erros 4xx a Brevo devolve o header da request — risco baixo, mas vale auditar. | Baixo |
| D | Não há validação de formato de e-mail no servidor (só no client). | Baixo |
| E | CORS aberto (`Access-Control-Allow-Origin: *`). Qualquer origem pode chamar a função. | Médio |

**4. O que isso NÃO explica**
- O alerta da Brevo cita IP francês (`2a05:d012:fca:9509:60f7:1e86:89f4:8a3a` — AWS Paris) e a conta `mdias.programandoideias@gmail.com`.
- O Supabase deste projeto roda em região fixa (não Paris/AWS-FR). Logo, a chamada **provavelmente não saiu desta Edge Function**.
- Cenários mais prováveis (em ordem):
  1. **Chave usada em outro projeto/serviço seu** (Zapier, Make, Vercel, Railway, n8n, outro Lovable, script local) — esses sim podem rodar em AWS Paris.
  2. **Vazamento histórico** (commit antigo no GitHub, print, extensão de navegador, log de terceiro).
  3. **Reuso da mesma chave** em mais de um ambiente.

---

## Plano de ação

### Passo 1 — Resposta imediata (você faz, fora do Lovable)
1. **Revogar a chave atual** no painel Brevo → SMTP & API → API Keys → Delete.
2. **Gerar nova chave** com nome identificável: `pqestudar-supabase-edge-2026-04`.
3. **Restringir IP da nova chave** no Brevo (se o plano permitir) para os IPs de saída do Supabase Edge Functions.
4. **Auditar onde a chave antiga existia**: GitHub (search `xkeysib` no seu user/orgs), Zapier, Make, Vercel env, Railway, scripts locais, Postman, .env antigos.
5. **Atualizar o Supabase Secret `BREVO_API_KEY`** com a nova chave.

### Passo 2 — Hardening da Edge Function (eu faço aqui)
Mudanças em `supabase/functions/subscribe-newsletter-brevo/index.ts` e `supabase/config.toml`:

1. **CORS restrito** — trocar `*` por allowlist com domínios oficiais (`pqestudar.com.br`, `pqestudar-prototipo.lovable.app`, preview Lovable).
2. **Validação server-side de e-mail** com regex + tamanho máximo (255).
3. **Rate limit reforçado**: 3/5min → 5/15min + cap diário por IP (ex.: 20/dia).
4. **Honeypot opcional** no payload (campo invisível) para barrar bots simples.
5. **Sanitizar logs**: parar de logar `responseText` cru da Brevo; logar só `status` + `code`.
6. **Adicionar header `User-Agent` identificável** nas chamadas à Brevo (`pqestudar-edge/1.0`) para rastreabilidade nos logs deles.
7. **Garantir `verify_jwt = false`** explicitamente no `config.toml` (status atual implícito; deixar explícito evita surpresa em mudança de default).

### Passo 3 — Detecção
1. Criar consulta SQL utilitária (documentada no SECURITY.md) para inspecionar `newsletter_events` filtrando picos de `newsletter_error` por `ip_hash` — útil para detectar abuso futuro.
2. Documentar procedimento de rotação da chave em `SECURITY.md`.

### Passo 4 — Verificações que você precisa fazer manualmente
Estas eu **não consigo verificar** daqui:
- [ ] Histórico do GitHub (incluindo forks e commits revertidos)
- [ ] Outros projetos/contas que possam ter a mesma chave
- [ ] Logs de acesso da conta Brevo (Brevo → Security → Activity)
- [ ] Se o e-mail `mdias.programandoideias@gmail.com` tem 2FA ativo
- [ ] Extensões de navegador instaladas que tenham permissão `*://*.brevo.com/*`

---

## Arquivos que serão modificados (Passo 2)

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/subscribe-newsletter-brevo/index.ts` | CORS allowlist, validação e-mail, rate limit reforçado, logs sanitizados, User-Agent |
| `supabase/config.toml` | Declarar `[functions.subscribe-newsletter-brevo] verify_jwt = false` explicitamente |
| `SECURITY.md` | Adicionar seção "Rotação da chave Brevo" e checklist de incidente |

Nenhuma migração de banco é necessária. A chave em si só é trocada por você no Supabase Secrets (não é arquivo).

