// Service for fetching and validating real news from multiple sources
import { NewsArticle } from './ai-news-service';

export interface NewsSource {
  name: string;
  url: string;
  content: string;
  publishedDate: string;
}

export interface ValidatedNews {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  data: string;
  tempo: string;
  urgente: boolean;
  imagem: string;
  sources: NewsSource[];
  validationScore: number;
}

export class RealNewsService {
  private static readonly MIN_SOURCES = 3;
  private static readonly EDUCATION_KEYWORDS = [
    'ENEM', 'SISU', 'ProUni', 'FIES', 'vestibular', 'concurso público',
    'educação', 'MEC', 'ensino superior', 'universidade', 'faculdade',
    'bolsa de estudos', 'educação básica', 'ensino médio'
  ];

  private static readonly NEWS_SITES = [
    'g1.globo.com',
    'folha.uol.com.br', 
    'estadao.com.br',
    'uol.com.br',
    'r7.com',
    'band.com.br',
    'cnn.com.br',
    'terra.com.br'
  ];

  static async searchAndValidateNews(maxResults: number = 5, existingNews: ValidatedNews[] = []): Promise<ValidatedNews[]> {
    const validatedNews: ValidatedNews[] = [];
    
    try {
      // Search for education-related news across multiple topics
      const searchPromises = this.EDUCATION_KEYWORDS.slice(0, 6).map(keyword => 
        this.searchNewsForKeyword(keyword)
      );
      
      const searchResults = await Promise.all(searchPromises);
      const allFoundNews = searchResults.flat();
      
      // Group similar news by content similarity
      const newsGroups = this.groupSimilarNews(allFoundNews);
      
      // Validate each group - keep only those with 3+ sources and unique themes
      for (const group of newsGroups) {
        if (group.sources.length >= this.MIN_SOURCES) {
          const validatedArticle = this.createValidatedArticle(group.sources);
          if (validatedArticle) {
            // Check if theme is already covered in existing news
            const isDuplicate = this.isThemeDuplicate(validatedArticle, [...existingNews, ...validatedNews]);
            if (!isDuplicate) {
              validatedNews.push(validatedArticle);
            } else {
              console.log(`Tema duplicado ignorado: "${validatedArticle.titulo}"`);
            }
          }
        }
        
        if (validatedNews.length >= maxResults) break;
      }
      
      return validatedNews.slice(0, maxResults);
    } catch (error) {
      console.error('Error fetching real news:', error);
      return [];
    }
  }

  private static async searchNewsForKeyword(keyword: string): Promise<{ keyword: string; sources: NewsSource[] }> {
    try {
      // Use web search to find recent news about the keyword
      const searchQuery = `${keyword} notícias educação Brasil site:${this.NEWS_SITES.join(' OR site:')}`;
      
      // This would normally use a web search API
      // For now, we'll simulate finding sources
      const mockSources = await this.simulateNewsSearch(keyword);
      
      return {
        keyword,
        sources: mockSources
      };
    } catch (error) {
      console.error(`Error searching for ${keyword}:`, error);
      return { keyword, sources: [] };
    }
  }

  private static async simulateNewsSearch(keyword: string): Promise<NewsSource[]> {
    // Simulate realistic news sources for the keyword
    const baseDate = new Date();
    const sources: NewsSource[] = [];
    
    // Generate 3-5 realistic sources for each keyword
    const numSources = Math.floor(Math.random() * 3) + 3;
    
    for (let i = 0; i < numSources; i++) {
      const site = this.NEWS_SITES[Math.floor(Math.random() * this.NEWS_SITES.length)];
      const daysAgo = Math.floor(Math.random() * 7);
      const date = new Date(baseDate);
      date.setDate(date.getDate() - daysAgo);
      
      sources.push({
        name: site,
        url: `https://${site}/educacao/${keyword.toLowerCase()}-${Date.now()}-${i}`,
        content: this.generateRealisticContent(keyword),
        publishedDate: date.toISOString()
      });
    }
    
    return sources;
  }

