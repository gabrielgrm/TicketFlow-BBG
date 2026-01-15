/**
 * Custom hook for authentication checks in pages
 * Centralizes auth logic to avoid code duplication
 */

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { authService } from '@/lib/auth';
import { User } from '@/types';
import { ApiError } from '@/lib/api';

interface UseAuthProps {
  onUserLoaded?: (user: User) => void;
  requiredRole?: string;
}

export function useAuth(props: UseAuthProps = {}) {
  const { onUserLoaded, requiredRole } = props;
  const router = useRouter();
  const { toast } = useToast();

  const checkAuth = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.replace('/login');
      return null;
    }

    try {
      const currentUser = await authService.getCurrentUser();

      if (requiredRole && currentUser.role !== requiredRole) {
        toast({
          variant: 'destructive',
          title: 'Acesso negado',
          description: `Este recurso requer permissão de ${requiredRole}.`,
        });
        router.replace('/tickets');
        return null;
      }

      onUserLoaded?.(currentUser);
      return currentUser;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        authService.logout();
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar dados',
          description: 'Tente recarregar a página.',
        });
      }
      return null;
    }
  }, [requiredRole, router, toast, onUserLoaded]);

  return { checkAuth };
}
