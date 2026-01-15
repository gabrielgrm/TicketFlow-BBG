import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from '@/types';
import { fetchApi, setToken, removeToken, getToken } from './api';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setToken(response.accessToken);
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(response.accessToken);
    return response;
  },

  async getCurrentUser(): Promise<User> {
    try {
      return await fetchApi<User>('/users/me', {
        requiresAuth: true,
      });
    } catch (error: any) {
      if (error.status === 404 || error.status === 401) {
        this.logout();
      }
      throw error;
    }
  },

  logout(): void {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  isAuthenticated(): boolean {
    const hasToken = !!getToken();
    return hasToken;
  },
};
