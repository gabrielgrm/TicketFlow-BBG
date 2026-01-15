"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { authService } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api";
import { Zap, Users, BarChart3, Shield, Lightbulb } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.login({ email, password });
      toast({
        title: "Login realizado com sucesso!",
        description: "Você será redirecionado...",
      });
      window.location.href = "/tickets";
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: "Ocorreu um erro inesperado. Tente novamente.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle variant="icon" />
      </div>
      <div className="w-full max-w-6xl flex justify-center items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
        {/* Left Section - About TicketFlow */}
        <div className="hidden md:flex flex-col space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-3">TicketFlow</h1>
            <p className="text-lg text-muted-foreground">
              Gerencie seus tickets com eficiência e clareza
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Rápido e Intuitivo</h3>
                <p className="text-sm text-muted-foreground">Interface simples para gerenciar todos os seus tickets</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Users className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Colaboração em Tempo Real</h3>
                <p className="text-sm text-muted-foreground">Técnicos e supervisores conectados no mesmo espaço</p>
              </div>
            </div>

            <div className="flex gap-3">
              <BarChart3 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Insights Claros</h3>
                <p className="text-sm text-muted-foreground">Métricas e análises para melhorar a performance</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold">Seguro</h3>
                <p className="text-sm text-muted-foreground">Seus dados protegidos com controle de acesso robusto</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Acesse sua conta para continuar
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
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
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
              <div className="text-sm text-center text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/register" className="text-primary hover:underline">
                  Cadastre-se
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        </div>
      </div>

      {/* Test Credentials Helper */}
      <div className="fixed bottom-6 right-6 group">
        <div className="relative">
          <button className="p-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center">
            <Lightbulb className="w-6 h-6" />
          </button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
            <div className="bg-card border border-border rounded-lg p-4 shadow-xl min-w-80">
              <h4 className="font-semibold text-sm mb-3 text-foreground">Credenciais para Teste</h4>
              
              <div className="space-y-2 text-xs">
                <div>
                  <p className="font-medium text-muted-foreground">Supervisor:</p>
                  <p className="text-foreground">supervisor@empresa.com</p>
                </div>
                
                <div>
                  <p className="font-medium text-muted-foreground">Técnicos:</p>
                  <p className="text-foreground">rafael.tech@empresa.com</p>
                  <p className="text-foreground">juliana.tech@empresa.com</p>
                  <p className="text-foreground">lucas.tech@empresa.com</p>
                </div>
                
                <div>
                  <p className="font-medium text-muted-foreground">Clientes:</p>
                  <p className="text-foreground">maria.silva@empresa.com</p>
                  <p className="text-foreground">joao.santos@empresa.com</p>
                  <p className="text-foreground">ana.oliveira@empresa.com</p>
                  <p className="text-foreground">pedro.costa@empresa.com</p>
                  <p className="text-foreground">carla.souza@empresa.com</p>
                </div>
                
                <div className="pt-2 border-t border-border">
                  <p className="font-medium text-muted-foreground">Senha (todas):</p>
                  <p className="text-foreground font-mono">123456</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
