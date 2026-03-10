## Plano: Refinar copy e SEO do FAQ da home

### O que muda

Reescrever as 9 perguntas e respostas do FAQ em `src/components/sections/home-faq-section.tsx` com foco em:

**Copy**: Perguntas que soam como dúvidas reais de um visitante (tom conversacional, direto). Respostas curtas (2-3 frases no máximo), que reduzem atrito e incentivam clique natural.

**SEO**: Cobertura semântica discreta dos termos-chave — "ferramentas para estudar", "concursos públicos abertos", "organizar estudos", "produtividade nos estudos" — sem keyword stuffing. As perguntas usam linguagem natural que espelha buscas reais.

**Conversão leve**: Respostas terminam com links internos contextuais (não forçados) e frases que geram curiosidade sem prometer demais.

### Conteúdo proposto


| #   | Pergunta (SEO-friendly, tom natural)                        | Resposta (curta, clara, com link quando natural)                                                                                                                                                |
| --- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | O que é o PqEstudar e para quem ele foi feito?              | Uma plataforma gratuita que reúne ferramentas para estudar, concursos públicos e recursos educacionais num só lugar. Feita para quem quer se organizar melhor e aproveitar cada hora de estudo. |
| 2   | Preciso pagar ou criar conta para usar?                     | Não. Todo o conteúdo público é gratuito e acessível sem cadastro. A conta é opcional — serve para salvar seus itens favoritos e acompanhar novidades.                                           |
| 3   | Que tipo de ferramentas para estudos estão disponíveis?     | Ferramentas de produtividade, organização e aprendizado, filtradas por categoria. Você acessa direto, sem intermediários. → link /ferramentas                                                   |
| 4   | Como acompanho concursos públicos abertos pelo PqEstudar?   | A seção de concursos reúne oportunidades com filtros por área, escolaridade e situação. Cada concurso tem página própria com detalhes e link para o edital. → link /concursos                   |
| 5   | O que posso fazer na página de Votações?                    | Sugerir funcionalidades e votar nas que mais importam para você. É assim que a comunidade ajuda a decidir o que será desenvolvido. → link /votacoes                                             |
| 6   | O que são os Produtos do PqEstudar?                         | Guias e materiais prontos para acelerar seus estudos, criados pela equipe do PqEstudar. → link /produtos                                                                                        |
| 7   | Posso salvar ferramentas e concursos para consultar depois? | Sim. Com uma conta gratuita, você salva qualquer ferramenta ou concurso e acessa tudo na sua área de favoritos.                                                                                 |
| 8   | O PqEstudar é atualizado com frequência?                    | Sim. Novas ferramentas, concursos e melhorias são adicionados regularmente com base no feedback da comunidade.                                                                                  |
| 9   | Como entro em contato se tiver uma dúvida?                  | Por e-mail em [pqestudar.suporte@gmail.com](mailto:suporte@pqestudar.com)                                                                                                                       |


### Também adicionar: FAQ JSON-LD

Injetar schema `FAQPage` via `<script type="application/ld+json">` no componente (usando `Helmet`) para que o Google possa exibir rich results de FAQ. Estrutura:

```json
{ "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "...", "acceptedAnswer": { "@type": "Answer", "text": "..." } }] }
```

Para os itens com JSX (links), será extraída uma versão texto-puro para o JSON-LD.

### Arquivo editado

- `src/components/sections/home-faq-section.tsx` (apenas)