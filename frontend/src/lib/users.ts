import { UserBasic } from '@/types';
import { fetchApi } from './api';

export const usersService = {
  async getTechnicians(): Promise<UserBasic[]> {
    return fetchApi<UserBasic[]>('/users/technicians', { requiresAuth: true });
  },
};
