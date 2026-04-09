import { Camera, Shield, Lock, Network, Monitor, Wifi, Server, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const services = [
  {
    icon: Camera, title: "CFTV e Câmeras",
    desc: "Instalação e manutenção de sistemas de circuito fechado de TV com câmeras IP e analógicas de alta resolução. Acesso remoto via aplicativo para monitoramento em tempo real.",
    features: ["Câmeras IP e analógicas", "DVR/NVR de última geração", "Acesso remoto 24h", "Visão noturna infravermelha"],
  },
  {
    icon: Shield, title: "Alarmes e Sensores",
    desc: "Sistemas de alarme monitorados com sensores de presença, abertura e movimento. Notificações instantâneas no seu celular.",
    features: ["Alarmes monitorados", "Sensores de presença", "Cercas elétricas", "Botão de pânico"],
  },
  {
    icon: Lock, title: "Controle de Acesso",
    desc: "Soluções completas de controle de acesso com biometria, cartão de proximidade, senhas e reconhecimento facial.",
    features: ["Biometria digital", "Cartão de proximidade", "Reconhecimento facial", "Catracas e torniquetes"],
  },
  {
    icon: Network, title: "Redes e Cabeamento",
    desc: "Projetos de cabeamento estruturado, redes corporativas e residenciais com certificação e garantia.",
    features: ["Cabeamento estruturado", "Redes Wi-Fi corporativas", "Certificação de rede", "Rack e organização"],
  },
  {
    icon: Monitor, title: "Automação",
    desc: "Automação de ambientes residenciais e comerciais com controle de iluminação, climatização e cortinas.",
    features: ["Iluminação inteligente", "Climatização automatizada", "Cortinas motorizadas", "Integração com assistentes"],
  },
  {
    icon: Wifi, title: "Redes Wi-Fi",
    desc: "Projetos de redes Wi-Fi de alta performance para empresas, hotéis, clínicas e eventos.",
    features: ["Access Points profissionais", "Gestão centralizada", "Hotspot com login", "Análise de cobertura"],
  },
  {
    icon: Server, title: "Infraestrutura de TI",
    desc: "Consultoria e implementação de infraestrutura de TI, servidores, backup e segurança de dados.",
    features: ["Servidores", "Backup e recuperação", "Firewall e segurança", "Cloud e virtualização"],
  },
  {
    icon: Headphones, title: "Suporte Técnico",
    desc: "Suporte técnico especializado com atendimento remoto e presencial. Contratos de manutenção preventiva.",
    features: ["Suporte remoto", "Manutenção preventiva", "Atendimento 24h", "SLA garantido"],
  },
];

export default function Services() {
  return (
    <div>
      <section className="py-20 bg-gradient-to-br from-primary/10 to-background">
        <div className="container text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Nossos <span className="text-primary">Serviços</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Oferecemos soluções completas em segurança eletrônica, automação e infraestrutura de TI.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container space-y-8">
          {services.map(({ icon: Icon, title, desc, features }, i) => (
            <div
              key={title}
              className={`rounded-xl border bg-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start hover:shadow-md transition-shadow ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="shrink-0 inline-flex rounded-xl bg-primary/10 p-4 text-primary">
                <Icon className="h-10 w-10" />
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-xl font-bold text-foreground">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
                <div className="flex flex-wrap gap-2">
                  {features.map((f) => (
                    <span key={f} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-bold">Precisa de algum desses serviços?</h2>
          <p className="text-primary-foreground/80">Entre em contato para um orçamento sem compromisso.</p>
          <Link to="/contato">
            <Button size="lg" variant="secondary" className="gap-2">
              Solicitar Orçamento <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