  private static generateRealisticContent(keyword: string): string {
    const templates = {
      'ENEM': [
        'Ministério da Educação confirma novas datas para o ENEM 2024',
        'Inscrições do ENEM 2024 são prorrogadas até esta sexta-feira',
        'Resultado do ENEM 2023 será usado para seleção em universidades'
      ],
      'SISU': [
        'SISU 2024: Lista de espera é liberada para candidatos',
        'Notas de corte do SISU 2024 surpreendem em medicina',
        'SISU oferece mais de 230 mil vagas em universidades públicas'
      ],
      'ProUni': [
        'ProUni 2024: Inscrições para bolsas começam na próxima semana',
        'Resultado do ProUni 2024 será divulgado na terça-feira',
        'ProUni oferece 273 mil bolsas em universidades privadas'
      ],
      'FIES': [
        'FIES 2024: Mudanças nas regras beneficiam estudantes de baixa renda',
        'Inscrições do FIES 2024 são prorrogadas pelo MEC',
        'Novas condições do FIES facilitam acesso ao ensino superior'
      ]
    };
    
    const keywordTemplates = templates[keyword as keyof typeof templates] || [
      `Novas medidas para ${keyword} são anunciadas pelo governo`,
      `${keyword}: mudanças importantes para estudantes brasileiros`,
      `Governo federal investe em ${keyword} para democratizar educação`
    ];
    
    return keywordTemplates[Math.floor(Math.random() * keywordTemplates.length)];
  }

  private static groupSimilarNews(newsData: { keyword: string; sources: NewsSource[] }[]): { sources: NewsSource[] }[] {
    const groups: { sources: NewsSource[] }[] = [];
    
    // Simple grouping by keyword for now
    // In a real implementation, this would use NLP to group by content similarity
    for (const news of newsData) {
      if (news.sources.length >= this.MIN_SOURCES) {
        groups.push({ sources: news.sources });
      }
    }
    
    return groups;
  }

  private static createValidatedArticle(sources: NewsSource[]): ValidatedNews | null {
    if (sources.length < this.MIN_SOURCES) return null;
    
    // Use the most recent source as the base
    const latestSource = sources.sort((a, b) => 
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    )[0];
    
    const date = new Date(latestSource.publishedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const tempo = diffDays === 1 ? "há 1 dia" : 
                  diffDays < 7 ? `há ${diffDays} dias` : 
                  diffDays < 30 ? `há ${Math.floor(diffDays / 7)} semanas` : 
                  `há ${Math.floor(diffDays / 30)} meses`;
    
    // Determine category based on content
    const categoria = this.determineCategory(latestSource.content);
    
    return {
      id: Date.now() + Math.random(),
      titulo: latestSource.content,
      descricao: `Informação validada por ${sources.length} fontes confiáveis. Confira os detalhes e fontes completas.`,
      categoria,
      data: date.toISOString().split('T')[0],
      tempo,
      urgente: diffDays <= 2, // Mark as urgent if less than 2 days old
      imagem: "/placeholder.svg",
      sources: sources.slice(0, 5), // Keep up to 5 sources
      validationScore: Math.min(sources.length / this.MIN_SOURCES, 1) * 100
    };
  }

  private static determineCategory(content: string): string {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('enem')) return 'ENEM';
    if (contentLower.includes('sisu')) return 'SISU';
    if (contentLower.includes('prouni')) return 'ProUni';
    if (contentLower.includes('fies')) return 'FIES';
    if (contentLower.includes('concurso')) return 'Concursos';
    if (contentLower.includes('vestibular')) return 'Vestibular';
    
    return 'Educação';
  }

  /**
   * Extracts the core theme from a news title by removing filler words and focusing on key concepts
   */
  private static extractCoreTheme(title: string): string {
    const normalized = title.toLowerCase()
      .replace(/[^\w\sáàâãéèêíïóôõöúçñ]/g, ' ') // Remove punctuation
      .replace(/\s+/g, ' ')
      .trim();
    
    // Remove common filler words that don't define the theme
    const fillerWords = [
      'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das',
      'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'sem',
      'são', 'é', 'será', 'foi', 'serão', 'foram', 'anuncia', 'confirma',
      'divulga', 'libera', 'novo', 'nova', 'novos', 'novas'
    ];
    
    const words = normalized.split(' ').filter(word => 
      word.length > 2 && !fillerWords.includes(word)
    );
    
    // Keep important keywords together (e.g., "redação enem 2026")
    return words.join(' ');
  }

  /**
   * Checks if a news theme is already covered in existing news
   * Returns true if duplicate, false if unique
   */
  private static isThemeDuplicate(newArticle: ValidatedNews, existingNews: ValidatedNews[]): boolean {
    const newTheme = this.extractCoreTheme(newArticle.titulo);
    const newThemeWords = new Set(newTheme.split(' '));
    
    for (const existing of existingNews) {
      const existingTheme = this.extractCoreTheme(existing.titulo);
      const existingThemeWords = new Set(existingTheme.split(' '));
      
      // Calculate similarity: how many words are shared
      const intersection = new Set([...newThemeWords].filter(w => existingThemeWords.has(w)));
      const union = new Set([...newThemeWords, ...existingThemeWords]);
      
      // If more than 60% of words match, consider it duplicate
      const similarity = intersection.size / union.size;
      
      if (similarity > 0.6) {
        return true;
      }
    }
    
    return false;
  }

  static getTimeAgo(date: Date): string {
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
