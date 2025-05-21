// app/dashboard/layout.tsx
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden w-full">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 max-w-full">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
