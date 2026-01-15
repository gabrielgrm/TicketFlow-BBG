'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, FileText, LayoutDashboard, LogOut, User as UserIcon, User, Users } from 'lucide-react';
import { authService } from '@/lib/auth';
import { getUserRoleLabel } from '@/lib/badge-variants';
import { ThemeToggle } from './theme-toggle';

type AuthUser = {
  name: string;
  role: 'CLIENT' | 'TECH' | 'SUPERVISOR';
};

export function Sidebar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading || !user) {
    return null;
  }

  const handleLogout = () => {
    authService.logout();
    router.replace('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-50">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">TicketFlow</h1>
        <p className="text-xs text-foreground/60 mt-1">Sistema de Tickets</p>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-xs text-foreground/60">{getUserRoleLabel(user.role)}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
        <Link href="/tickets">
          <button
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              isActive('/tickets')
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Tickets</span>
          </button>
        </Link>

        {(user.role === 'TECH' || user.role === 'SUPERVISOR') && (
          <Link href="/dashboard">
            <button
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
          </Link>
        )}

        {user.role === 'SUPERVISOR' && (
          <Link href="/logs">
            <button
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive('/logs')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Logs</span>
            </button>
          </Link>
        )}

        {user.role === 'SUPERVISOR' && (
          <Link href="/users/new">
            <button
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive('/users/new')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Novo Admin</span>
            </button>
          </Link>
        )}

        {(user.role === 'TECH' || user.role === 'SUPERVISOR') && (
          <Link href="/profile">
            <button
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive('/profile')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Meu Perfil</span>
            </button>
          </Link>
        )}
      </nav>

      <div className="border-t border-border p-4 space-y-3">
        <ThemeToggle />
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
