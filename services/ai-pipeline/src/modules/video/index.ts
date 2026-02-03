import axios from 'axios';
import config from '../../config';
import { VideoJobData, VideoResult } from '../../types';

/**
 * Video generation module
 * This is a placeholder/integration point for video generation services
 * Can be integrated with services like:
 * - Synthesia
 * - D-ID
 * - Pictory
 * - Custom video generation pipeline
 */
export class VideoService {
  /**
   * Generate video using external service
   */
  private async generateWithExternalService(
    text: string,
    template?: string
  ): Promise<{ videoUrl: string; thumbnailUrl?: string; duration?: number }> {
    if (!config.video.serviceUrl || !config.video.apiKey) {
      throw new Error('Video service not configured');
    }

    try {
      const response = await axios.post(
        `${config.video.serviceUrl}/generate`,
        {
          text,
          template: template || 'default',
          format: 'mp4',
          resolution: '1920x1080',
        },
        {
          headers: {
            'Authorization': `Bearer ${config.video.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60 seconds
        }
      );

      return {
        videoUrl: response.data.videoUrl,
        thumbnailUrl: response.data.thumbnailUrl,
        duration: response.data.duration,
      };
    } catch (error) {
      console.error('Error generating video with external service:', error);
      throw new Error('Failed to generate video');
    }
  }

  /**
   * Generate placeholder video information
   * Used when video service is not configured
   */
  private generatePlaceholder(
    _text: string
  ): { videoUrl: string; thumbnailUrl?: string; duration?: number } {
    // Return placeholder data
    // In production, this might:
    // - Create a simple text-to-speech audio
    // - Generate static image with text overlay
    // - Queue for manual video creation
    return {
      videoUrl: 'https://placeholder.video/not-generated',
      thumbnailUrl: 'https://placeholder.video/thumbnail.jpg',
      duration: 0,
    };
  }

  /**
   * Format summary text for video narration
   */
  private formatTextForVideo(summary: string, keyPoints: string[]): string {
    let script = summary;

    if (keyPoints.length > 0) {
      script += '\n\nPontos principais:\n';
      keyPoints.forEach((point, index) => {
        script += `${index + 1}. ${point}\n`;
      });
    }

    return script;
  }

  /**
   * Execute video generation job
   */
  async execute(data: VideoJobData): Promise<VideoResult> {
    // Format the content for video
    const videoScript = this.formatTextForVideo(
      data.summaryResult.summary,
      data.summaryResult.keyPoints
    );

    let videoData: { videoUrl: string; thumbnailUrl?: string; duration?: number };

    try {
      // Try to use configured video service
      if (config.video.serviceUrl && config.video.apiKey) {
        videoData = await this.generateWithExternalService(
          videoScript,
          data.videoTemplate
        );
      } else {
        // Use placeholder if service not configured
        console.warn('Video service not configured, using placeholder');
        videoData = this.generatePlaceholder(videoScript);
      }
    } catch (error) {
      console.error('Error in video generation:', error);
      // Fallback to placeholder
      videoData = this.generatePlaceholder(videoScript);
    }

    return {
      jobId: data.jobId,
      videoUrl: videoData.videoUrl,
      thumbnailUrl: videoData.thumbnailUrl,
      duration: videoData.duration,
      generatedAt: new Date(),
    };
  }

  /**
   * Check video generation status
   * Useful for async video generation services
   */
  async checkStatus(videoId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    progress?: number;
  }> {
    if (!config.video.serviceUrl || !config.video.apiKey) {
      throw new Error('Video service not configured');
    }

    try {
      const response = await axios.get(
        `${config.video.serviceUrl}/status/${videoId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.video.apiKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error checking video status:', error);
      throw new Error('Failed to check video status');
    }
  }
}

// Export singleton instance
export const videoService = new VideoService();
