import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Bell,
  KeyRound,
  Network,
  ArrowRight,
  CheckCircle2,
  Headphones,
} from "lucide-react";
import logo from "@/assets/b02e6f02-2f51-4e38-a360-184129ade15d.png";

const services = [
  {
    icon: Shield,
    title: "Tecnosegurança",
    description:
      "Projetos completos de segurança eletrônica com CFTV, monitoramento e perímetro.",
  },
  {
    icon: Bell,
    title: "Alarmes & Sensores",
    description:
      "Instalação e manutenção de centrais de alarme, sensores e sirenes integrados.",
  },
  {
    icon: KeyRound,
    title: "Controle de Acesso",
    description:
      "Catracas, biometria e cartões para gestão segura de entradas e saídas.",
  },
  {
    icon: Network,
    title: "Redes & Infraestrutura",
    description:
      "Cabeamento estruturado, redes wifi e infraestrutura de TI sob medida.",
  },
];

const differentials = [
  "Equipe técnica certificada e experiente",
  "Atendimento em todo o Brasil",
  "SLA monitorado em tempo real",
  "Suporte presencial e remoto",
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/90 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Interative Tecnosegurança" className="h-12 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#inicio" className="text-foreground/80 hover:text-primary transition">
              Início
            </a>
            <a href="#servicos" className="text-foreground/80 hover:text-primary transition">
              Serviços
            </a>
            <a href="#sobre" className="text-foreground/80 hover:text-primary transition">
              Sobre
            </a>
            <a href="#contato" className="text-foreground/80 hover:text-primary transition">
              Contato
            </a>
          </nav>

          <Link to="/helpdesk">
            <Button size="sm" className="gap-2">
              <Headphones className="h-4 w-4" />
              Helpdesk
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero teal */}
        <section
          id="inicio"
          className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[hsl(192_70%_22%)] text-primary-foreground"
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, hsl(var(--accent) / 0.4) 0, transparent 40%), radial-gradient(circle at 80% 60%, hsl(0 0% 100% / 0.15) 0, transparent 40%)",
            }}
          />
          <div className="container relative py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Shield className="h-3.5 w-3.5" />
                Segurança Eletrônica & Tecnologia
              </span>
              <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Proteção inteligente para o que{" "}
                <span className="text-accent">mais importa</span>
              </h1>
              <p className="mt-5 text-lg text-primary-foreground/85 max-w-xl">
                A Interative Tecnosegurança oferece soluções completas em
                segurança eletrônica, automação e infraestrutura de TI com mais de
                25 anos de tecnologia a serviço do seu atendimento.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#contato">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Solicite um orçamento
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
                <a href="#servicos">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    Conheça os serviços
                  </Button>
                </a>
              </div>
            </div>

            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-accent/30 blur-3xl" />
                <div className="relative grid grid-cols-2 gap-4">
                  {[Shield, Bell, KeyRound, Network].map((Icon, i) => (
                    <div
                      key={i}
                      className="h-32 w-32 rounded-2xl bg-primary-foreground/10 border border-primary-foreground/20 backdrop-blur-md flex items-center justify-center"
                    >
                      <Icon className="h-12 w-12 text-primary-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section id="servicos" className="py-20">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Nossos Serviços
              </h2>
              <p className="mt-3 text-muted-foreground">
                Soluções completas em segurança eletrônica e infraestrutura.
              </p>
            </div>

            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="group rounded-xl border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sobre */}
        <section id="sobre" className="py-20 bg-secondary/40">
          <div className="container grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Sobre nós
              </span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-foreground">
                Tecnologia e segurança que você pode confiar
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Há mais de 25 anos protegendo pessoas, patrimônios e negócios com
                soluções completas e atendimento técnico de excelência.
              </p>
              <ul className="mt-6 space-y-3">
                {differentials.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-primary to-[hsl(192_70%_22%)] text-primary-foreground p-8 md:p-10 shadow-xl">
              <Headphones className="h-10 w-10 text-accent" />
              <h3 className="mt-4 text-2xl font-bold">
                Já é cliente Interative?
              </h3>
              <p className="mt-2 text-primary-foreground/85">
                Acesse o nosso portal de Helpdesk para acompanhar suas ordens de
                serviço, abrir novos chamados e falar com nosso suporte técnico.
              </p>
              <Link to="/helpdesk" className="inline-block mt-6">
                <Button size="lg" variant="secondary" className="gap-2">
                  Acessar Helpdesk
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Contato */}
        <section id="contato" className="py-20">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Entre em contato
            </h2>
            <p className="mt-3 text-muted-foreground">
              Solicite um orçamento ou tire suas dúvidas com nossa equipe.
            </p>
            <div className="mt-8 grid sm:grid-cols-3 gap-4 text-sm">
              <div className="rounded-lg border bg-card p-5">
                <p className="font-semibold text-foreground">Telefone</p>
                <p className="mt-1 text-muted-foreground">(00) 0000-0000</p>
              </div>
              <div className="rounded-lg border bg-card p-5">
                <p className="font-semibold text-foreground">E-mail</p>
                <p className="mt-1 text-muted-foreground">contato@interative.com.br</p>
              </div>
              <div className="rounded-lg border bg-card p-5">
                <p className="font-semibold text-foreground">Atendimento</p>
                <p className="mt-1 text-muted-foreground">Seg a Sex • 8h às 18h</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Interative" className="h-10 w-auto" />
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Interative Tecnosegurança. Todos os direitos reservados.
            </span>
          </div>
          <Link to="/helpdesk" className="text-sm text-primary hover:underline">
            Acessar Helpdesk →
          </Link>
        </div>
      </footer>
    </div>
  );
}
