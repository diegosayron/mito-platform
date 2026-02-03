import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer, { Browser, Page } from 'puppeteer';
import config from '../../config';
import { ScrapingJobData, ScrapingResult } from '../../types';

/**
 * Scraping module for web content collection
 * Supports both static and dynamic web scraping
 */
export class ScrapingService {
  private browser: Browser | null = null;

  /**
   * Initialize Puppeteer browser
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  /**
   * Close browser instance
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Perform Google search and scrape results
   */
  async scrapeFromSearch(query: string, maxPages: number = 5): Promise<ScrapingResult['results']> {
    const results: ScrapingResult['results'] = [];
    
    try {
      // Simple approach: scrape from multiple sources based on query
      // In production, you might want to use Google Custom Search API or similar
      const searchResults = await this.performSearch(query);
      
      // Scrape content from each result URL
      for (const url of searchResults.slice(0, maxPages)) {
        try {
          const content = await this.scrapeUrl(url);
          if (content) {
            results.push(content);
          }
        } catch (error) {
          console.error(`Error scraping ${url}:`, error);
          // Continue with next URL
        }
      }
    } catch (error) {
      console.error('Error in scrapeFromSearch:', error);
      throw error;
    }

    return results;
  }

  /**
   * Perform a search to get URLs (simplified version)
   * In production, use Google Custom Search API or similar service
   */
  private async performSearch(query: string): Promise<string[]> {
    // This is a placeholder implementation
    // In production, integrate with:
    // - Google Custom Search API
    // - Bing Search API
    // - DuckDuckGo API
    // - Or scrape search engine results (be careful with ToS)
    
    const urls: string[] = [];
    
    try {
      // Example: Use DuckDuckGo HTML version (respects robots.txt)
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': config.scraping.userAgent,
        },
        timeout: config.scraping.timeout,
      });

      const $ = cheerio.load(response.data);
      
      // Extract URLs from search results
      $('.result__url').each((_, element) => {
        const url = $(element).attr('href');
        if (url && url.startsWith('http')) {
          urls.push(url);
        }
      });
    } catch (error) {
      console.error('Error performing search:', error);
      // Fallback: return empty array
    }

    return urls;
  }

  /**
   * Scrape content from a specific URL
   */
  async scrapeUrl(url: string): Promise<ScrapingResult['results'][0] | null> {
    try {
      // Try static scraping first (faster)
      const staticResult = await this.scrapeStatic(url);
      if (staticResult) {
        return staticResult;
      }

      // Fall back to dynamic scraping if static fails or returns insufficient content
      const dynamicResult = await this.scrapeDynamic(url);
      return dynamicResult;
    } catch (error) {
      console.error(`Error scraping URL ${url}:`, error);
      return null;
    }
  }

  /**
   * Static scraping using Axios + Cheerio (faster, for static sites)
   */
  private async scrapeStatic(url: string): Promise<ScrapingResult['results'][0] | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': config.scraping.userAgent,
        },
        timeout: config.scraping.timeout,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      // Remove unwanted elements
      $('script, style, nav, header, footer, .advertisement, .ads').remove();

      // Extract title
      const title = $('title').text().trim() || 
                   $('h1').first().text().trim() || 
                   'Untitled';

      // Extract main content
      // Try common content selectors
      let content = '';
      const contentSelectors = [
        'article',
        'main',
        '.content',
        '.post-content',
        '.article-content',
        '#content',
        '.entry-content',
      ];

      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          if (content.length > config.content.minContentLength) {
            break;
          }
        }
      }

      // Fallback: get all paragraph text
      if (content.length < config.content.minContentLength) {
        content = $('p').map((_, el) => $(el).text().trim()).get().join('\n\n');
      }

      // Extract date if available
      const dateSelectors = ['time', '.date', '.published', '[datetime]'];
      let sourceDate: string | undefined;
      for (const selector of dateSelectors) {
        const dateEl = $(selector);
        if (dateEl.length > 0) {
          sourceDate = dateEl.attr('datetime') || dateEl.text().trim();
          break;
        }
      }

      if (content.length < config.content.minContentLength) {
        return null;
      }

      return {
        url,
        title,
        content,
        sourceDate,
      };
    } catch (error) {
      // Return null to trigger dynamic scraping fallback
      return null;
    }
  }

  /**
   * Dynamic scraping using Puppeteer (slower, for JS-heavy sites)
   */
  private async scrapeDynamic(url: string): Promise<ScrapingResult['results'][0] | null> {
    let page: Page | null = null;

    try {
      const browser = await this.initBrowser();
      page = await browser.newPage();

      await page.setUserAgent(config.scraping.userAgent);
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: config.scraping.timeout,
      });

      // Wait for content to load
      await page.waitForSelector('body', { timeout: 5000 });

      // Extract content
      const data = await page.evaluate(() => {
        // Remove unwanted elements
        const unwanted = document.querySelectorAll(
          'script, style, nav, header, footer, .advertisement, .ads'
        );
        unwanted.forEach((el) => el.remove());

        // Get title
        const title = document.title || 
                     document.querySelector('h1')?.textContent || 
                     'Untitled';

        // Get main content
        const contentSelectors = [
          'article',
          'main',
          '.content',
          '.post-content',
          '.article-content',
          '#content',
          '.entry-content',
        ];

        let content = '';
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent) {
            content = element.textContent.trim();
            if (content.length > 100) break;
          }
        }

        // Fallback to paragraphs
        if (!content || content.length < 100) {
          const paragraphs = Array.from(document.querySelectorAll('p'));
          content = paragraphs.map((p) => p.textContent?.trim() || '').join('\n\n');
        }

        // Get date
        const dateEl = document.querySelector('time, .date, .published, [datetime]');
        const sourceDate = dateEl?.getAttribute('datetime') || dateEl?.textContent || undefined;

        return { title, content, sourceDate };
      });

      await page.close();

      if (data.content.length < config.content.minContentLength) {
        return null;
      }

      return {
        url,
        title: data.title.trim(),
        content: data.content,
        sourceDate: data.sourceDate,
      };
    } catch (error) {
      if (page) {
        await page.close();
      }
      console.error(`Dynamic scraping error for ${url}:`, error);
      return null;
    }
  }

  /**
   * Execute scraping job
   */
  async execute(data: ScrapingJobData): Promise<ScrapingResult> {
    const results = await this.scrapeFromSearch(
      data.query,
      data.maxPages || config.scraping.maxPages
    );

    const sources = results.map((r) => r.url);

    return {
      jobId: data.jobId,
      query: data.query,
      results,
      sources,
      scrapedAt: new Date(),
    };
  }
}

// Export singleton instance
export const scrapingService = new ScrapingService();
