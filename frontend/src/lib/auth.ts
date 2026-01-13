import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from '@/types';
import { fetchApi, setToken, removeToken, getToken } from './api';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log("Fazendo login...");
    const response = await fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    console.log("Login bem-sucedido, resposta da API:", response);
    console.log("Access token recebido:", response.accessToken);
    setToken(response.accessToken);
    console.log("Token salvo:", !!getToken());
    console.log("Token lido do localStorage:", getToken());
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
    console.log("Buscando usuário atual, token:", !!getToken());
    return fetchApi<User>('/users/me', {
      requiresAuth: true,
    });
  },

  logout(): void {
    console.log("Fazendo logout");
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  isAuthenticated(): boolean {
    const hasToken = !!getToken();
    console.log("isAuthenticated:", hasToken);
    return hasToken;
  },
};
