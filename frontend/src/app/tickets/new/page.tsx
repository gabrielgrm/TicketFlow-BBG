"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/auth";
import { ticketService } from "@/lib/tickets";
import { ApiError } from "@/lib/api";
import { translateErrorMessage } from "@/lib/utils";
import { User } from "@/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewTicketPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const checkAuth = useCallback(async () => {
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
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: { title: string; description: string } = {
        title,
        description,
      };
      await ticketService.createTicket(payload);
      toast({
        title: "Ticket criado com sucesso!",
        description: "Você será redirecionado...",
      });
      router.push("/tickets");
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Erro ao criar ticket",
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white dark:bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">TicketFlow</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/tickets">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para tickets
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Ticket</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar um novo ticket de suporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Descreva o problema brevemente"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o problema em detalhes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={isLoading}
                  rows={6}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? "Criando..." : "Criar Ticket"}
                </Button>
                <Link href="/tickets" className="flex-1">
                  <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
