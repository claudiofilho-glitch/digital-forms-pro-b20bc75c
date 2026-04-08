import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { STATUS_MAP, PRIORITY_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowLeft, Printer, Calendar, MapPin, User, Wrench, Building2 } from "lucide-react";
import logo from "@/assets/b02e6f02-2f51-4e38-a360-184129ade15d.png";
import type { Database } from "@/integrations/supabase/types";

type ServiceOrder = Database["public"]["Tables"]["service_orders"]["Row"];
type Status = Database["public"]["Enums"]["os_status"];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("pending");

  const canEdit = role === "admin" || (role === "technician" && order?.assigned_to === user?.id);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("service_orders")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setOrder(data);
          setNotes(data.notes || "");
          setStatus(data.status);
        }
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = async () => {
    if (!order) return;
    const updates: any = { notes, status };
    if (status === "completed") updates.completion_date = new Date().toISOString();

    const { error } = await supabase
      .from("service_orders")
      .update(updates)
      .eq("id", order.id);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "OS atualizada com sucesso!" });
      setOrder({ ...order, ...updates });
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Ordem de serviço não encontrada.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" /> Imprimir
        </Button>
      </div>

      <Card>
        <CardHeader>
          {/* Logo for print */}
          <div className="hidden print:flex justify-center mb-4">
            <img src={logo} alt="Interative Tecnosegurança" className="h-20 w-auto" />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-mono text-muted-foreground">OS #{order.order_number}</p>
              <CardTitle className="text-xl">{order.title}</CardTitle>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className={cn(STATUS_MAP[order.status].class)}>
                {STATUS_MAP[order.status].label}
              </Badge>
              <Badge variant="secondary" className={cn(PRIORITY_MAP[order.priority].class)}>
                {PRIORITY_MAP[order.priority].label}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {order.description && (
            <div>
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Descrição</Label>
              <p className="mt-1 text-sm whitespace-pre-wrap">{order.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem icon={Wrench} label="Tipo" value={order.service_type} />
            <InfoItem icon={Building2} label="Cliente" value={(order as any).client_name || "—"} />
            <InfoItem icon={MapPin} label="Local" value={order.location || "—"} />
            <InfoItem icon={User} label="Solicitante" value={order.requester_name} />
            <InfoItem icon={User} label="Técnico" value={order.assigned_name || "Não atribuído"} />
            <InfoItem icon={Calendar} label="Criada em" value={new Date(order.created_at).toLocaleDateString("pt-BR")} />
            <InfoItem icon={Calendar} label="Prevista" value={order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString("pt-BR") : "—"} />
          </div>

          {canEdit && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold">Atualizar OS</h3>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observações do técnico</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Descreva o que foi feito..." />
              </div>
              <Button onClick={handleUpdate}>Salvar alterações</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
