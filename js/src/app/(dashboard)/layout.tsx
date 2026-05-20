"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import { AppNav } from "@/components/layout/app-nav";
import { Sidebar, citizenSidebar, lawyerSidebar } from "@/components/layout/sidebar";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdvocate = profile?.role === "ADVOCATE";
  const role = isAdvocate ? "lawyer" : "citizen";
  const name = profile?.name || "";
  const sidebarItems = isAdvocate ? lawyerSidebar : citizenSidebar;

  // Derive active sidebar item from pathname
  const segments = pathname.split("/").filter(Boolean);
  const active = segments.length > 1 ? segments[segments.length - 1] : "home";

  return (
    <div className="min-h-screen bg-bone">
      <AppNav role={role} name={name} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar: hidden on mobile unless open */}
        <div
          className={`
            fixed md:static inset-y-0 left-0 z-30 transform transition-transform duration-200
            md:translate-x-0 md:block
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            top-16 md:top-0
          `}
        >
          <Sidebar items={sidebarItems} active={active} />
        </div>

        <main className="flex-1 p-5 md:p-7 md:px-10 bg-bone overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
