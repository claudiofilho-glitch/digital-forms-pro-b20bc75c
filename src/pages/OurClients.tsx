import { Building2, Home, Factory, Hotel, ShoppingCart, GraduationCap } from "lucide-react";

const segments = [
  { icon: Building2, title: "Empresas", desc: "Escritórios e corporações de todos os portes." },
  { icon: ShoppingCart, title: "Comércio", desc: "Lojas, supermercados e centros comerciais." },
  { icon: Factory, title: "Indústrias", desc: "Plantas industriais e galpões logísticos." },
  { icon: Home, title: "Residências", desc: "Casas e condomínios residenciais." },
  { icon: Hotel, title: "Hotéis e Hospitais", desc: "Hotelaria e instituições de saúde." },
  { icon: GraduationCap, title: "Educação", desc: "Escolas, universidades e centros de ensino." },
];

const testimonials = [
  {
    name: "João Silva",
    company: "Tech Solutions LTDA",
    text: "A Interative transformou completamente nossa segurança. O sistema de CFTV é excelente e o suporte é impecável.",
  },
  {
    name: "Maria Santos",
    company: "Condomínio Villa Verde",
    text: "Profissionais extremamente competentes. A instalação foi rápida e o sistema funciona perfeitamente há mais de 2 anos.",
  },
  {
    name: "Carlos Oliveira",
    company: "Supermercado Central",
    text: "O melhor investimento que fizemos em segurança. A equipe da Interative é nota 10 em todos os aspectos.",
  },
];

export default function OurClients() {
  return (
    <div>
      <section className="py-20 bg-gradient-to-br from-primary/10 to-background">
        <div className="container text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Nossos <span className="text-primary">Clientes</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Atendemos diversos segmentos com soluções personalizadas de segurança e tecnologia.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Segmentos Atendidos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {segments.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border bg-card p-6 text-center hover:shadow-md hover:border-primary/30 transition-all">
                <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary mb-4">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">O que nossos clientes dizem</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, company, text }) => (
              <div key={name} className="rounded-xl border bg-card p-6 space-y-4">
                <p className="text-muted-foreground italic">"{text}"</p>
                <div>
                  <p className="font-semibold text-foreground">{name}</p>
                  <p className="text-sm text-primary">{company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "+300", label: "Clientes ativos" },
              { value: "98%", label: "Satisfação" },
              { value: "+500", label: "Projetos entregues" },
              { value: "4.9★", label: "Avaliação média" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-primary">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
