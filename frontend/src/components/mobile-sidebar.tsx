'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/auth';
import { User, LogOut, LayoutDashboard, FileText, Users, BarChart3, User as UserIcon, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export function MobileSidebar() {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const checkAuth = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      // Error checking auth
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Close menu when route changes
    setIsOpen(false);
  }, [pathname]);

  // Don't render on auth pages
  if (isAuthPage) {
    return null;
  }

  const handleLogout = () => {
    authService.logout();
    router.replace('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-50"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-in Menu - Only render if user is loaded */}
      {!isLoading && user && (
        <aside
          className={`fixed right-0 top-0 h-screen w-64 bg-card border-l border-border z-50 transform transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">TicketFlow</h1>
            <p className="text-xs text-foreground/60 mt-1">Sistema de Tickets</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-foreground/60">
                {user.role === 'CLIENT' ? 'Cliente' : user.role === 'SUPERVISOR' ? 'Supervisor' : 'Técnico'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
          {/* Tickets - Todos podem ver */}
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

          {/* Dashboard - TECH e SUPERVISOR */}
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

          {/* Logs - SUPERVISOR */}
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

          {/* Novo Administrador - SUPERVISOR */}
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

          {/* Perfil - TECH e SUPERVISOR */}
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

        {/* Footer */}
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
      )}
    </div>
  );
}

export default MobileSidebar;
