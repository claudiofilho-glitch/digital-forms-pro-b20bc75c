import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/b02e6f02-2f51-4e38-a360-184129ade15d.png";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre" },
  { to: "/servicos", label: "Serviços" },
  { to: "/portfolio", label: "Portfólio" },
  { to: "/nossos-clientes", label: "Nossos Clientes" },
  { to: "/contato", label: "Contato" },
];

export default function PublicLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Interative Tecnologia" className="h-12 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ to, label }) => (
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
            <Link to="/auth">
              <Button size="sm" variant="outline" className="ml-2 gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <LogIn className="h-4 w-4" />
                Entrar
              </Button>
            </Link>
          </nav>

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
            {navItems.map(({ to, label }) => (
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
            <Link to="/auth" onClick={() => setMobileOpen(false)}>
              <Button size="sm" variant="outline" className="w-full mt-2 gap-2 border-primary text-primary">
                <LogIn className="h-4 w-4" />
                Entrar no Sistema
              </Button>
            </Link>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <img src={logo} alt="Interative Tecnologia" className="h-10 w-auto" />
              <p className="text-sm text-muted-foreground">
                Soluções inteligentes em segurança eletrônica e tecnologia para sua empresa e residência.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {navItems.map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="hover:text-primary transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Serviços</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>CFTV e Câmeras</li>
                <li>Alarmes e Sensores</li>
                <li>Controle de Acesso</li>
                <li>Redes e Infraestrutura</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-foreground">Contato</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>📧 contato@interative.com.br</li>
                <li>📞 (00) 0000-0000</li>
                <li>📍 Sua Cidade - Estado</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Interative Tecnologia. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
