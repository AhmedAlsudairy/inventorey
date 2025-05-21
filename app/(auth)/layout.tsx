// app/(auth)/layout.tsx
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/10 flex flex-col">
      {/* Simple header */}      <header className="h-14 border-b flex items-center px-4 md:px-6">
        <div className="ml-auto flex items-center space-x-4">
          <nav className="flex items-center space-x-2">
            <Link href="/" className="text-sm font-medium hover:underline">
              Home
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Auth content */}
      <main className="flex-1 grid place-items-center">
        {children}
      </main>
      
      {/* Simple footer */}
      <footer className="h-14 border-t flex items-center px-4 justify-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Inventory Management System
      </footer>
    </div>
  );
}
