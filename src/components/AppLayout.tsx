import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ClipboardList, PlusCircle, LogOut, User, Wrench, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/b02e6f02-2f51-4e38-a360-184129ade15d.png";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { profile, role, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: "/helpdesk", label: "Ordens de Serviço", icon: ClipboardList },
    { to: "/helpdesk/nova-os", label: "Nova OS", icon: PlusCircle },
    ...(role === "admin" || role === "administrative"
      ? [{ to: "/helpdesk/admin", label: "Operadores", icon: Shield }]
      : []),
  ];

  const roleLabel =
    role === "admin"
      ? "Administrador"
      : role === "administrative"
      ? "Administrativo"
      : role === "coordinator"
      ? "Coordenador"
      : role === "technician"
      ? "Técnico"
      : "Operador";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/helpdesk" className="flex items-center gap-2 font-bold text-lg">
            <img src={logo} alt="Interative Tecnosegurança" className="h-14 w-auto" />
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link key={to} to={to}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-primary-foreground" : "text-primary sm:text-current"
                      )}
                    />
                    <span className="hidden sm:inline">{label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end text-xs">
              <span className="font-medium">{profile?.full_name || "Operador"}</span>
              <span className="text-muted-foreground">{roleLabel}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6">{children}</div>
      </main>
    </div>
  );
}
