"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/auth";
import { logService } from "@/lib/logs";
import { AuditLog, User } from "@/types";
import { ApiError } from "@/lib/api";
import { translateErrorMessage } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const router = useRouter();
  const { toast } = useToast();

  const checkAuth = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      router.replace("/login");
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser.role !== "SUPERVISOR") {
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Apenas supervisores podem acessar os logs.",
        });
        router.replace("/tickets");
        return;
      }
      
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      authService.logout();
      router.replace("/login");
    }
  }, [router, toast]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const pageSize = 20;
      const filters: any = {
        page,
        limit: pageSize,
      };
      
      if (actionFilter && actionFilter !== "all") filters.action = actionFilter;
      if (entityTypeFilter && entityTypeFilter !== "all") filters.entityType = entityTypeFilter;
      
      const response = await logService.getLogs(filters);
      setLogs(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar logs",
          description: error.message,
        });
        if (error.status === 401) {
          authService.logout();
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, actionFilter, entityTypeFilter, toast]);

  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user, loadLogs]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("pt-BR");
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: "bg-green-500",
      UPDATE: "bg-blue-500",
      DELETE: "bg-red-500",
      ASSIGN: "bg-purple-500",
      COMMENT_ADD: "bg-cyan-500",
      COMMENT_DELETE: "bg-orange-500",
    };
    
    const labels: Record<string, string> = {
      CREATE: "Criado",
      UPDATE: "Atualizado",
      DELETE: "Excluído",
      ASSIGN: "Atribuído",
      COMMENT_ADD: "Comentário",
      COMMENT_DELETE: "Comentário Excluído",
    };

    return (
      <Badge className={`${colors[action] || "bg-gray-500"} text-white`}>
        {labels[action] || action}
      </Badge>
    );
  };

  const getEntityTypeBadge = (entityType: string) => {
    const labels: Record<string, string> = {
      TICKET: "Ticket",
      COMMENT: "Comentário",
    };

    return <Badge variant="outline">{labels[entityType] || entityType}</Badge>;
  };

  const formatChanges = (changes: any) => {
    if (!changes) return null;
    
    const fieldLabels: Record<string, string> = {
      title: "Título",
      description: "Descrição",
      status: "Status",
      priority: "Prioridade",
      assignedToId: "Técnico Atribuído",
      content: "Conteúdo",
    };

    const statusLabels: Record<string, string> = {
      OPEN: "Aberto",
      IN_PROGRESS: "Em Progresso",
      DONE: "Concluído",
    };

    const priorityLabels: Record<string, string> = {
      LOW: "Baixa",
      MEDIUM: "Média",
      HIGH: "Alta",
      URGENT: "Urgente",
    };

    const formatValue = (key: string, value: any) => {
      if (value === null) return "Não atribuído";
      if (key === "status" && statusLabels[value]) return statusLabels[value];
      if (key === "priority" && priorityLabels[value]) return priorityLabels[value];
      return JSON.stringify(value).replace(/"/g, "");
    };
    
    try {
      const changesList = [];
      
      if (changes.before && changes.after) {
        for (const key in changes.after) {
          if (changes.before[key] !== changes.after[key]) {
            changesList.push(
              <div key={key} className="text-xs">
                <strong>{fieldLabels[key] || key}:</strong>{" "}
                <span className="text-red-600">{formatValue(key, changes.before[key])}</span>
                {" → "}
                <span className="text-green-600">{formatValue(key, changes.after[key])}</span>
              </div>
            );
          }
        }
      }
      
      return changesList.length > 0 ? <div className="space-y-1">{changesList}</div> : null;
    } catch (e) {
      return <span className="text-xs text-muted-foreground">Detalhes não disponíveis</span>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white dark:bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Logs do Sistema</h1>
            <p className="text-sm text-muted-foreground">
              Histórico de alterações
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Logs de Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <Select value={actionFilter} onValueChange={(value) => { setActionFilter(value); setPage(1); }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as ações</SelectItem>
                  <SelectItem value="CREATE">Criado</SelectItem>
                  <SelectItem value="UPDATE">Atualizado</SelectItem>
                  <SelectItem value="DELETE">Excluído</SelectItem>
                  <SelectItem value="ASSIGN">Atribuído</SelectItem>
                  <SelectItem value="COMMENT_ADD">Comentário</SelectItem>
                  <SelectItem value="COMMENT_DELETE">Comentário Excluído</SelectItem>
                </SelectContent>
              </Select>

              <Select value={entityTypeFilter} onValueChange={(value) => { setEntityTypeFilter(value); setPage(1); }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="TICKET">Ticket</SelectItem>
                  <SelectItem value="COMMENT">Comentário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p>Carregando logs...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum log encontrado.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Detalhes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {formatDate(log.createdAt)}
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>{getEntityTypeBadge(log.entityType)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{log.user.name}</div>
                            <div className="text-xs text-muted-foreground">{log.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {log.entityType === "TICKET" && log.action !== "DELETE" && (
                              <Link href={`/tickets/${log.entityId}`}>
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                  Ver ticket #{log.entityId.slice(0, 8)}
                                </Button>
                              </Link>
                            )}
                            {log.entityType === "TICKET" && log.action === "DELETE" && (
                              <span className="text-xs text-muted-foreground">
                                Ticket #{log.entityId.slice(0, 8)} (excluído)
                              </span>
                            )}
                            {formatChanges(log.changes)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
