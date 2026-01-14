"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verificar preferência salva ou do sistema
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: "light" | "dark") => {
    const html = document.documentElement;
    
    // Remove e adiciona a classe dark
    html.classList.remove("light", "dark");
    html.classList.add(newTheme);
    
    // Salva a preferência
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      title={`Mudar para tema ${theme === "light" ? "escuro" : "claro"}`}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium text-foreground dark:text-gray-900"
    >
      {theme === "light" ? (
        <>
          <Moon className="w-4 h-4" />
          <span>Tema Escuro</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4" />
          <span>Tema Claro</span>
        </>
      )}
    </button>
  );
}
