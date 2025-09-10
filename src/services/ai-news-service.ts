// Service for generating AI-powered news content about education
export interface NewsArticle {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  data: string;
  tempo: string;
  urgente: boolean;
  imagem: string;
  conteudoCompleto?: string;
  autor?: string;
  visualizacoes?: number;
  tags?: string[];
  fontes?: Array<{ nome: string; url: string }>;
}

export class AINewsService {
  private static newsTopics = [
    "ENEM",
    "Concursos",
    "SISU", 
    "ProUni",
    "FIES",
    "Vestibular",
    "Educação"
  ];

  private static newsTemplates: Record<string, string[]> = {
    "ENEM": [
      "Resultado do ENEM {year} será divulgado em {month}",
      "Inscrições para o ENEM {year} começam na próxima semana",
      "Datas do ENEM {year} são confirmadas pelo Inep",
      "Novas regras do ENEM {year} são anunciadas",
      "Gabarito do ENEM {year} já está disponível"
    ],
    "Concursos": [
      "Inscrições abertas para concurso da {org} {year}",
      "Resultado do concurso {org} será divulgado",
      "Edital de concurso público oferece {num} vagas",
      "Provas do concurso {org} são adiadas",
      "Novo concurso público com salário de R$ {salary}"
    ],
    "SISU": [
      "Novo cronograma do SISU {year} é divulgado",
      "Inscrições do SISU {year} começam em {date}",
      "Lista de espera do SISU {year} é liberada",
      "Notas de corte do SISU {year} surpreendem",
      "SISU {year}: confira as universidades participantes"
    ],
    "ProUni": [
      "ProUni: Inscrições para bolsas começam na próxima semana",
      "Resultado do ProUni {year} será divulgado",
      "ProUni oferece mais de {num} mil bolsas",
      "Lista de espera do ProUni {year} é liberada",
      "Novas regras do ProUni {year} são anunciadas"
    ],
    "FIES": [
      "Mudanças no Fies {year}: novas regras para financiamento",
      "Inscrições do FIES {year} são prorrogadas",
      "FIES {year}: confira os cursos disponíveis",
      "Resultado da seleção do FIES será divulgado",
      "Novas condições do FIES beneficiam estudantes"
    ],
    "Vestibular": [
      "Vestibular {univ} {year}: inscrições abertas",
      "Datas do vestibular {univ} são confirmadas",
      "Prova do vestibular {univ} será aplicada em {date}",
      "Resultado do vestibular {univ} surpreende",
      "Vestibular {univ} oferece {num} vagas"
    ],
    "Educação": [
      "MEC anuncia mudanças na educação básica",
      "Novo programa de bolsas estudantis é lançado",
      "Reforma do ensino médio entra em vigor",
      "Investimento em educação aumenta em {percent}%",
      "Nova base curricular é aprovada"
    ]
  };

  private static descriptions = [
    "O Ministério da Educação divulgou informações importantes sobre os próximos processos seletivos e programas educacionais.",
    "As inscrições estão abertas por tempo limitado. Confira todos os detalhes e não perca os prazos.",
    "Mudanças significativas foram anunciadas para beneficiar estudantes de todo o país.",
    "O cronograma oficial foi confirmado com todas as datas importantes do processo.",
    "Novas oportunidades de acesso ao ensino superior são disponibilizadas.",
    "Programa oferece bolsas e financiamentos para democratizar o acesso à educação.",
    "Estudantes devem ficar atentos aos prazos e documentação necessária.",
    "Resultados serão divulgados na plataforma oficial do programa."
  ];

  private static organizations = [
    "PRF", "PF", "Receita Federal", "INSS", "Banco do Brasil", 
    "Caixa Econômica", "TRT", "TRF", "MPU", "IBGE"
  ];

  private static universities = [
    "USP", "UNICAMP", "UFRJ", "UFMG", "UnB", "UFSC", "UFRGS", "UFC"
  ];

