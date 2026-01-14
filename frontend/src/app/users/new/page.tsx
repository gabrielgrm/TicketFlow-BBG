"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/auth";
import { usersService } from "@/lib/users";
import { ApiError } from "@/lib/api";
import { User, UserRole } from "@/types";

export default function NewUserPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"TECH" | "SUPERVISOR">("TECH");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
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
          description: "Apenas supervisores podem criar novos usuários.",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await usersService.createUser({ 
        email, 
        password, 
        name, 
        role 
      });
      toast({
        title: "Usuário criado com sucesso!",
        description: `${name} foi adicionado como ${role === "TECH" ? "Técnico" : "Supervisor"}.`,
      });
      router.push("/tickets");
    } catch (error) {
      if (error instanceof ApiError) {
        let description = error.message;
        if (error.status === 401) description = "Token inválido ou ausente.";
        else if (error.status === 403) description = "Apenas supervisores podem criar usuários.";
        else if (error.status === 409) description = "Email já existe ou tentativa de criar CLIENT.";
        toast({
          variant: "destructive",
          title: "Erro ao criar usuário",
          description,
        });
        if (error.status === 401) {
          authService.logout();
          router.replace("/login");
        }
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao criar usuário",
          description: "Ocorreu um erro inesperado. Tente novamente.",
        });
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
      <header className="bg-white dark:bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Novo Usuário Administrador</h1>
        </div>
      </header>

      <main className="min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Criar Usuário</CardTitle>
            <CardDescription>
              Crie um novo técnico ou supervisor
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select 
                  value={role} 
                  onValueChange={(value) => setRole(value as "TECH" | "SUPERVISOR")}
                  disabled={isLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECH">Técnico</SelectItem>
                    <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Criando..." : "Criar Usuário"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
