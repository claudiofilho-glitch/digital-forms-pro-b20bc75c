import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Placeholder — integrate with edge function or email service
    await new Promise((r) => setTimeout(r, 1000));
    toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
    setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    setSending(false);
  };

  const info = [
    { icon: Mail, label: "E-mail", value: "contato@interative.com.br" },
    { icon: Phone, label: "Telefone", value: "(00) 0000-0000" },
    { icon: MapPin, label: "Endereço", value: "Sua Cidade - Estado" },
    { icon: Clock, label: "Horário", value: "Seg a Sex, 8h às 18h" },
  ];

  return (
    <div>
      <section className="py-20 bg-gradient-to-br from-primary/10 to-background">
        <div className="container text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Fale <span className="text-primary">Conosco</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Entre em contato para solicitar um orçamento ou tirar suas dúvidas.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="rounded-xl border bg-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">Envie sua mensagem</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={sending}>
                  <Send className="h-4 w-4" />
                  {sending ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Informações de Contato</h2>
              <div className="space-y-4">
                {info.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4 rounded-xl border bg-card p-4">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-sm text-muted-foreground">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-primary/5 p-6 space-y-3">
                <h3 className="font-semibold text-foreground">Orçamento Rápido</h3>
                <p className="text-sm text-muted-foreground">
                  Precisa de um orçamento urgente? Ligue diretamente para nosso comercial
                  ou envie um WhatsApp.
                </p>
                <Button variant="outline" className="gap-2 border-primary text-primary">
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
