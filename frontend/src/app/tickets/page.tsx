"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { authService } from "@/lib/auth";
import { ticketService } from "@/lib/tickets";
import { Ticket, User, TicketStatus, TicketPriority } from "@/types";
import { ApiError } from "@/lib/api";
import { LogOut, Plus, Search } from "lucide-react";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "">("");
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user, page, statusFilter, priorityFilter, search, showMyTickets]);

  const checkAuth = async () => {
    if (!authService.isAuthenticated()) {
      console.log("Token não encontrado, redirecionando para login");
      router.replace("/login");
      return;
    }

    try {
      console.log("Verificando usuário autenticado...");
      const currentUser = await authService.getCurrentUser();
      console.log("Usuário autenticado:", currentUser);
      setUser(currentUser);
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      if (error instanceof ApiError && error.status === 401) {
        console.log("Token inválido, fazendo logout");
        authService.logout();
      } else {
        // Para outros erros, mostrar mensagem mas não deslogar
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados do usuário",
          description: "Tente recarregar a página",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const pageSize = 10;
      const filters: any = {
        page,
        limit: pageSize,
        status: statusFilter,
        priority: priorityFilter,
        search,
      };
      
      if (showMyTickets && (user?.role === "TECH" || user?.role === "SUPERVISOR")) {
        filters.assignedToId = user.id;
      }
      
      const response = await ticketService.getTickets(filters);
      setTickets(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar tickets",
          description: error.message,
        });
        if (error.status === 401) {
          authService.logout();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadTickets();
  };

  const getStatusBadge = (status: TicketStatus) => {
    const variants: Record<TicketStatus, { label: string; className: string }> = {
      OPEN: { label: "Aberto", className: "bg-blue-500 text-white" },
      IN_PROGRESS: { label: "Em Progresso", className: "bg-yellow-500 text-white" },
      DONE: { label: "Concluído", className: "bg-green-500 text-white" },
    };
    const { label, className } = variants[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const getPriorityBadge = (priority: TicketPriority | null) => {
    if (!priority) {
      return <Badge className="bg-gray-300 text-gray-700">Indefinida</Badge>;
    }
    const variants: Record<TicketPriority, { label: string; className: string }> = {
      LOW: { label: "Baixa", className: "bg-gray-500 text-white" },
      MEDIUM: { label: "Média", className: "bg-purple-500 text-white" },
      HIGH: { label: "Alta", className: "bg-orange-500 text-white" },
      URGENT: { label: "Urgente", className: "bg-red-500 text-white" },
    };
    const { label, className } = variants[priority];
    return <Badge className={className}>{label}</Badge>;
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
      <header className="bg-white dark:bg-slate-950 border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">TicketFlow</h1>
            <p className="text-sm text-muted-foreground">
              Olá, {user.name} ({user.role === "CLIENT" ? "Cliente" : user.role === "SUPERVISOR" ? "Supervisor" : "Técnico"})
            </p>
          </div>
          <div className="flex gap-2">
            {user.role === "SUPERVISOR" && (
              <Link href="/logs">
                <Button variant="outline">
                  Logs
                </Button>
              </Link>
            )}
            <ThemeToggle />
            <Button variant="outline" onClick={() => authService.logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tickets</CardTitle>
            <div className="flex gap-2">
              {(user?.role === "TECH" || user?.role === "SUPERVISOR") && (
                <Button
                  variant={showMyTickets ? "default" : "outline"}
                  onClick={() => setShowMyTickets(!showMyTickets)}
                >
                  {showMyTickets ? "Todos os Tickets" : "Meus Tickets"}
                </Button>
              )}
              <Link href="/tickets/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Ticket
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Buscar tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value as TicketStatus)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="OPEN">Aberto</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                  <SelectItem value="DONE">Concluído</SelectItem>
                </SelectContent>
              </Select>
              {(user?.role === "TECH" || user?.role === "SUPERVISOR") && (
                <Select value={priorityFilter || "all"} onValueChange={(value) => setPriorityFilter(value === "all" ? "" : value as TicketPriority)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="LOW">Baixa</SelectItem>
                    <SelectItem value="MEDIUM">Média</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-8">Carregando tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum ticket encontrado. Crie seu primeiro ticket!
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Status</TableHead>
                      {(user.role === "TECH" || user.role === "SUPERVISOR") && <TableHead>Prioridade</TableHead>}
                      <TableHead>Criado por</TableHead>
                      {(user.role === "TECH" || user.role === "SUPERVISOR") && <TableHead>Atribuído a</TableHead>}
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.title}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        {(user.role === "TECH" || user.role === "SUPERVISOR") && (
                          <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        )}
                        <TableCell>
                          {`${ticket.createdBy.name} (${ticket.createdBy.email})`}
                        </TableCell>
                        {(user.role === "TECH" || user.role === "SUPERVISOR") && (
                          <TableCell>
                            {ticket.assignedTo
                              ? `${ticket.assignedTo.name} (${ticket.assignedTo.email})`
                              : "Não atribuído"}
                          </TableCell>
                        )}
                        <TableCell>{new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <Link href={`/tickets/${ticket.id}`}>
                            <Button variant="outline" size="sm">
                              Ver detalhes
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Página {page} de {totalPages ?? 1}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Próxima
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
