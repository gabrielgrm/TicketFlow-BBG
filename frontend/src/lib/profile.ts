import { ProfileData, TeamComparisonEntry, HistoryEntry } from '@/types';
import { fetchApi } from './api';

export const profileService = {
  /**
   * Fetch current user's profile with performance metrics
   * Permission: TECH or SUPERVISOR
   */
  getMyProfile: async (): Promise<ProfileData> => {
    return fetchApi('/profile/me', {
      method: 'GET',
      requiresAuth: true,
    });
  },

  /**
   * Fetch another technician's profile (SUPERVISOR only)
   * Permission: SUPERVISOR
   * @param techId - ID of the technician to view
   */
  getTechnicianProfile: async (techId: string): Promise<ProfileData> => {
    return fetchApi(`/profile/${techId}`, {
      method: 'GET',
      requiresAuth: true,
    });
  },
};

export default profileService;
