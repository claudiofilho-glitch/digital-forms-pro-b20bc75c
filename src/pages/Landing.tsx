import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Camera, Network, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

const features = [
  { icon: Camera, title: "CFTV e Câmeras", desc: "Monitoramento 24h com câmeras de alta resolução e acesso remoto pelo celular." },
  { icon: Shield, title: "Alarmes e Sensores", desc: "Sistemas de alarme inteligentes com detecção de intrusão e notificação em tempo real." },
  { icon: Lock, title: "Controle de Acesso", desc: "Soluções de controle de acesso biométrico, cartão e senha para empresas." },
  { icon: Network, title: "Redes e Infraestrutura", desc: "Projetos completos de cabeamento estruturado e redes corporativas." },
];

const highlights = [
  "Mais de 10 anos de experiência",
  "Equipe técnica certificada",
  "Suporte 24 horas",
  "Atendimento personalizado",
  "Tecnologia de ponta",
  "Manutenção preventiva",
];

export default function Landing() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              🔒 Segurança Eletrônica & Tecnologia
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Proteção inteligente para o que
              <span className="text-primary"> mais importa</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A Interative Tecnologia oferece soluções completas em segurança eletrônica,
              automação e infraestrutura de TI com tecnologia de ponta e atendimento personalizado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/contato">
                <Button size="lg" className="gap-2 text-base px-8">
                  Solicite um Orçamento <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/sobre">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Conheça a Interative
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Nossos Serviços</h2>
            <p className="text-muted-foreground mt-2">Soluções completas para sua segurança e infraestrutura</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-xl border bg-card p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/servicos">
              <Button variant="outline" className="gap-2">
                Ver todos os serviços <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                Por que escolher a <span className="text-primary">Interative</span>?
              </h2>
              <p className="text-muted-foreground">
                Com anos de experiência no mercado de segurança eletrônica e tecnologia,
                a Interative se destaca pela qualidade dos serviços, atendimento personalizado
                e compromisso com a satisfação do cliente.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/sobre">
                <Button className="gap-2 mt-2">
                  Saiba mais <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center min-h-[300px]">
              <div className="text-center space-y-4">
                <Shield className="h-20 w-20 text-primary mx-auto" />
                <p className="text-2xl font-bold text-primary">+500</p>
                <p className="text-muted-foreground">Projetos realizados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-bold">Pronto para proteger o que importa?</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Entre em contato conosco e receba um orçamento personalizado para sua necessidade.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/contato">
              <Button size="lg" variant="secondary" className="gap-2">
                Fale Conosco <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Acesso ao Sistema
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
