import { UserBasic } from '@/types';
import { fetchApi } from './api';

export const usersService = {
  async getTechnicians(): Promise<UserBasic[]> {
    return fetchApi<UserBasic[]>('/users/technicians', { requiresAuth: true });
  },

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: 'TECH' | 'SUPERVISOR';
  }): Promise<UserBasic> {
    return fetchApi<UserBasic>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  },
};
