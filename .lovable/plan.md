## Plano: Reescrever o FAQ com base nas funcionalidades reais do site

### Contexto

O FAQ atual tem perguntas genéricas sobre "cursos com certificado", "pré-requisitos" e "conteúdo offline" que **não refletem** o que o PqEstudar realmente oferece. O site tem áreas públicas como **Ferramentas**, **Concursos**, **Votações** e **Produtos**, e o FAQ deve explicar essas áreas de forma simples para o usuário.

**Importante:** este FAQ **não será uma página própria** neste update. Ele deve aparecer **na home**, **abaixo da seção "Produtos do PqEstudar" e acima da seção "Aprovado por uma Comunidade de Milhões"**.

### O que muda

Reescrever o conteúdo do FAQ com perguntas organizadas em torno das funcionalidades reais e públicas do site, cobrindo apenas o que o usuário precisa entender para navegar e usar a plataforma.

### Estrutura do FAQ

O FAQ deve ter **no máximo 9 perguntas**.

As perguntas devem focar em uso real e compreensão da plataforma, sem falar de bastidores, administração ou funcionamento interno.

### Temas que devem ser cobertos

- O que é o PqEstudar
- Se é gratuito ou se precisa de conta
- O que o usuário encontra em **Ferramentas**
- O que o usuário encontra em **Concursos**
- Para que serve **Votações**
- O que são os **Produtos**
- Como funcionam os itens salvos, se isso já estiver disponível ao usuário
- Como tirar dúvidas ou entrar em contato, se fizer sentido

### Regras importantes

- **Não incluir nada sobre Premium**
- **Não incluir nada sobre administração, painel, gestão, backend ou bastidores**
- **Não tratar o FAQ como página separada**
- O FAQ deve ser pensado como **seção da home**
- As respostas devem ser claras, diretas e voltadas ao usuário final
- Evitar respostas longas
- Evitar excesso de perguntas
- Pode usar links internos nas respostas quando fizer sentido, como:
  - `/ferramentas`
  - `/concursos`
  - `/votacoes`
  - `/produtos`

### Mudanças no componente

- Inserir o FAQ **na home**
- Posicionar **abaixo da seção "Produtos do PqEstudar"**
- Posicionar **acima da seção "Aprovado por uma Comunidade de Milhões"**
- Manter o padrão visual já usado no site
- Pode manter estrutura em `Accordion` se já existir esse padrão no projeto
- Organizar perguntas de forma limpa, objetiva e escaneável

### Escopo

- Atualizar apenas o necessário para implementar o FAQ **na home**
- Não criar rota nova
- Não criar página `FAQ`
- Não incluir conteúdo sobre Premium neste update
- Limitar o FAQ a **até 9 perguntas**