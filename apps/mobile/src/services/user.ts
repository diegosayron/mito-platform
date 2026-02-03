import { apiClient } from './api';
import { Badge, StickerPack, Sticker, Notification, ApiResponse, PaginatedResponse } from '../types';

export const userService = {
  async getBadges(): Promise<Badge[]> {
    const response = await apiClient.get<ApiResponse<Badge[]>>('/user/badges');
    return response.data.data || [];
  },

  async getStickerPacks(): Promise<StickerPack[]> {
    const response = await apiClient.get<ApiResponse<StickerPack[]>>('/stickers/packs');
    return response.data.data || [];
  },

  async getStickersFromPack(packId: string): Promise<Sticker[]> {
    const response = await apiClient.get<ApiResponse<Sticker[]>>(`/stickers/packs/${packId}/stickers`);
    return response.data.data || [];
  },

  async getNotifications(page = 1, perPage = 20): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', {
      params: { page, per_page: perPage },
    });
    return response.data.data || { items: [], total: 0, page: 1, per_page: perPage, total_pages: 0 };
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },
};
