"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/lib/auth-context";
import { PlanProvider } from "@/lib/plan-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <PlanProvider>
          {children}
        </PlanProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
