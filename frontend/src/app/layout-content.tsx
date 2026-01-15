"use client";

import { usePathname } from "next/navigation";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <main className={isAuthPage ? "" : "md:ml-64"}>
      {children}
    </main>
  );
}
