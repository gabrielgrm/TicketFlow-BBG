'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { authService } from '@/lib/auth';
import { profileService } from '@/lib/profile';
import { ProfileData, HistoryEntry } from '@/types';
import { Clock, Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Fetch current user info
  const checkAuth = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      setUserName(user.name);
      // Only TECH and SUPERVISOR can view profiles
      if (!['TECH', 'SUPERVISOR'].includes(user.role)) {
        setError('Acesso negado. Apenas técnicos e supervisores podem acessar o perfil.');
        return false;
      }
      return true;
    } catch {
      setError('Erro ao verificar autenticação.');
      return false;
    }
  }, []);

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileService.getMyProfile();
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Erro ao carregar dados do perfil.');
      toast({
        title: 'Erro',
        description: 'Falha ao carregar perfil. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const init = async () => {
      const isAuthed = await checkAuth();
      if (isAuthed) {
        await fetchProfileData();
      } else {
        setLoading(false);
      }
    };

    init();
  }, [checkAuth, fetchProfileData]);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Perfil</h1>
            <p className="text-sm text-muted-foreground">Métricas de performance</p>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Erro de Acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 mb-4">{error}</p>
              <Button onClick={() => router.push('/tickets')} className="w-full">
                Voltar para Tickets
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-foreground/70">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Sem dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70">Não foi possível carregar os dados do perfil.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const metrics = profileData.metrics;
  const charts = profileData.charts;
  const history = profileData.history;

  // Format trend data for LineChart
  const trendData = charts.resolvedTrend.labels.map((label, idx) => ({
    label,
    resolved: charts.resolvedTrend.resolved[idx],
  }));

  // Format priority data for PieChart
  const priorityData = [
    { name: 'Baixa', value: charts.priorityDistribution.LOW, color: '#10b981' },
    { name: 'Média', value: charts.priorityDistribution.MEDIUM, color: '#f59e0b' },
    { name: 'Alta', value: charts.priorityDistribution.HIGH, color: '#f97316' },
    { name: 'Urgente', value: charts.priorityDistribution.URGENT, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      LOW: { bg: 'bg-green-100 dark:bg-green-950', text: 'text-green-800 dark:text-green-200' },
      MEDIUM: {
        bg: 'bg-yellow-100 dark:bg-yellow-950',
        text: 'text-yellow-800 dark:text-yellow-200',
      },
      HIGH: {
        bg: 'bg-orange-100 dark:bg-orange-950',
        text: 'text-orange-800 dark:text-orange-200',
      },
      URGENT: { bg: 'bg-red-100 dark:bg-red-950', text: 'text-red-800 dark:text-red-200' },
    };
    return colors[priority] || colors.LOW;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
      URGENT: 'Urgente',
    };
    return labels[priority] || priority;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-sm text-foreground/60 mt-1">Performance e métricas pessoais</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Metrics Cards - 3x2 Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Tickets Atribuídos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tickets Atribuídos</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.assignedCount}</div>
              <p className="text-xs text-foreground/60 mt-1">Carga atual</p>
            </CardContent>
          </Card>

          {/* Card 2: Resolvidos Este Mês */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolvidos Este Mês</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.resolvedThisMonth}</div>
              <p className="text-xs text-foreground/60 mt-1">Produtividade</p>
            </CardContent>
          </Card>

          {/* Card 3: Tempo Médio de Resposta */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio de Resposta</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgResponseTime}</div>
              <p className="text-xs text-foreground/60 mt-1">Até primeiro comentário</p>
            </CardContent>
          </Card>

          {/* Card 4: Taxa de Resolução */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.resolutionRate}%</div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(metrics.resolutionRate, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Prioridades Altas Resolvidas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prioridades Altas</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{metrics.highPriorityResolved}</div>
              <p className="text-xs text-foreground/60 mt-1">Alta + Urgente</p>
            </CardContent>
          </Card>

          {/* Card 6: Prioridades Baixas Resolvidas */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prioridades Baixas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{metrics.lowPriorityResolved}</div>
              <p className="text-xs text-foreground/60 mt-1">Baixa + Média</p>
            </CardContent>
          </Card>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tendência (30 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" stroke="var(--color-border)" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis stroke="var(--color-border)" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} contentStyle={{ color: '#9ca3af' }} />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="#3b82f6"
                    name="Resolvidos"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuição de Prioridades</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                      labelStyle={{ fill: '#9ca3af', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: '#9ca3af',
                      }}
                      labelStyle={{ color: '#9ca3af' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-foreground/60">
                  <p>Nenhum ticket resolvido</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Team Comparison - Horizontal Bar Chart */}
        {charts.teamComparison.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance do Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={charts.teamComparison}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" stroke="var(--color-border)" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={190}
                    stroke="var(--color-border)"
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: '#9ca3af',
                    }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Bar dataKey="resolved" name="Resolvidos" fill="#3b82f6">
                    {charts.teamComparison.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isMe ? '#fbbf24' : '#3b82f6'} />
                    ))}
                  </Bar>
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} contentStyle={{ color: '#9ca3af' }} />
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded" />
                  <span className="text-sm text-foreground">Você</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded" />
                  <span className="text-sm text-foreground">Outros Técnicos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Section */}
        <Card>
          <CardHeader>
            <CardTitle>Últimos 10 Tickets Resolvidos</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((ticket: HistoryEntry) => (
                  <Link
                    key={ticket.id}
                    href={`/tickets/${ticket.id}`}
                    className="block border border-border rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg hover:border-primary/50 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground break-words">{ticket.title}</h3>
                          <Badge variant="outline" className={getPriorityColor(ticket.priority).text}>
                            {getPriorityLabel(ticket.priority)}
                          </Badge>
                        </div>

                        {ticket.clientFeedback && (
                          <div className="mt-3 p-3 bg-secondary rounded text-sm italic text-foreground/80 border-l-2 border-primary">
                            💬 &quot;{ticket.clientFeedback}&quot;
                          </div>
                        )}
                      </div>

                      <div className="text-right text-sm text-foreground/60 flex-shrink-0">
                        <p className="whitespace-nowrap">
                          Tempo: <strong className="text-foreground">{ticket.timeSpentHours}h</strong>
                        </p>
                        <p className="whitespace-nowrap mt-1">
                          {new Date(ticket.resolvedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-foreground/60 text-center py-8">
                Nenhum ticket resolvido ainda. Comece a resolver tickets para ver seu histórico!
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
