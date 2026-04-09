import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ClipboardList, PlusCircle, LogOut, Shield, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/b02e6f02-2f51-4e38-a360-184129ade15d.png";

const publicNavItems = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre" },
  { to: "/servicos", label: "Serviços" },
  { to: "/portfolio", label: "Portfólio" },
  { to: "/nossos-clientes", label: "Nossos Clientes" },
  { to: "/contato", label: "Contato" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { profile, role, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const systemNavItems = [
    { to: "/dashboard", label: "Ordens de Serviço", icon: ClipboardList },
    { to: "/nova-os", label: "Nova OS", icon: PlusCircle },
    ...(role === "admin" ? [{ to: "/admin", label: "Usuários", icon: Shield }] : []),
  ];

  const roleLabel = role === "admin" ? "Administrador" : role === "technician" ? "Técnico" : "Usuário";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={logo} alt="Interative Tecnologia" className="h-12 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {publicNavItems.map(({ to, label }) => (
              <Link key={to} to={to}>
                <Button
                  variant={location.pathname === to ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "text-sm font-medium",
                    location.pathname === to && "bg-primary text-primary-foreground"
                  )}
                >
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-1">
            {systemNavItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}>
                <Button
                  variant={location.pathname === to ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{label}</span>
                </Button>
              </Link>
            ))}
            <div className="hidden lg:flex flex-col items-end text-xs ml-2">
              <span className="font-medium">{profile?.full_name || "Usuário"}</span>
              <span className="text-muted-foreground">{roleLabel}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-white p-4 space-y-2 animate-fade-in">
            {publicNavItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === to
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {label}
              </Link>
            ))}
            <div className="border-t pt-2 mt-2 space-y-2">
              {systemNavItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    location.pathname === to
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
            <div className="border-t pt-2 mt-2 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-medium">{profile?.full_name || "Usuário"}</span>
                <span className="text-muted-foreground ml-2">{roleLabel}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  );
}