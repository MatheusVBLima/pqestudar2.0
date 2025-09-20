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
      "ENEM 2025: Inep anuncia mudanças no formato das provas",
      "Cronograma oficial do ENEM 2025 é divulgado pelo MEC",
      "Inscrições do ENEM 2025 começam em maio com novidades",
      "ENEM 2025 terá novo modelo de correção da redação",
      "Resultado do ENEM 2024 já disponível para consulta"
    ],
    "Concursos": [
      "Concurso {org} 2025: {num} vagas com salário de R$ {salary}",
      "Edital do concurso {org} prevê provas para março de 2025",
      "Inscrições abertas para concurso {org} até fevereiro",
      "Resultado final do concurso {org} será divulgado em abril",
      "Novo concurso federal oferece estabilidade e benefícios"
    ],
    "SISU": [
      "SISU 2025: MEC divulga novo calendário com mudanças importantes",
      "Inscrições do SISU 2025 começam no dia {date} de fevereiro",
      "SISU 2025: lista de espera terá novo formato de convocação",
      "Notas de corte parciais do SISU 2025 já estão disponíveis",
      "SISU 2025: universidades federais ampliam número de vagas"
    ],
    "ProUni": [
      "ProUni 2025: {num} mil bolsas disponíveis em todo o país",
      "Cronograma do ProUni 2025 é confirmado pelo MEC",
      "Lista de espera do ProUni 2025 será liberada em março",
      "ProUni 2025: novas regras beneficiam estudantes de baixa renda",
      "Inscrições do ProUni 2025 começam após resultado do SISU"
    ],
    "FIES": [
      "FIES 2025: novas condições facilitam acesso ao financiamento",
      "Cronograma do FIES 2025 prevê inscrições para abril",
      "FIES 2025: juros reduzidos para cursos prioritários",
      "Renovação do FIES 2025 tem prazo estendido até março",
      "FIES 2025: ampliação de vagas para cursos de saúde"
    ],
    "Vestibular": [
      "Vestibular {univ} 2025: {num} vagas em cursos de graduação",
      "Calendário do vestibular {univ} 2025 é divulgado",
      "Provas do vestibular {univ} 2025 serão aplicadas em {date}",
      "Resultado do vestibular {univ} 2025 sai no final de março",
      "{univ} oferece novo sistema de ingresso para 2025"
    ],
    "Educação": [
      "MEC anuncia R$ 15 bilhões para educação básica em 2025",
      "Novo Ensino Médio: implementação completa até dezembro de 2025",
      "PNAE 2025: cardápio escolar ganha novos itens nutritivos",
      "Programa Mais Alfabetização amplia atendimento para 2025",
      "Base Nacional Comum Curricular: novas diretrizes para 2025"
    ]
  };

  private static descriptions = [
    "O MEC divulgou mudanças importantes nos processos seletivos de 2025 que impactam milhões de estudantes brasileiros.",
    "Cronograma atualizado traz novas datas e procedimentos para garantir maior transparência no processo seletivo.",
    "Estudantes têm até o final do mês para se inscrever. Documentação deve estar completa e atualizada.",
    "Novas diretrizes visam ampliar o acesso ao ensino superior e democratizar as oportunidades educacionais.",
    "Programa governamental oferece milhares de vagas em universidades públicas e privadas de todo o país.",
    "Alterações no edital beneficiam estudantes de escola pública e baixa renda com critérios mais inclusivos.",
    "Plataforma digital facilita inscrições e acompanhamento dos processos seletivos em tempo real.",
    "Resultados preliminares já estão disponíveis para consulta no portal oficial do programa."
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
    const currentYear = new Date().getFullYear();
    const contentTemplates: Record<string, string[]> = {
      "ENEM": [
        `<div class="bg-muted/50 p-4 rounded-lg mb-6 italic">
           <p class="text-lg font-medium">O Inep confirmou as principais mudanças no ENEM ${currentYear}, incluindo novo formato das questões e cronograma atualizado para beneficiar estudantes de todo o país.</p>
         </div>
         
         <div class="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
           <h3 class="text-lg font-semibold mb-4 flex items-center">📅 Datas Principais</h3>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>📝 <strong>Inscrições:</strong> 15 a 22 de maio</div>
             <div>💰 <strong>Pagamento:</strong> até 27 de maio</div>
             <div>📚 <strong>Provas:</strong> 9 e 16 de novembro</div>
             <div>📊 <strong>Resultado:</strong> 15 de janeiro de ${currentYear + 1}</div>
           </div>
         </div>
         
         <p class="mb-4">O Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira (Inep) divulgou o cronograma completo do ENEM ${currentYear}, com importantes atualizações no processo de inscrição e aplicação das provas.</p>
         
         <h3 class="text-xl font-semibold mb-3 text-foreground">🎯 Dicas e Orientações Práticas</h3>
         <ul class="list-disc ml-6 mb-6 space-y-2">
           <li>Mantenha seus documentos pessoais atualizados antes da inscrição</li>
           <li>Solicite isenção da taxa se você atender aos critérios</li>
           <li>Escolha a cidade de prova mais próxima de sua residência</li>
           <li>Prepare-se com antecedência usando os materiais oficiais</li>
           <li>Acompanhe as atualizações pelo aplicativo oficial do ENEM</li>
         </ul>
         
         <div class="bg-accent p-4 rounded-lg mb-6 text-center">
           <button class="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
             📱 Acessar Portal do ENEM
           </button>
         </div>`,
         
        `<div class="bg-muted/50 p-4 rounded-lg mb-6 italic">
           <p class="text-lg font-medium">Novo sistema de correção da redação do ENEM ${currentYear} promete maior transparência e agilidade na divulgação dos resultados.</p>
         </div>
         
         <div class="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
           <h3 class="text-lg font-semibold mb-4 flex items-center">📅 Cronograma da Redação</h3>
           <div class="space-y-2">
             <div>✍️ <strong>Aplicação:</strong> 9 de novembro (domingo)</div>
             <div>🔍 <strong>Correção:</strong> novembro a dezembro</div>
             <div>📋 <strong>Divulgação:</strong> junto com as demais notas</div>
             <div>📝 <strong>Recursos:</strong> 20 a 24 de janeiro de ${currentYear + 1}</div>
           </div>
         </div>
         
         <p class="mb-4">O ENEM ${currentYear} traz inovações importantes no processo de correção da redação, com foco na transparência e qualidade da avaliação dos textos dos candidatos.</p>`
      ],
      "SISU": [
        `<div class="bg-muted/50 p-4 rounded-lg mb-6 italic">
           <p class="text-lg font-medium">O MEC divulgou o novo calendário do SISU ${currentYear} com mudanças importantes nas inscrições e chamadas para universidades públicas.</p>
         </div>
         
         <div class="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
           <h3 class="text-lg font-semibold mb-4 flex items-center">📅 Datas Principais</h3>
           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>📝 <strong>Inscrições:</strong> 15 a 22 de fevereiro</div>
             <div>📢 <strong>Resultado:</strong> 28 de fevereiro</div>
             <div>📋 <strong>Matrícula:</strong> 3 a 7 de março</div>
             <div>🔄 <strong>Lista de espera:</strong> 10 a 17 de março</div>
           </div>
         </div>
         
         <p class="mb-4">O Sistema de Seleção Unificada (SISU) ${currentYear} oferece mais de 250 mil vagas em universidades federais de todo o país, com novidades importantes no processo de seleção.</p>
         
         <h3 class="text-xl font-semibold mb-3 text-foreground">🎯 Dicas e Orientações Práticas</h3>
         <ul class="list-disc ml-6 mb-6 space-y-2">
           <li>Escolha opções com base na nota de corte parcial</li>
           <li>Confira documentos exigidos pela universidade</li>
           <li>Alterações podem ser feitas até o último dia</li>
           <li>Monitore as notas de corte diariamente</li>
           <li>Tenha um plano B com a lista de espera</li>
         </ul>
         
         <div class="bg-accent p-4 rounded-lg mb-6 text-center">
           <button class="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
             🎓 Acessar Portal do SISU
           </button>
         </div>`
      ],
      "Concursos": [
        `<div class="bg-muted/50 p-4 rounded-lg mb-6 italic">
           <p class="text-lg font-medium">Novo concurso público oferece 1.500 vagas com salários de até R$ 12.000, com inscrições abertas até março de ${currentYear}.</p>
         </div>
         
         <div class="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
           <h3 class="text-lg font-semibold mb-4 flex items-center">📅 Cronograma do Concurso</h3>
           <div class="space-y-2">
             <div>📝 <strong>Inscrições:</strong> 1º a 28 de março</div>
             <div>📚 <strong>Provas objetivas:</strong> 15 de maio</div>
             <div>✍️ <strong>Prova discursiva:</strong> 16 de maio</div>
             <div>📊 <strong>Resultado final:</strong> 30 de julho</div>
           </div>
         </div>
         
         <p class="mb-4">Este concurso representa uma excelente oportunidade para quem busca estabilidade e crescimento profissional no serviço público federal.</p>`
      ]
    };

    const defaultContent = `<div class="bg-muted/50 p-4 rounded-lg mb-6 italic">
                           <p class="text-lg font-medium">Informações importantes sobre educação que impactam estudantes e profissionais de todo o país.</p>
                         </div>
                         <p class="mb-4">Acompanhe as atualizações e não perca prazos importantes para sua formação acadêmica e desenvolvimento profissional.</p>`;

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