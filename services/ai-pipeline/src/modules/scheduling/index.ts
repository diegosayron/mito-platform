import axios from 'axios';
import config from '../../config';
import { SchedulingJobData, SchedulingResult } from '../../types';

/**
 * Scheduling module for publishing content to the main API
 */
export class SchedulingService {
  /**
   * Create content in the main API
   */
  private async createContent(contentData: SchedulingJobData['contentData']): Promise<string> {
    try {
      const response = await axios.post(
        `${config.api.mainApiUrl}/api/v1/contents`,
        {
          type: contentData.type,
          title: contentData.title,
          body: contentData.body,
          source: contentData.sources.join(', '),
          media_url: contentData.mediaUrl,
          status: 'draft', // Create as draft first
          tags: this.extractTags(contentData),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(config.api.mainApiSecret && {
              'Authorization': `Bearer ${config.api.mainApiSecret}`,
            }),
          },
          timeout: 10000,
        }
      );

      return response.data.id;
    } catch (error) {
      console.error('Error creating content in main API:', error);
      throw new Error('Failed to create content');
    }
  }

  /**
   * Schedule content for publication
   */
  private async scheduleContent(contentId: string, scheduleAt: Date): Promise<void> {
    try {
      await axios.patch(
        `${config.api.mainApiUrl}/api/v1/contents/${contentId}`,
        {
          status: 'scheduled',
          publish_at: scheduleAt.toISOString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(config.api.mainApiSecret && {
              'Authorization': `Bearer ${config.api.mainApiSecret}`,
            }),
          },
          timeout: 10000,
        }
      );
    } catch (error) {
      console.error('Error scheduling content:', error);
      throw new Error('Failed to schedule content');
    }
  }

  /**
   * Publish content immediately
   */
  private async publishContent(contentId: string): Promise<void> {
    try {
      await axios.patch(
        `${config.api.mainApiUrl}/api/v1/contents/${contentId}`,
        {
          status: 'published',
          publish_at: new Date().toISOString(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(config.api.mainApiSecret && {
              'Authorization': `Bearer ${config.api.mainApiSecret}`,
            }),
          },
          timeout: 10000,
        }
      );
    } catch (error) {
      console.error('Error publishing content:', error);
      throw new Error('Failed to publish content');
    }
  }

  /**
   * Extract tags from content data
   */
  private extractTags(contentData: SchedulingJobData['contentData']): string[] {
    const tags: string[] = [];

    // Add type as tag
    tags.push(contentData.type.toLowerCase());

    // Extract keywords from title (simple approach)
    const titleWords = contentData.title
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 4); // Only words longer than 4 chars

    // Add up to 3 keywords from title
    tags.push(...titleWords.slice(0, 3));

    // Add "ai-generated" tag
    tags.push('ia-gerado');

    return tags;
  }

  /**
   * Execute scheduling job
   */
  async execute(data: SchedulingJobData): Promise<SchedulingResult> {
    // Create content in main API
    const contentId = await this.createContent(data.contentData);

    const result: SchedulingResult = {
      jobId: data.jobId,
      contentId,
      status: 'scheduled',
    };

    // Schedule or publish immediately
    if (data.scheduleAt && data.scheduleAt > new Date()) {
      // Schedule for future publication
      await this.scheduleContent(contentId, data.scheduleAt);
      result.scheduledAt = data.scheduleAt;
    } else {
      // Publish immediately
      await this.publishContent(contentId);
      result.status = 'published';
      result.publishedAt = new Date();
    }

    return result;
  }

  /**
   * Update content status
   */
  async updateContentStatus(
    contentId: string,
    status: 'draft' | 'scheduled' | 'published' | 'hidden'
  ): Promise<void> {
    try {
      await axios.patch(
        `${config.api.mainApiUrl}/api/v1/contents/${contentId}`,
        { status },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(config.api.mainApiSecret && {
              'Authorization': `Bearer ${config.api.mainApiSecret}`,
            }),
          },
          timeout: 10000,
        }
      );
    } catch (error) {
      console.error('Error updating content status:', error);
      throw new Error('Failed to update content status');
    }
  }

  /**
   * Delete content
   */
  async deleteContent(contentId: string): Promise<void> {
    try {
      await axios.delete(
        `${config.api.mainApiUrl}/api/v1/contents/${contentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(config.api.mainApiSecret && {
              'Authorization': `Bearer ${config.api.mainApiSecret}`,
            }),
          },
          timeout: 10000,
        }
      );
    } catch (error) {
      console.error('Error deleting content:', error);
      throw new Error('Failed to delete content');
    }
  }
}

// Export singleton instance
export const schedulingService = new SchedulingService();
