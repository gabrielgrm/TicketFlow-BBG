"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MobileMenuButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        {isOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 top-16 left-0 right-0 bg-card border-b z-40">
          <nav className="flex flex-col p-4 space-y-2">
            <Link
              href="/tickets"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 hover:bg-accent rounded transition-colors"
            >
              Tickets
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 hover:bg-accent rounded transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/logs"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 hover:bg-accent rounded transition-colors"
            >
              Logs
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 hover:bg-accent rounded transition-colors"
            >
              Meu Perfil
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
