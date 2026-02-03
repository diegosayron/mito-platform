import { apiClient } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, SignupData, AuthTokens, ApiResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', credentials);
    
    if (response.data.success && response.data.data) {
      const { user, tokens } = response.data.data;
      await AsyncStorage.setItem('access_token', tokens.access_token);
      await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return { user, tokens };
    }
    
    throw new Error(response.data.error || 'Login failed');
  },

  async signup(data: SignupData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/signup', data);
    
    if (response.data.success && response.data.data) {
      const { user, tokens } = response.data.data;
      await AsyncStorage.setItem('access_token', tokens.access_token);
      await AsyncStorage.setItem('refresh_token', tokens.refresh_token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return { user, tokens };
    }
    
    throw new Error(response.data.error || 'Signup failed');
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        return JSON.parse(userJson);
      }
      
      // Fetch from API if not in storage
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      if (response.data.success && response.data.data) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }
    } catch (error) {
      console.error('Get current user error:', error);
    }
    return null;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },
};
