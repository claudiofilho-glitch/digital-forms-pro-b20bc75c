import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SERVICE_TYPES } from "@/lib/constants";

export default function NewOrder() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  const [technicians, setTechnicians] = useState<{ user_id: string; full_name: string }[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    service_type: "Atendimento Geral",
    location: "",
    scheduled_date: "",
    client_id: "",
    assigned_to: "",
  });

  useEffect(() => {
    supabase.from("clients").select("id, name").order("name").then(({ data }) => {
      setClients((data as any[]) || []);
    });
    // Fetch technicians (users with technician or admin role)
    supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["technician", "admin"])
      .then(async ({ data: roles }) => {
        if (!roles?.length) return;
        const userIds = [...new Set(roles.map((r) => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);
        setTechnicians(profiles || []);
      });
  }, []);

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const getNextOrderNumber = async () => {
    const currentYear = new Date().getFullYear().toString();
    const { data, error } = await supabase
      .from("service_orders")
      .select("order_number")
      .like("order_number", `${currentYear}-%`);

    if (error) throw error;

    const usedNumbers = new Set(
      (data || [])
        .map(({ order_number }) => Number(order_number.split("-")[1]))
        .filter((value) => Number.isFinite(value) && value > 0)
    );

    let nextNumber = 1;
    while (usedNumbers.has(nextNumber)) nextNumber += 1;

    return `${currentYear}-${String(nextNumber).padStart(4, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const selectedClient = clients.find((c) => c.id === form.client_id);
      const orderNumber = await getNextOrderNumber();

      const selectedTech = technicians.find((t) => t.user_id === form.assigned_to);

      const { error } = await supabase.from("service_orders").insert({
        order_number: orderNumber,
        title: form.title,
        description: form.description,
        service_type: form.service_type,
        location: form.location,
        scheduled_date: form.scheduled_date || null,
        requester_id: user.id,
        requester_name: profile?.full_name || user.email || "",
        client_id: form.client_id || null,
        client_name: selectedClient?.name || "",
        assigned_to: form.assigned_to || null,
        assigned_name: selectedTech?.full_name || "",
      });

      if (error) throw error;

      toast({ title: "OS criada com sucesso!" });
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tente novamente.";
      toast({ title: "Erro ao criar OS", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Nova Ordem de Serviço</CardTitle>
          <CardDescription>Preencha os dados da solicitação de manutenção</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={form.client_id} onValueChange={(v) => update("client_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Ex:Catraca girando livre" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Descreva brevemente o problema..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Atendimento</Label>
              <Select value={form.service_type} onValueChange={(v) => update("service_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input id="location" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Ex: Recepção A" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data prevista</Label>
                <Input id="date" type="date" value={form.scheduled_date} onChange={(e) => update("scheduled_date", e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Técnico Responsável</Label>
              <div className="flex gap-2">
                <Select value={form.assigned_to} onValueChange={(v) => update("assigned_to", v)}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Selecione um técnico" /></SelectTrigger>
                  <SelectContent>
                    {technicians.map((t) => (
                      <SelectItem key={t.user_id} value={t.user_id}>{t.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (user) update("assigned_to", user.id);
                  }}
                  className="whitespace-nowrap"
                >
                  Atribuir a mim
                </Button>
              </div>
              {form.assigned_to && (
                <p className="text-xs text-muted-foreground">
                  Atribuído a: {technicians.find((t) => t.user_id === form.assigned_to)?.full_name || profile?.full_name || "Você"}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Criando..." : "Criar Ordem de Serviço"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