  static generateNews(count: number = 5): NewsArticle[] {
    const news: NewsArticle[] = [];
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < count; i++) {
      const categoria = this.getRandomItem(this.newsTopics);
      const template = this.getRandomItem(this.newsTemplates[categoria]);
      const description = this.getRandomItem(this.descriptions);
      
      const titulo = this.fillTemplate(template, currentYear);
      const data = this.getRandomDate();
      const tempo = this.getTimeAgo(data);
      const conteudoCompleto = this.generateFullContent(categoria, titulo);
      
      news.push({
        id: Date.now() + i,
        titulo,
        descricao: description,
        categoria,
        data: data.toISOString().split('T')[0],
        tempo,
        urgente: Math.random() < 0.3, // 30% chance of being urgent
        imagem: "/placeholder.svg",
        conteudoCompleto,
        autor: this.getRandomAuthor(categoria),
        visualizacoes: Math.floor(Math.random() * 50000) + 1000,
        tags: this.generateTags(categoria),
        fontes: this.generateSources(categoria)
      });
    }
    
    return news.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }

  private static generateFullContent(categoria: string, titulo: string): string {
    const contentTemplates: Record<string, string[]> = {
      "ENEM": [
        `<p class="mb-4">O Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira (Inep) divulgou informações atualizadas sobre o Exame Nacional do Ensino Médio (ENEM).</p>
         <h3 class="text-xl font-semibold mb-3 text-foreground">Detalhes Importantes</h3>
         <p class="mb-4">Os estudantes devem ficar atentos aos prazos e procedimentos necessários para participar do processo seletivo.</p>
         <ul class="list-disc ml-6 mb-4">
           <li>Documentação necessária deve estar em ordem</li>
           <li>Inscrições devem ser realizadas no prazo</li>
           <li>Taxas de inscrição podem ter isenção para estudantes de baixa renda</li>
         </ul>`,
        `<p class="mb-4">O ENEM continua sendo a principal porta de entrada para o ensino superior no Brasil, oferecendo oportunidades em universidades públicas e privadas.</p>
         <h3 class="text-xl font-semibold mb-3 text-foreground">Cronograma</h3>
         <p class="mb-4">É fundamental que os candidatos acompanhem o cronograma oficial para não perder prazos importantes.</p>`
      ],
      "Concursos": [
        `<p class="mb-4">Um novo concurso público foi anunciado com excelentes oportunidades de carreira no serviço público.</p>
         <h3 class="text-xl font-semibold mb-3 text-foreground">Requisitos</h3>
         <ul class="list-disc ml-6 mb-4">
           <li>Ensino superior completo</li>
           <li>Idade mínima de 18 anos</li>
           <li>Estar em dia com as obrigações eleitorais</li>
         </ul>`,
        `<p class="mb-4">As oportunidades no serviço público oferecem estabilidade e benefícios atrativos para os aprovados.</p>
         <h3 class="text-xl font-semibold mb-3 text-foreground">Etapas do Processo</h3>
         <p class="mb-4">O processo seletivo será composto por múltiplas etapas eliminatórias e classificatórias.</p>`
      ],
      "SISU": [
        `<p class="mb-4">O Sistema de Seleção Unificada (SISU) é a principal forma de acesso às universidades públicas brasileiras.</p>
         <h3 class="text-xl font-semibold mb-3 text-foreground">Como Participar</h3>
         <p class="mb-4">Para participar do SISU, é necessário ter participado do ENEM e não ter zerado a redação.</p>`,
        `<p class="mb-4">As notas de corte do SISU variam conforme a concorrência de cada curso e universidade.</p>
         <h3 class="text-xl font-semibold mb-3 text-foreground">Dicas Importantes</h3>
         <p class="mb-4">Escolha suas opções de curso estrategicamente, considerando suas notas e a concorrência.</p>`
      ]
    };

    const defaultContent = `<p class="mb-4">Informações importantes sobre educação que impactam estudantes de todo o país.</p>
                           <h3 class="text-xl font-semibold mb-3 text-foreground">Saiba Mais</h3>
                           <p class="mb-4">Acompanhe as atualizações e não perca prazos importantes para sua formação acadêmica.</p>`;

    const templates = contentTemplates[categoria] || [defaultContent];
    return this.getRandomItem(templates);
  }

  private static getRandomAuthor(categoria: string): string {
    const authors: Record<string, string[]> = {
      "ENEM": ["Ministério da Educação", "Inep", "Portal do MEC"],
      "Concursos": ["Portal de Concursos", "Organizadora do Concurso", "Órgão Público"],
      "SISU": ["Sistema SISU", "MEC", "Portal do Estudante"],
      "ProUni": ["Programa ProUni", "MEC", "Portal do ProUni"],
      "FIES": ["Programa FIES", "MEC", "Caixa Econômica Federal"]
    };
    
    const categoryAuthors = authors[categoria] || ["Portal de Educação"];
    return this.getRandomItem(categoryAuthors);
  }

  private static generateTags(categoria: string): string[] {
    const baseTags = [categoria, "Educação"];
    const additionalTags: Record<string, string[]> = {
      "ENEM": ["Ensino Superior", "Vestibular", "Resultado"],
      "Concursos": ["Serviço Público", "Carreira", "Vagas"],
      "SISU": ["Universidade", "Ensino Superior", "Seleção"],
      "ProUni": ["Bolsa de Estudos", "Ensino Superior", "Financiamento"],
      "FIES": ["Financiamento", "Ensino Superior", "Crédito Estudantil"]
    };
    
    const extra = additionalTags[categoria] || ["Oportunidades"];
    return [...baseTags, ...extra.slice(0, 2)];
  }

  private static generateSources(categoria: string): Array<{ nome: string; url: string }> {
    const sources: Record<string, Array<{ nome: string; url: string }>> = {
      "ENEM": [
        { nome: "Portal do Inep", url: "https://www.gov.br/inep" },
        { nome: "Ministério da Educação", url: "https://www.gov.br/mec" }
      ],
      "Concursos": [
        { nome: "Portal de Concursos Públicos", url: "#" },
        { nome: "Diário Oficial", url: "#" }
      ],
      "SISU": [
        { nome: "Portal do SISU", url: "https://sisu.mec.gov.br" },
        { nome: "MEC", url: "https://www.gov.br/mec" }
      ]
    };
    
    return sources[categoria] || [{ nome: "Portal de Educação", url: "#" }];
  }

  private static getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static fillTemplate(template: string, year: number): string {
    const months = [
      "janeiro", "fevereiro", "março", "abril", "maio", "junho",
      "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    
    return template
      .replace(/{year}/g, year.toString())
      .replace(/{month}/g, this.getRandomItem(months))
      .replace(/{org}/g, this.getRandomItem(this.organizations))
      .replace(/{univ}/g, this.getRandomItem(this.universities))
      .replace(/{num}/g, (Math.floor(Math.random() * 900) + 100).toString())
      .replace(/{salary}/g, (Math.floor(Math.random() * 5000) + 5000).toLocaleString('pt-BR'))
      .replace(/{percent}/g, (Math.floor(Math.random() * 50) + 10).toString())
      .replace(/{date}/g, this.getRandomFutureDate());
  }

  private static getRandomDate(): Date {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30); // Last 30 days
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date;
  }

  private static getRandomFutureDate(): string {
    const now = new Date();
    const daysAhead = Math.floor(Math.random() * 60) + 1; // Next 60 days
    const date = new Date(now);
    date.setDate(date.getDate() + daysAhead);
    return date.toLocaleDateString('pt-BR');
  }

  private static getTimeAgo(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "há 1 dia";
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 14) return "há 1 semana";
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
    return `há ${Math.floor(diffDays / 30)} meses`;
  }
}