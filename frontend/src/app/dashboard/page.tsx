"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/auth";
import { dashboardService, DashboardStats, TrendData, PriorityData, Technician, CriticalTicket } from "@/lib/dashboard";
import { ApiError } from "@/lib/api";
import { TrendingUp, Clock, AlertCircle, Users } from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { User } from "@/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [priority, setPriority] = useState<PriorityData | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [criticalTickets, setCriticalTickets] = useState<CriticalTicket[]>([]);

  const router = useRouter();
  const { toast } = useToast();

  const checkAuth = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser.role === "CLIENT") {
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Dashboard disponível apenas para técnicos e supervisores.",
        });
        router.replace("/tickets");
        return;
      }
      setUser(currentUser);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        authService.logout();
      }
    }
  }, [router, toast]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, trendsData, priorityData, techsData, criticalData] =
        await Promise.all([
          dashboardService.getStats(),
          dashboardService.getTrends(7),
          dashboardService.getPriorityData(),
          user?.role === "SUPERVISOR" ? dashboardService.getTechnicians() : Promise.resolve([]),
          dashboardService.getCriticalTickets(),
        ]);

      setStats(statsData);
      setTrends(trendsData);
      setPriority(priorityData);
      setTechnicians(techsData);
      setCriticalTickets(criticalData);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar dashboard",
          description: error.message,
        });
        if (error.status === 401) {
          authService.logout();
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, toast]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  const trendChartData = trends ? trends.labels.map((label, idx) => ({
    date: label,
    Criados: trends.created[idx],
    Resolvidos: trends.resolved[idx],
  })) : [];

  const priorityChartData = priority ? [
    { name: "Baixa", value: priority.LOW, color: "#10b981" },
    { name: "Média", value: priority.MEDIUM, color: "#f59e0b" },
    { name: "Alta", value: priority.HIGH, color: "#f97316" },
    { name: "Urgente", value: priority.URGENT, color: "#ef4444" },
  ] : [];

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-gray-500",
      MEDIUM: "bg-yellow-500",
      HIGH: "bg-orange-500",
      URGENT: "bg-red-500",
    };
    return colors[priority] || "bg-gray-500";
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      LOW: "Baixa",
      MEDIUM: "Média",
      HIGH: "Alta",
      URGENT: "Urgente",
    };
    return labels[priority] || priority;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      OPEN: "bg-blue-500",
      IN_PROGRESS: "bg-yellow-500",
      DONE: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      OPEN: "Aberto",
      IN_PROGRESS: "Em Progresso",
      DONE: "Concluído",
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white dark:bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Métricas e performance dos tickets
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Abertos Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.openToday}</div>
                <p className="text-xs text-muted-foreground">Criados nas últimas 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPending}</div>
                <p className="text-xs text-muted-foreground">Aberto + Em Progresso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Resolvidos Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolvedToday}</div>
                <p className="text-xs text-muted-foreground">Fechados nas últimas 24h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
                <p className="text-xs text-muted-foreground">Até primeira resposta</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Alert Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Urgências Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.urgentPending}</div>
                <p className="text-xs text-muted-foreground">Requerem atenção imediata</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sem Atribuição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unassigned}</div>
                <p className="text-xs text-muted-foreground">Esperando técnico</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overdueTickets}</div>
                <p className="text-xs text-muted-foreground">Abertos há mais de 48h</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolutionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Mês atual</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trends Chart */}
          {trends && (
            <Card>
              <CardHeader>
                <CardTitle>Tendências (Últimos 7 dias)</CardTitle>
                <CardDescription>Tickets criados vs resolvidos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Criados"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Resolvidos"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Priority Chart */}
          {priority && (
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Prioridade</CardTitle>
                <CardDescription>Tickets abertos e em progresso</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Critical Tickets */}
        {criticalTickets.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Top 5 Tickets Críticos</CardTitle>
              <CardDescription>Tickets urgentes ou de alta prioridade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criticalTickets.map((ticket) => (
                  <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getPriorityColor(ticket.priority)} text-white whitespace-nowrap`}>
                            {getPriorityLabel(ticket.priority)}
                          </Badge>
                          <Badge className={`${getStatusColor(ticket.status)} text-white whitespace-nowrap`}>
                            {getStatusLabel(ticket.status)}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{ticket.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {ticket.description}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2">
                          Criado por {ticket.createdBy.name} •{" "}
                          {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
                          {ticket.assignedTo && ` • Atribuído a ${ticket.assignedTo.name}`}
                        </div>
                      </div>
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technicians Performance (Supervisor Only) */}
        {user.role === "SUPERVISOR" && technicians.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Performance dos Técnicos</CardTitle>
              <CardDescription>Ranking por tickets resolvidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Técnico</th>
                      <th className="text-center py-2 px-4">Atribuídos</th>
                      <th className="text-center py-2 px-4">Resolvidos</th>
                      <th className="text-right py-2 px-4">Tempo Médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {technicians.map((tech) => (
                      <tr key={tech.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{tech.name}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline">{tech.assigned}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="bg-green-500 text-white">{tech.resolved}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                          {tech.avgTime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
