// Service for storing and retrieving news articles
import { NewsArticle } from './ai-news-service';
import { ValidatedNews } from './real-news-service';

type StoredNews = NewsArticle | ValidatedNews;

class NewsStorageService {
  private static readonly STORAGE_KEY = 'edu_platform_news';
  private static news: Map<string, StoredNews> = new Map();

  static storeNews(newsArray: StoredNews[]): void {
    newsArray.forEach(news => {
      this.news.set(news.id.toString(), news);
    });
    
    // Also store in localStorage for persistence
    try {
      const newsObject = Object.fromEntries(this.news);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newsObject));
    } catch (error) {
      console.warn('Could not save news to localStorage:', error);
    }
  }

  static getNews(id: string): StoredNews | null {
    // First try to get from memory
    let news = this.news.get(id);
    
    if (!news) {
      // Try to load from localStorage
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const newsObject = JSON.parse(stored);
          news = newsObject[id];
          if (news) {
            this.news.set(id, news);
          }
        }
      } catch (error) {
        console.warn('Could not load news from localStorage:', error);
      }
    }
    
    return news || null;
  }

  static getAllNews(): StoredNews[] {
    // Load from localStorage if memory is empty
    if (this.news.size === 0) {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
          const newsObject = JSON.parse(stored);
          Object.entries(newsObject).forEach(([id, news]) => {
            this.news.set(id, news as StoredNews);
          });
        }
      } catch (error) {
        console.warn('Could not load news from localStorage:', error);
      }
    }
    
    return Array.from(this.news.values());
  }

  static clearNews(): void {
    this.news.clear();
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Could not clear news from localStorage:', error);
    }
  }
}

export default NewsStorageService;