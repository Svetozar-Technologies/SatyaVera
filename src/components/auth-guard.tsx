"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bone">
        <div className="flex flex-col items-center gap-3">
          <div className="gandhi-avatar lg animate-pulse" />
          <span className="text-ink-500 text-sm">Loading SatyaVera...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
