import { CleaningJobData, CleaningResult } from '../../types';

// Constants for cleaning configuration
const MIN_WORD_COUNT = 20; // Minimum words required to keep content
const MIN_PARAGRAPH_LENGTH = 50; // Minimum characters for meaningful paragraph

/**
 * Cleaning module for processing and sanitizing scraped content
 */
export class CleaningService {
  /**
   * Remove HTML tags and entities
   * 
   * Security Note: This function performs multi-pass sanitization to prevent
   * HTML injection. The output is used only for AI text processing and is never
   * rendered as HTML. Even if malformed HTML remains, it poses no security risk
   * in this context.
   */
  private removeHtmlTags(text: string): string {
    // First pass: remove all complete HTML tags
    let cleaned = text.replace(/<[^>]*>/g, '');
    
    // Second pass: remove any remaining angle brackets (incomplete tags)
    // This addresses CodeQL's incomplete-multi-character-sanitization concern
    cleaned = cleaned.replace(/</g, '').replace(/>/g, '');
    
    // Third pass: decode HTML entities
    return cleaned
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&apos;/g, "'") // Replace &apos; with '
      .replace(/&lt;/g, '') // Remove &lt; (< already removed)
      .replace(/&gt;/g, '') // Remove &gt; (> already removed)
      .replace(/&amp;/g, '&'); // Replace &amp; with &
  }

  /**
   * Remove multiple spaces and normalize whitespace
   */
  private normalizeWhitespace(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n\n') // Normalize multiple line breaks
      .trim();
  }

  /**
   * Remove common ads and promotional content patterns
   */
  private removeAdsPatterns(text: string): string {
    const adsPatterns = [
      /\b(advertisement|sponsored|promoted content|click here|buy now|subscribe now)\b/gi,
      /\b(publicidade|patrocinado|anúncio|clique aqui|compre agora|assine já)\b/gi,
      /\[\s*(ad|ads|advertisement|publicidade)\s*\]/gi,
    ];

    let cleanedText = text;
    adsPatterns.forEach((pattern) => {
      cleanedText = cleanedText.replace(pattern, '');
    });

    return cleanedText;
  }

  /**
   * Remove navigation and UI text patterns
   */
  private removeNavigationPatterns(text: string): string {
    const navPatterns = [
      /\b(home|about|contact|menu|search|login|register|sign in|sign up)\b/gi,
      /\b(início|sobre|contato|busca|entrar|cadastrar|menu)\b/gi,
      /\b(cookie policy|privacy policy|terms of service|política de privacidade|termos de uso)\b/gi,
      /\b(share on|follow us|subscribe|compartilhar|siga-nos|inscreva-se)\b/gi,
    ];

    let cleanedText = text;
    navPatterns.forEach((pattern) => {
      // Only remove if it's a short isolated phrase
      const lines = cleanedText.split('\n');
      cleanedText = lines
        .filter((line) => {
          if (line.length < 50 && pattern.test(line)) {
            return false;
          }
          return true;
        })
        .join('\n');
    });

    return cleanedText;
  }

  /**
   * Remove URLs from text
   */
  private removeUrls(text: string): string {
    return text.replace(/https?:\/\/[^\s]+/g, '');
  }

  /**
   * Remove email addresses
   */
  private removeEmails(text: string): string {
    return text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
  }

  /**
   * Remove special characters but keep essential punctuation
   */
  private removeSpecialCharacters(text: string): string {
    // Keep: letters, numbers, basic punctuation (. , ! ? ; : - ' ")
    // Remove: other special characters
    return text.replace(/[^\w\s.,!?;:\-'"áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/g, '');
  }

  /**
   * Extract meaningful paragraphs (filter out very short ones)
   */
  private extractMeaningfulParagraphs(text: string, minLength: number = MIN_PARAGRAPH_LENGTH): string {
    const paragraphs = text.split('\n\n');
    const meaningful = paragraphs.filter((p) => {
      const trimmed = p.trim();
      // Keep paragraphs that are long enough and contain meaningful content
      return trimmed.length >= minLength && /[a-zA-Z]{3,}/.test(trimmed);
    });
    return meaningful.join('\n\n');
  }

  /**
   * Clean a single text content
   */
  cleanText(text: string): string {
    let cleaned = text;

    // Step 1: Remove HTML tags and entities
    cleaned = this.removeHtmlTags(cleaned);

    // Step 2: Remove ads patterns
    cleaned = this.removeAdsPatterns(cleaned);

    // Step 3: Remove navigation patterns
    cleaned = this.removeNavigationPatterns(cleaned);

    // Step 4: Remove URLs and emails
    cleaned = this.removeUrls(cleaned);
    cleaned = this.removeEmails(cleaned);

    // Step 5: Remove special characters
    cleaned = this.removeSpecialCharacters(cleaned);

    // Step 6: Normalize whitespace
    cleaned = this.normalizeWhitespace(cleaned);

    // Step 7: Extract meaningful paragraphs
    cleaned = this.extractMeaningfulParagraphs(cleaned);

    return cleaned;
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Execute cleaning job
   */
  async execute(data: CleaningJobData): Promise<CleaningResult> {
    const cleanedContent = data.scrapingResult.results.map((item) => {
      const cleanText = this.cleanText(item.content);
      const wordCount = this.countWords(cleanText);

      return {
        url: item.url,
        title: item.title,
        cleanText,
        wordCount,
      };
    });

    // Filter out items with insufficient content
    const filtered = cleanedContent.filter((item) => item.wordCount > MIN_WORD_COUNT);

    return {
      jobId: data.jobId,
      cleanedContent: filtered,
      processedAt: new Date(),
    };
  }
}

// Export singleton instance
export const cleaningService = new CleaningService();
