'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProfileData } from '@/types';
import { profileService } from '@/lib/profile';
import { authService } from '@/lib/auth';
import {
  BarChart3,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  User,
  LogOut,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

export function ProfileSidebar() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch current user info and profile data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const user = await authService.getCurrentUser();
      setUserName(user.name);

      // Only TECH and SUPERVISOR can view profiles
      if (['TECH', 'SUPERVISOR'].includes(user.role)) {
        const data = await profileService.getMyProfile();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !profileData) {
      fetchData();
    }
  }, [isOpen, profileData, fetchData]);

  // Only show for TECH and SUPERVISOR
  if (!profileData) {
    return null;
  }

  const metrics = profileData.metrics;

  return (
    <>
      {/* Floating Profile Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 rounded-full bg-gradient-to-br from-primary to-primary/80 hover:shadow-2xl text-white p-4 shadow-lg hover:scale-110 transition-all z-40 group flex items-center justify-center"
        title={userName}
      >
        <User className="w-5 h-5" />
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-1 bg-card text-foreground text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border shadow-md">
          {userName}
        </span>
      </button>

      {/* Profile Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-screen overflow-y-auto max-w-2xl p-0">
          {/* Drag Handle - Visível na frente */}
          <div className="w-full flex justify-center py-4 bg-gradient-to-b from-secondary to-secondary/50 border-b border-border sticky top-0 z-50">
            <div className="w-16 h-1.5 bg-foreground/40 rounded-full" />
          </div>

          <div className="px-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-foreground/70">Carregando perfil...</p>
                </div>
              </div>
            ) : (
              <>
                <DialogHeader className="pt-4">
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    {userName}
                  </DialogTitle>
                </DialogHeader>

              <div className="mt-6 space-y-6">
                {/* Quick Stats - 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Resolved This Month */}
                  <Card className="border-primary/20 bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-foreground/70">Este Mês</span>
                      </div>
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {metrics.resolvedThisMonth}
                      </div>
                      <p className="text-xs text-foreground/60 mt-1">Resolvidos</p>
                    </CardContent>
                  </Card>

                  {/* Resolution Rate */}
                  <Card className="border-primary/20 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-foreground/70">Taxa</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {metrics.resolutionRate}%
                      </div>
                      <p className="text-xs text-foreground/60 mt-1">de Resolução</p>
                    </CardContent>
                  </Card>

                  {/* Assigned Count */}
                  <Card className="border-primary/20 bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-950/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        <span className="text-xs font-medium text-foreground/70">Atribuídos</span>
                      </div>
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        {metrics.assignedCount}
                      </div>
                      <p className="text-xs text-foreground/60 mt-1">Carga Atual</p>
                    </CardContent>
                  </Card>

                  {/* Avg Response Time */}
                  <Card className="border-primary/20 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="text-xs font-medium text-foreground/70">Resposta</span>
                      </div>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400 truncate">
                        {metrics.avgResponseTime}
                      </div>
                      <p className="text-xs text-foreground/60 mt-1">Tempo Médio</p>
                    </CardContent>
                  </Card>
                </div>

                {/* High Priority Stats */}
                <div className="space-y-3 p-4 bg-secondary/50 rounded-lg border border-border">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Prioridades Resolvidas
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-foreground/60">Altas</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {metrics.highPriorityResolved}
                      </p>
                    </div>
                    <div className="h-20 w-px bg-border" />
                    <div>
                      <p className="text-xs text-foreground/60">Baixas</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {metrics.lowPriorityResolved}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Priority Distribution */}
                {Object.values(profileData.charts.priorityDistribution).some((v) => v > 0) && (
                  <div className="space-y-3 p-4 bg-secondary/50 rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-foreground">Distribuição de Prioridades</h3>
                    <div className="space-y-2">
                      {profileData.charts.priorityDistribution.LOW > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground/70">Baixa</span>
                          <Badge variant="outline" className="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200">
                            {profileData.charts.priorityDistribution.LOW}
                          </Badge>
                        </div>
                      )}
                      {profileData.charts.priorityDistribution.MEDIUM > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground/70">Média</span>
                          <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200">
                            {profileData.charts.priorityDistribution.MEDIUM}
                          </Badge>
                        </div>
                      )}
                      {profileData.charts.priorityDistribution.HIGH > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground/70">Alta</span>
                          <Badge variant="outline" className="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200">
                            {profileData.charts.priorityDistribution.HIGH}
                          </Badge>
                        </div>
                      )}
                      {profileData.charts.priorityDistribution.URGENT > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-foreground/70">Urgente</span>
                          <Badge variant="outline" className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200">
                            {profileData.charts.priorityDistribution.URGENT}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Team Rank */}
                {profileData.charts.teamComparison.length > 0 && (
                  <div className="space-y-3 p-4 bg-secondary/50 rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Sua Posição no Time
                    </h3>
                    <div className="space-y-2">
                      {profileData.charts.teamComparison.map((tech, idx) => (
                        <div
                          key={tech.id}
                          className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                            tech.isMe
                              ? 'bg-primary/10 border border-primary/30'
                              : 'hover:bg-secondary border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className="text-sm font-bold text-foreground/70 w-6 text-center">
                              #{idx + 1}
                            </span>
                            <span className="text-sm font-medium truncate">{tech.name}</span>
                            {tech.isMe && (
                              <Badge variant="secondary" className="text-xs ml-auto">
                                Você
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm font-bold text-primary ml-2">{tech.resolved}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent History */}
                {profileData.history.length > 0 && (
                  <div className="space-y-3 p-4 bg-secondary/50 rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-foreground">Últimos Tickets Resolvidos</h3>
                    <div className="space-y-2">
                      {profileData.history.slice(0, 5).map((ticket) => (
                        <Link
                          key={ticket.id}
                          href={`/tickets/${ticket.id}`}
                          className="block p-3 rounded-md bg-background hover:bg-secondary transition-colors truncate hover:text-primary text-sm border border-transparent hover:border-primary/30"
                          onClick={() => setIsOpen(false)}
                        >
                          {ticket.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Logout Button */}
                <div className="pt-4 border-t border-border pb-6">
                  <Button
                    onClick={() => {
                      authService.logout();
                      setIsOpen(false);
                    }}
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Fazer Logout
                  </Button>
                </div>
              </div>
            </>
          )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProfileSidebar;
