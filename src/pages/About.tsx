import { Shield, Target, Eye, Users, Award, Clock } from "lucide-react";

const values = [
  { icon: Shield, title: "Segurança", desc: "Comprometidos com a proteção total dos nossos clientes." },
  { icon: Target, title: "Inovação", desc: "Sempre buscando as tecnologias mais avançadas do mercado." },
  { icon: Users, title: "Atendimento", desc: "Relacionamento próximo e personalizado com cada cliente." },
  { icon: Award, title: "Qualidade", desc: "Excelência em cada projeto executado." },
  { icon: Clock, title: "Agilidade", desc: "Respostas rápidas e eficiência na execução." },
  { icon: Eye, title: "Transparência", desc: "Comunicação clara e honesta em todas as etapas." },
];

export default function About() {
  return (
    <div>
      <section className="py-20 bg-gradient-to-br from-primary/10 to-background">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Sobre a <span className="text-primary">Interative Tecnologia</span></h1>
            <p className="text-lg text-muted-foreground">
              Conheça a empresa que transforma segurança em tranquilidade.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Nossa História</h2>
              <p className="text-muted-foreground">
                A Interative Tecnologia nasceu da paixão por tecnologia e da vontade de oferecer soluções
                de segurança eletrônica de alta qualidade. Com uma equipe de profissionais experientes e
                certificados, atuamos no mercado há mais de 20 anos, atendendo empresas e residências
                com excelência.
              </p>
...
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center min-h-[250px]">
              <div className="text-center space-y-3">
                <Shield className="h-16 w-16 text-primary mx-auto" />
                <p className="text-3xl font-bold text-primary">+20 anos</p>
                <p className="text-muted-foreground">de experiência</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">Nossos Valores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border bg-card p-6 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex rounded-lg bg-primary/10 p-3 text-primary mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "+500", label: "Projetos realizados" },
              { value: "+300", label: "Clientes ativos" },
              { value: "+20", label: "Anos de mercado" },
              { value: "24h", label: "Suporte disponível" },
            ].map(({ value, label }) => (
              <div key={label} className="space-y-2">
                <p className="text-3xl font-bold text-primary">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
