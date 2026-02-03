import { apiClient } from './api';
import { Content, Comment, ApiResponse, PaginatedResponse } from '../types';

export const contentService = {
  async getContents(page = 1, perPage = 20, type?: string): Promise<PaginatedResponse<Content>> {
    const params: any = { page, per_page: perPage };
    if (type) params.type = type;
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Content>>>('/contents', { params });
    return response.data.data || { items: [], total: 0, page: 1, per_page: perPage, total_pages: 0 };
  },

  async getContentById(id: string): Promise<Content> {
    const response = await apiClient.get<ApiResponse<Content>>(`/contents/${id}`);
    if (!response.data.data) throw new Error('Content not found');
    return response.data.data;
  },

  async likeContent(id: string): Promise<void> {
    await apiClient.post(`/contents/${id}/like`);
  },

  async unlikeContent(id: string): Promise<void> {
    await apiClient.delete(`/contents/${id}/like`);
  },

  async getComments(contentId: string, page = 1, perPage = 20): Promise<PaginatedResponse<Comment>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Comment>>>(
      `/contents/${contentId}/comments`,
      { params: { page, per_page: perPage } }
    );
    return response.data.data || { items: [], total: 0, page: 1, per_page: perPage, total_pages: 0 };
  },

  async addComment(contentId: string, text: string, parentId?: string): Promise<Comment> {
    const response = await apiClient.post<ApiResponse<Comment>>(`/contents/${contentId}/comments`, {
      text,
      parent_id: parentId,
    });
    if (!response.data.data) throw new Error('Failed to add comment');
    return response.data.data;
  },

  async likeComment(commentId: string): Promise<void> {
    await apiClient.post(`/comments/${commentId}/like`);
  },

  async unlikeComment(commentId: string): Promise<void> {
    await apiClient.delete(`/comments/${commentId}/like`);
  },

  async reportContent(contentId: string, reason: string): Promise<void> {
    await apiClient.post('/reports', {
      target_type: 'content',
      target_id: contentId,
      reason,
    });
  },

  async reportComment(commentId: string, reason: string): Promise<void> {
    await apiClient.post('/reports', {
      target_type: 'comment',
      target_id: commentId,
      reason,
    });
  },
};
