import { Camera, Shield, Network, Lock, Building2, Home } from "lucide-react";

const projects = [
  {
    icon: Camera,
    title: "Condomínio Residencial Villa Verde",
    category: "CFTV",
    desc: "Instalação de 48 câmeras IP com monitoramento 24h, DVR com armazenamento de 30 dias e acesso remoto para moradores.",
    tags: ["CFTV", "IP", "Residencial"],
  },
  {
    icon: Shield,
    title: "Supermercado Central",
    category: "Alarme e CFTV",
    desc: "Sistema integrado de alarme e CFTV com 64 câmeras, sensores de abertura em todas as entradas e monitoramento central.",
    tags: ["Alarme", "CFTV", "Comercial"],
  },
  {
    icon: Lock,
    title: "Escritório Corporativo Tech Solutions",
    category: "Controle de Acesso",
    desc: "Implantação de controle de acesso biométrico com 12 pontos de acesso, catracas e registro de ponto integrado.",
    tags: ["Biometria", "Catraca", "Corporativo"],
  },
  {
    icon: Network,
    title: "Hotel Premium Palace",
    category: "Redes e Wi-Fi",
    desc: "Projeto completo de rede Wi-Fi com 50 access points, cobertura total de 120 quartos e áreas comuns.",
    tags: ["Wi-Fi", "Rede", "Hotelaria"],
  },
  {
    icon: Building2,
    title: "Indústria Metalúrgica Silva",
    category: "Segurança Integrada",
    desc: "Sistema integrado com CFTV, alarme perimetral, cerca elétrica e controle de acesso veicular.",
    tags: ["Integrado", "Industrial", "Perímetro"],
  },
  {
    icon: Home,
    title: "Residência Família Costa",
    category: "Automação e Segurança",
    desc: "Automação residencial completa com câmeras, alarme, iluminação inteligente e controle por app.",
    tags: ["Automação", "Residencial", "Smart Home"],
  },
];

export default function Portfolio() {
  return (
    <div>
      <section className="py-20 bg-gradient-to-br from-primary/10 to-background">
        <div className="container text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground"><span className="text-primary">Portfólio</span> de Projetos</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conheça alguns dos projetos que realizamos com excelência e qualidade.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(({ icon: Icon, title, category, desc, tags }) => (
              <div key={title} className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center">
                  <Icon className="h-16 w-16 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">{category}</span>
                  <h3 className="font-bold text-lg text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tags.map((t) => (
                      <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
