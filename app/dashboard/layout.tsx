// app/dashboard/layout.tsx
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
      
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden w-full relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8 max-w-full relative">
          <div className="w-full min-h-full">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
