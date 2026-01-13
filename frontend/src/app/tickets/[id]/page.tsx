"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/auth";
import { ticketService } from "@/lib/tickets";
import { usersService } from "@/lib/users";
import { ApiError } from "@/lib/api";
import { Ticket, User, TicketStatus, TicketPriority } from "@/types";
import { ArrowLeft, Trash2, Send, Pencil, Check, X } from "lucide-react";

export default function TicketDetailPage() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedStatus, setEditedStatus] = useState<TicketStatus>("OPEN");
  const [editedPriority, setEditedPriority] = useState<TicketPriority>("MEDIUM");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingBasicFields, setIsEditingBasicFields] = useState(false);
  const [technicians, setTechnicians] = useState<{ id: string; name: string; email: string }[]>([]);
  const [editedAssignedTo, setEditedAssignedTo] = useState<string | "none">("none");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadTicket();
      if (user.role === "TECH" || user.role === "SUPERVISOR") {
        loadTechnicians();
      }
    }
  }, [user, params.id]);

  const loadTechnicians = async () => {
    try {
      const list = await usersService.getTechnicians();
      setTechnicians(list);
    } catch {
    }
  };

  const checkAuth = async () => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        authService.logout();
      }
    }
  };

  const loadTicket = async () => {
    setIsLoading(true);
    try {
      const data = await ticketService.getTicketById(params.id as string);
      setTicket(data);
      setEditedTitle(data.title);
      setEditedDescription(data.description);
      setEditedStatus(data.status);
      setEditedPriority(data.priority);
      setEditedAssignedTo((data.assignedToId as string | null) ?? "none");
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Erro ao carregar ticket",
          description: error.message,
        });
        if (error.status === 401) {
          authService.logout();
        } else if (error.status === 404) {
          router.push("/tickets");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await ticketService.addComment(params.id as string, { content: comment });
      toast({
        title: "Comentário adicionado!",
      });
      setComment("");
      loadTicket();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Erro ao adicionar comentário",
          description: error.message,
        });
        if (error.status === 401) {
          authService.logout();
        }
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdate = async () => {
    if (!ticket) return;

    setIsEditing(true);
    try {
      const payload: any = {
        title: editedTitle,
        description: editedDescription,
      };
      if (user?.role === "TECH" || user?.role === "SUPERVISOR") {
        payload.status = editedStatus;
        payload.priority = editedPriority;
        payload.assignedToId = editedAssignedTo === "none" ? null : editedAssignedTo;
      }
      await ticketService.updateTicket(ticket.id, payload);
      toast({
        title: "Ticket atualizado com sucesso!",
      });
      loadTicket();
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar ticket",
          description: error.message,
        });
        if (error.status === 401) {
          authService.logout();
        }
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!ticket) return;

    try {
      await ticketService.deleteTicket(ticket.id);
      toast({
        title: "Ticket excluído com sucesso!",
      });
      router.push("/tickets");
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Erro ao excluir ticket",
          description: error.message,
        });
        if (error.status === 401) {
          authService.logout();
        }
      }
    }
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

  const getPriorityBadge = (priority: TicketPriority) => {
    const variants: Record<TicketPriority, { label: string; className: string }> = {
      LOW: { label: "Baixa", className: "bg-gray-500 text-white" },
      MEDIUM: { label: "Média", className: "bg-purple-500 text-white" },
      HIGH: { label: "Alta", className: "bg-orange-500 text-white" },
      URGENT: { label: "Urgente", className: "bg-red-500 text-white" },
    };
    const { label, className } = variants[priority];
    return <Badge className={className}>{label}</Badge>;
  };

  const canEdit = () => {
    if (!user || !ticket) return false;
    if (ticket.status === "DONE") return false;
    return true;
  };

  // Basic fields: title/description for both roles
  const canEditBasicFields = () => {
    if (!user || !ticket) return false;
    return ticket.status !== "DONE";
  };

  // Advanced fields: status/priority/assignment for TECH only
  const canEditAdvancedFields = () => {
    if (!user || !ticket) return false;
    return (user.role === "TECH" || user.role === "SUPERVISOR") && ticket.status !== "DONE";
  };

  if (isLoading || !ticket || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">TicketFlow</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/tickets">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para tickets
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  {isEditingBasicFields && user?.role === "TECH" ? (
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-2xl font-bold"
                      disabled={isEditing}
                    />
                  ) : (
                    <CardTitle className="text-2xl">{ticket.title}</CardTitle>
                  )}
                  {(user?.role === "TECH" || user?.role === "SUPERVISOR") && canEditBasicFields() && !isEditingBasicFields && (
                    <button
                      onClick={() => setIsEditingBasicFields(true)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                      title="Editar título"
                    >
                      <Pencil className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(ticket.status)}
                  {(user.role === "TECH" || user.role === "SUPERVISOR") && getPriorityBadge(ticket.priority)}
                </div>
              </div>
              {(user.role === "TECH" || user.role === "SUPERVISOR") && (
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar exclusão</DialogTitle>
                      <DialogDescription>
                        Tem certeza que deseja excluir este ticket? Esta ação não pode ser desfeita.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button variant="destructive" onClick={handleDelete}>
                        Excluir
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Descrição</Label>
                  {isEditingBasicFields && user?.role === "TECH" ? (
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      disabled={isEditing}
                      rows={4}
                      className="mt-2"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                      {ticket.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Cliente</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {`${ticket.createdBy.name} • ${ticket.createdBy.email}`}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Técnico</Label>
                      {!ticket.assignedTo && (user?.role === "TECH" || user?.role === "SUPERVISOR") && (
                        <Badge className="bg-slate-900 text-white text-xs">
                          Sem responsável
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground flex-1">
                        {ticket.assignedTo
                          ? `${ticket.assignedTo.name} • ${ticket.assignedTo.email}`
                          : "Não atribuído"}
                      </p>
                      {!ticket.assignedTo && (user?.role === "TECH" || user?.role === "SUPERVISOR") && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            setIsEditing(true);
                            try {
                              await ticketService.updateTicket(ticket.id, {
                                assignedToId: user.id,
                              });
                              toast({
                                title: "✅ Ticket atribuído com sucesso!",
                                description: "Você agora é o técnico responsável por este ticket.",
                              });
                              loadTicket();
                            } catch (error) {
                              if (error instanceof ApiError) {
                                toast({
                                  variant: "destructive",
                                  title: "Erro ao atribuir ticket",
                                  description: error.message,
                                });
                              }
                            } finally {
                              setIsEditing(false);
                            }
                          }}
                          disabled={isEditing}
                        >
                          Pegar Ticket
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {canEditAdvancedFields() && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={editedStatus}
                          onValueChange={async (value) => {
                            const newStatus = value as TicketStatus;
                            setEditedStatus(newStatus);
                            try {
                              await ticketService.updateTicket(ticket.id, {
                                status: newStatus,
                              });
                              toast({
                                title: "Status atualizado",
                                description: "O status do ticket foi atualizado com sucesso.",
                              });
                              loadTicket();
                            } catch (error) {
                              if (error instanceof ApiError) {
                                toast({
                                  variant: "destructive",
                                  title: "Erro ao atualizar status",
                                  description: error.message,
                                });
                              }
                            }
                          }}
                          disabled={!canEdit() || isEditing}
                        >
                          <SelectTrigger id="status">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPEN">Aberto</SelectItem>
                            <SelectItem value="IN_PROGRESS">Em Progresso</SelectItem>
                            <SelectItem value="DONE">Concluído</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select
                          value={editedPriority}
                          onValueChange={async (value) => {
                            const newPriority = value as TicketPriority;
                            setEditedPriority(newPriority);
                            try {
                              await ticketService.updateTicket(ticket.id, {
                                priority: newPriority,
                              });
                              toast({
                                title: "Prioridade atualizada",
                                description: "A prioridade do ticket foi atualizada com sucesso.",
                              });
                              loadTicket();
                            } catch (error) {
                              if (error instanceof ApiError) {
                                toast({
                                  variant: "destructive",
                                  title: "Erro ao atualizar prioridade",
                                  description: error.message,
                                });
                              }
                            }
                          }}
                          disabled={!canEdit() || isEditing}
                        >
                          <SelectTrigger id="priority">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Baixa</SelectItem>
                            <SelectItem value="MEDIUM">Média</SelectItem>
                            <SelectItem value="HIGH">Alta</SelectItem>
                            <SelectItem value="URGENT">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {isEditingBasicFields && (user?.role === "TECH" || user?.role === "SUPERVISOR") && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      onClick={handleUpdate} 
                      disabled={isEditing}
                      variant="default"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {isEditing ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button 
                      onClick={() => setIsEditingBasicFields(false)} 
                      disabled={isEditing}
                      variant="outline"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Criado em: {new Date(ticket.createdAt).toLocaleString("pt-BR")} • 
                  Atualizado em: {new Date(ticket.updatedAt).toLocaleString("pt-BR")}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comentários</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {ticket.comments && ticket.comments.length > 0 ? (
                <div className="space-y-4">
                  {ticket.comments.map((c) => (
                    <div key={c.id} className="border-l-2 border-gray-300 pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{c.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(c.createdAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum comentário ainda
                </p>
              )}

              {canEdit() && (
                <form onSubmit={handleAddComment} className="space-y-2">
                  <Label htmlFor="comment">Adicionar comentário</Label>
                  <Textarea
                    id="comment"
                    placeholder="Digite seu comentário..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmittingComment}
                    rows={3}
                  />
                  <Button type="submit" disabled={isSubmittingComment || !comment.trim()}>
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmittingComment ? "Enviando..." : "Enviar"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
