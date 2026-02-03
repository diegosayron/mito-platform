import OpenAI from 'openai';
import config from '../../config';
import { SummaryJobData, SummaryResult } from '../../types';

/**
 * Summary module for AI-powered content summarization
 * Supports OpenAI and can be extended for other AI providers
 */
export class SummaryService {
  private openaiClient: OpenAI | null = null;

  /**
   * Initialize OpenAI client
   */
  private getOpenAIClient(): OpenAI {
    if (!this.openaiClient && config.ai.openaiApiKey) {
      this.openaiClient = new OpenAI({
        apiKey: config.ai.openaiApiKey,
      });
    }

    if (!this.openaiClient) {
      throw new Error('OpenAI API key not configured');
    }

    return this.openaiClient;
  }

  /**
   * Generate summary using OpenAI
   */
  private async generateWithOpenAI(
    content: string,
    maxLength: number
  ): Promise<{ summary: string; keyPoints: string[] }> {
    const client = this.getOpenAIClient();

    const prompt = `Você é um assistente especializado em resumir conteúdos culturais, históricos, religiosos e filosóficos alinhados a valores tradicionais.

Analise o seguinte conteúdo e forneça:
1. Um resumo conciso (máximo ${maxLength} caracteres)
2. Lista de 3-5 pontos-chave principais

Conteúdo:
${content.substring(0, 12000)} // Limit to ~3000 tokens

Formato da resposta:
RESUMO:
[seu resumo aqui]

PONTOS-CHAVE:
- [ponto 1]
- [ponto 2]
- [ponto 3]`;

    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini', // Using cost-effective model
        messages: [
          {
            role: 'system',
            content:
              'Você é um especialista em análise e resumo de conteúdo cultural, histórico, religioso e filosófico.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const result = response.choices[0]?.message?.content || '';

      // Parse the response
      const summaryMatch = result.match(/RESUMO:\s*([\s\S]*?)(?=PONTOS-CHAVE:|$)/i);
      const keyPointsMatch = result.match(/PONTOS-CHAVE:\s*([\s\S]*)/i);

      let summary = summaryMatch ? summaryMatch[1].trim() : result.trim();
      let keyPoints: string[] = [];

      if (keyPointsMatch) {
        keyPoints = keyPointsMatch[1]
          .split('\n')
          .map((line) => line.replace(/^[-*]\s*/, '').trim())
          .filter((line) => line.length > 0);
      }

      // Ensure summary respects max length
      if (summary.length > maxLength) {
        summary = summary.substring(0, maxLength - 3) + '...';
      }

      return { summary, keyPoints };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate summary with OpenAI');
    }
  }

  /**
   * Generate summary using Gemini (Google AI)
   * Note: This is a placeholder for future implementation
   */
  private async generateWithGemini(
    _content: string,
    _maxLength: number
  ): Promise<{ summary: string; keyPoints: string[] }> {
    // Placeholder for Gemini integration
    // You would use @google/generative-ai package here
    throw new Error('Gemini integration not yet implemented');
  }

  /**
   * Combine multiple text contents into one for summarization
   */
  private combineContents(cleanedContent: Array<{ cleanText: string; title: string; url: string }>): string {
    return cleanedContent
      .map((item, index) => {
        return `=== Fonte ${index + 1}: ${item.title} ===\n${item.cleanText}\n\n`;
      })
      .join('\n');
  }

  /**
   * Extract sources from cleaned content
   */
  private extractSources(cleanedContent: Array<{ url: string; title: string }>): string[] {
    return cleanedContent.map((item) => `${item.title} - ${item.url}`);
  }

  /**
   * Execute summary job
   */
  async execute(data: SummaryJobData): Promise<SummaryResult> {
    const maxLength = data.maxLength || config.content.maxSummaryLength;

    // Combine all cleaned content
    const combinedContent = this.combineContents(data.cleaningResult.cleanedContent);

    if (combinedContent.length < config.content.minContentLength) {
      throw new Error('Insufficient content to generate summary');
    }

    // Extract sources
    const sources = this.extractSources(data.cleaningResult.cleanedContent);

    // Try OpenAI first, fallback to Gemini if configured
    let summary: string;
    let keyPoints: string[];
    let aiModel: string;

    try {
      if (config.ai.openaiApiKey) {
        const result = await this.generateWithOpenAI(combinedContent, maxLength);
        summary = result.summary;
        keyPoints = result.keyPoints;
        aiModel = 'openai-gpt-4o-mini';
      } else if (config.ai.geminiApiKey) {
        const result = await this.generateWithGemini(combinedContent, maxLength);
        summary = result.summary;
        keyPoints = result.keyPoints;
        aiModel = 'google-gemini';
      } else {
        throw new Error('No AI service configured (OpenAI or Gemini)');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      // Fallback: create a simple extractive summary
      summary = this.createFallbackSummary(combinedContent, maxLength);
      keyPoints = this.extractFallbackKeyPoints(combinedContent);
      aiModel = 'fallback-extractive';
    }

    return {
      jobId: data.jobId,
      summary,
      keyPoints,
      sources,
      aiModel,
      generatedAt: new Date(),
    };
  }

  /**
   * Create a simple extractive summary as fallback
   */
  private createFallbackSummary(content: string, maxLength: number): string {
    // Take first paragraph or first N characters
    const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);
    
    let summary = '';
    for (const para of paragraphs) {
      if (summary.length + para.length < maxLength) {
        summary += para + '\n\n';
      } else {
        break;
      }
    }

    if (summary.length === 0 && content.length > 0) {
      summary = content.substring(0, maxLength - 3) + '...';
    }

    return summary.trim();
  }

  /**
   * Extract key points as fallback
   */
  private extractFallbackKeyPoints(content: string): string[] {
    // Simple extraction: first sentence of each paragraph
    const paragraphs = content.split('\n\n').filter((p) => p.trim().length > 0);
    const keyPoints = paragraphs
      .slice(0, 5)
      .map((para) => {
        const firstSentence = para.split(/[.!?]/)[0];
        return firstSentence.trim();
      })
      .filter((point) => point.length > 10 && point.length < 200);

    return keyPoints.slice(0, 5);
  }
}

// Export singleton instance
export const summaryService = new SummaryService();
