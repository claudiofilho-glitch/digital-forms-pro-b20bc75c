import { useEffect, useState, useRef, useMemo } from "react";
import SignaturePad from "@/components/SignaturePad";
import MaintenanceChecklist from "@/components/MaintenanceChecklist";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { STATUS_MAP, SERVICE_TYPE_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowLeft, Printer, Calendar, MapPin, User, Wrench, Building2, FileDown, Clock, AlertTriangle, Trash2, UserPlus } from "lucide-react";
import logo from "@/assets/b02e6f02-2f51-4e38-a360-184129ade15d.png";
import type { Database } from "@/integrations/supabase/types";

type ServiceOrder = Database["public"]["Tables"]["service_orders"]["Row"];
type Status = Database["public"]["Enums"]["os_status"];

const SLA_HOURS = 24;

function useSlaCountdown(createdAt: string | undefined) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!createdAt) return { remaining: 0, total: SLA_HOURS * 3600 * 1000, percent: 0, expired: true, label: "--:--:--" };
    const created = new Date(createdAt).getTime();
    const deadline = created + SLA_HOURS * 3600 * 1000;
    const total = SLA_HOURS * 3600 * 1000;
    const remaining = Math.max(0, deadline - now);
    const percent = Math.max(0, (remaining / total) * 100);
    const expired = remaining <= 0;

    const hrs = Math.floor(remaining / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    const label = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    return { remaining, total, percent, expired, label };
  }, [createdAt, now]);
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("pending");
  const [technicians, setTechnicians] = useState<{ user_id: string; full_name: string }[]>([]);
  const [assignTo, setAssignTo] = useState("");
  

  const canEdit =
    role === "admin" ||
    role === "administrative" ||
    (role === "technician" && order?.assigned_to === user?.id);
  const sla = useSlaCountdown(order?.created_at);
  const slaFinished = order?.status === "completed" || order?.status === "cancelled";

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
          setAssignTo(data.assigned_to || "");
        }
        setLoading(false);
      });

    // Fetch technicians
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


  }, [id]);

  const handleAssign = async (techUserId: string) => {
    if (!order) return;
    const tech = technicians.find((t) => t.user_id === techUserId);
    const updates = { assigned_to: techUserId, assigned_name: tech?.full_name || "" };
    const { error } = await supabase.from("service_orders").update(updates).eq("id", order.id);
    if (error) {
      toast({ title: "Erro ao atribuir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Técnico atribuído com sucesso!" });
      setOrder({ ...order, ...updates });
      setAssignTo(techUserId);
    }
  };

  const hasChanges = order
    ? status !== order.status ||
      notes !== (order.notes || "") ||
      assignTo !== (order.assigned_to || "")
    : false;

  const handleUpdate = async () => {
    if (!order) return;
    const selectedTech = technicians.find((t) => t.user_id === assignTo);
    const updates: any = {
      notes,
      status,
      assigned_to: assignTo || null,
      assigned_name: selectedTech?.full_name || "",
    };
    if (status === "completed") {
      updates.completion_date = new Date().toISOString();
    }

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

  const handleDelete = async () => {
    if (!order || order.status !== "cancelled") return;
    if (!confirm(`Deseja excluir a OS ${order.order_number}? O número ficará disponível para reutilização.`)) return;
    const { error } = await supabase.from("service_orders").delete().eq("id", order.id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "OS excluída com sucesso! Número disponível para reutilização." });
      navigate("/helpdesk");
    }
  };

  const handlePrint = () => window.print();

  const handleTechSignature = async ({ signature }: { signature: string; name?: string }) => {
    if (!order) return;
    const updates = { technician_signature: signature, technician_signed_at: new Date().toISOString() };
    const { error } = await supabase.from("service_orders").update(updates).eq("id", order.id);
    if (error) {
      toast({ title: "Erro ao salvar assinatura", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Assinatura do técnico salva!" });
      setOrder({ ...order, ...updates });
    }
  };

  const handleClientSignature = async ({ signature, name }: { signature: string; name?: string }) => {
    if (!order) return;
    const updates = {
      client_signature: signature,
      client_signer_name: name || null,
      client_signed_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("service_orders").update(updates).eq("id", order.id);
    if (error) {
      toast({ title: "Erro ao salvar assinatura", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Assinatura do cliente salva!" });
      setOrder({ ...order, ...updates });
    }
  };

  const handleSavePDF = async () => {
    if (!cardRef.current || !order) return;
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save(`OS_${order.order_number}.pdf`);
  };


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

  const slaColor = slaFinished
    ? "text-muted-foreground"
    : sla.expired
      ? "text-destructive"
      : sla.percent < 25
        ? "text-warning"
        : "text-primary";

  const slaProgressColor = slaFinished
    ? "bg-muted"
    : sla.expired
      ? "bg-destructive"
      : sla.percent < 25
        ? "bg-warning"
        : "bg-primary";

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Action bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button variant="ghost" onClick={() => navigate("/helpdesk")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSavePDF} className="gap-2">
            <FileDown className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" /> Imprimir
          </Button>
          {role === "admin" && order.status === "cancelled" && (
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" /> Excluir OS
            </Button>
          )}
        </div>
      </div>

      {/* Main card */}
      <Card ref={cardRef} className="overflow-hidden border-0 shadow-lg">
        {/* Header band */}
        <div className="bg-white px-6 py-5 text-primary border-b">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Interative Tecnologia" className="h-14 w-auto rounded p-1" />
              <div>
                <p className="text-sm font-medium text-primary">Interative Tecnologia</p>
                <p className="text-xs text-primary/60">Ordem de Serviço</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-mono text-primary">{order.order_number}</p>
              <p className="text-xs text-primary/70">
                {new Date(order.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Status & SLA strip */}
        <div className="flex items-center justify-between flex-wrap gap-3 px-6 py-3 bg-muted/50 border-b">
          <div className="flex gap-2 items-center">
            <Badge variant="secondary" className={cn(STATUS_MAP[order.status].class, "text-xs px-3 py-1")}>
              {STATUS_MAP[order.status].label}
            </Badge>
            <Badge variant="secondary" className={cn(SERVICE_TYPE_MAP[order.service_type]?.class || "bg-muted text-muted-foreground", "text-xs px-3 py-1")}>
              {SERVICE_TYPE_MAP[order.service_type]?.label || order.service_type}
            </Badge>
          </div>

          {/* SLA countdown */}
          <div className="flex items-center gap-3 min-w-[220px]">
            {sla.expired && !slaFinished ? (
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            ) : (
              <Clock className={cn("h-4 w-4 shrink-0", slaColor)} />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">SLA 24h</span>
                <span className={cn("text-xs font-mono font-bold", slaColor)}>
                  {slaFinished ? "Encerrada" : sla.expired ? "Expirado" : sla.label}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-1000", slaProgressColor)}
                  style={{ width: `${slaFinished ? 100 : sla.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-6 space-y-6">
          {/* Title & description */}
          <div>
            <h1 className="text-xl font-bold text-foreground">{order.title}</h1>
            {order.description && (
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{order.description}</p>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem icon={Wrench} label="Tipo de Serviço" value={order.service_type} />
            <InfoItem icon={Building2} label="Cliente" value={order.client_name || "—"} />
            <InfoItem icon={MapPin} label="Local" value={order.location || "—"} />
            <InfoItem icon={User} label="Solicitante" value={order.requester_name} />
            <InfoItem icon={User} label="Técnico Responsável" value={order.assigned_name || "Não atribuído"} />
            <InfoItem icon={Calendar} label="Data e Hora Previstos" value={order.scheduled_date ? new Date(order.scheduled_date).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"} />
            <InfoItem icon={Clock} label="Hora de Conclusão" value={order.completion_date ? new Date(order.completion_date).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"} />
          </div>
          {/* Quick assign buttons (visible for admins when not in edit mode too) */}
          {role === "admin" && order.status !== "completed" && order.status !== "cancelled" && (
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3 print:hidden">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <UserPlus className="h-4 w-4" /> Atribuir Técnico
              </h3>
              <div className="flex gap-2 flex-wrap">
                <Select value={assignTo} onValueChange={(v) => setAssignTo(v)}>
                  <SelectTrigger className="w-[250px]"><SelectValue placeholder="Selecione um técnico" /></SelectTrigger>
                  <SelectContent>
                    {technicians.map((t) => (
                      <SelectItem key={t.user_id} value={t.user_id}>{t.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="default"
                  onClick={() => { if (assignTo) handleAssign(assignTo); }}
                  disabled={!assignTo}
                  className="gap-2"
                >
                  <UserPlus className="h-4 w-4" /> Atribuir ao técnico
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { if (user) handleAssign(user.id); }}
                  className="gap-2"
                >
                  <User className="h-4 w-4" /> Atribuir a mim
                </Button>
              </div>
            </div>
          )}

          {/* Notes display (read-only for non-editors) */}
          {order.notes && !canEdit && (
            <div className="rounded-lg bg-muted/50 p-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Observações</Label>
              <p className="mt-1 text-sm whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}

          {/* Edit section */}
          {canEdit && (
            <div className="border-t pt-6 space-y-4 print:hidden">
              <h3 className="font-semibold text-foreground">Atualizar OS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>
              <div className="space-y-2">
                <Label>Observações do técnico</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Descreva o que foi feito..." />
              </div>
              {status === "completed" && (!order.technician_signature || !order.client_signature) && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Ambas as assinaturas são obrigatórias para concluir a OS.
                </p>
              )}
              <Button
                onClick={handleUpdate}
                disabled={
                  !hasChanges ||
                  (status === "completed" && (!order.technician_signature || !order.client_signature))
                }
              >
                Salvar alterações
              </Button>
            </div>
          )}

          {/* Checklist – only for preventive maintenance */}
          {order.service_type === "Manutenção Preventiva" && (
            <div className="border-t pt-6">
              <MaintenanceChecklist
                orderId={order.id}
                canEdit={canEdit && order.status !== "completed" && order.status !== "cancelled"}
              />
            </div>
          )}

          {/* Signature block – only when completed or being marked as completed */}
          {(order.status === "completed" || status === "completed") && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-foreground">Assinaturas de conclusão</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SignaturePad
                  label="Assinatura do técnico"
                  existingSignature={order.technician_signature}
                  existingDate={order.technician_signed_at}
                  onSave={handleTechSignature}
                />
                <SignaturePad
                  label="Assinatura do cliente"
                  showNameField
                  existingSignature={order.client_signature}
                  existingName={order.client_signer_name}
                  existingDate={order.client_signed_at}
                  onSave={handleClientSignature}
                />
              </div>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="px-6 py-3 bg-muted/30 border-t text-center">
          <p className="text-[10px] text-muted-foreground tracking-wide">
            Interative Tecnologia · Ordem de Serviço {order.order_number} · Gerado em {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
      </Card>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <div className="rounded-md bg-primary/10 p-2">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}
