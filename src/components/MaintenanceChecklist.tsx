import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CheckSquare, CheckCircle2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ChecklistResponse = Database["public"]["Tables"]["os_checklist_responses"]["Row"];

interface MaintenanceChecklistProps {
  orderId: string;
  canEdit: boolean;
}

export default function MaintenanceChecklist({ orderId, canEdit }: MaintenanceChecklistProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      // 1. Try to fetch existing responses
      const { data: existing } = await supabase
        .from("os_checklist_responses")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at");

      if (cancelled) return;

      if (existing && existing.length > 0) {
        setItems(existing);
        setLoading(false);
        return;
      }

      // 2. None found — bootstrap from active templates
      const { data: templates } = await supabase
        .from("checklist_templates")
        .select("*")
        .eq("active", true)
        .order("order_index");

      if (cancelled || !templates?.length) {
        setLoading(false);
        return;
      }

      const rows = templates.map((t) => ({
        order_id: orderId,
        template_id: t.id,
        item: t.item,
        checked: false,
      }));

      const { data: inserted, error } = await supabase
        .from("os_checklist_responses")
        .insert(rows)
        .select();

      if (cancelled) return;

      if (error) {
        // Likely a race condition where the trigger already inserted them — refetch
        const { data: refetched } = await supabase
          .from("os_checklist_responses")
          .select("*")
          .eq("order_id", orderId)
          .order("created_at");
        if (!cancelled && refetched) setItems(refetched);
      } else if (inserted) {
        setItems(inserted);
      }
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const handleToggle = async (responseId: string, checked: boolean) => {
    const updates = checked
      ? {
          checked: true,
          checked_at: new Date().toISOString(),
          checked_by_name: profile?.full_name || "Técnico",
        }
      : { checked: false, checked_at: null, checked_by_name: null };

    // Optimistic update
    setItems((prev) =>
      prev.map((it) => (it.id === responseId ? { ...it, ...updates } : it))
    );

    const { error } = await supabase
      .from("os_checklist_responses")
      .update(updates)
      .eq("id", responseId);

    if (error) {
      toast({ title: "Erro ao atualizar item", description: error.message, variant: "destructive" });
      // Revert
      const { data } = await supabase
        .from("os_checklist_responses")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at");
      if (data) setItems(data);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Nenhum item de checklist disponível.
      </div>
    );
  }

  const checkedCount = items.filter((i) => i.checked).length;
  const total = items.length;
  const percent = Math.round((checkedCount / total) * 100);
  const allDone = checkedCount === total;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Checklist de Manutenção</h3>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {checkedCount} de {total} itens verificados
          </span>
          <span className={cn("font-mono font-bold", allDone ? "text-success" : "text-primary")}>
            {percent}%
          </span>
        </div>
        <Progress value={percent} className="h-2" />
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border transition-colors",
              item.checked ? "bg-primary/5 border-primary/20" : "bg-card hover:bg-muted/50"
            )}
          >
            <Checkbox
              id={`chk-${item.id}`}
              checked={item.checked}
              onCheckedChange={(v) => handleToggle(item.id, v as boolean)}
              disabled={!canEdit}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <label
                htmlFor={`chk-${item.id}`}
                className={cn(
                  "text-sm font-medium block",
                  canEdit ? "cursor-pointer" : "cursor-default",
                  item.checked && "line-through text-muted-foreground"
                )}
              >
                {item.item}
              </label>
              {item.checked && item.checked_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  {item.checked_by_name && <span className="font-medium">{item.checked_by_name}</span>}
                  {item.checked_by_name && " · "}
                  {new Date(item.checked_at).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(item.checked_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* All done banner */}
      {allDone && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30 text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">Todos os itens verificados!</p>
        </div>
      )}
    </div>
  );
}
