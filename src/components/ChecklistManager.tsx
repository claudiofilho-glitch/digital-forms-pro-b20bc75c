import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ClipboardCheck, GripVertical, Trash2, Plus } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Template = Database["public"]["Tables"]["checklist_templates"]["Row"];

export default function ChecklistManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("checklist_templates")
      .select("*")
      .order("order_index");
    if (error) {
      toast({ title: "Erro ao carregar checklist", description: error.message, variant: "destructive" });
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    const text = newItem.trim();
    if (!text) return;
    setAdding(true);
    try {
      const nextIndex = items.length > 0 ? Math.max(...items.map((i) => i.order_index)) + 1 : 1;
      const { data, error } = await supabase
        .from("checklist_templates")
        .insert({ item: text, order_index: nextIndex, active: true })
        .select()
        .single();
      if (error) throw error;
      if (data) setItems((prev) => [...prev, data]);
      setNewItem("");
      toast({ title: "Item adicionado!" });
    } catch (err: any) {
      toast({ title: "Erro ao adicionar", description: err.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, active } : i)));
    const { error } = await supabase.from("checklist_templates").update({ active }).eq("id", id);
    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      load();
    }
  };

  const handleDelete = async (id: string, item: string) => {
    if (!confirm(`Excluir o item "${item}"? As respostas em OS existentes serão removidas.`)) return;
    const { error } = await supabase.from("checklist_templates").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast({ title: "Item excluído!" });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Checklist — Manutenção Preventiva
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new item */}
        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Descreva um novo item de verificação..."
            disabled={adding}
          />
          <Button onClick={handleAdd} disabled={adding || !newItem.trim()} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Adicionar
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Nenhum item cadastrado. Adicione o primeiro acima.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors",
                  !item.active && "bg-muted/40"
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <span
                  className={cn(
                    "flex-1 text-sm font-medium break-words",
                    item.active ? "text-foreground" : "line-through text-muted-foreground"
                  )}
                >
                  {item.item}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={item.active}
                    onCheckedChange={(v) => handleToggleActive(item.id, v)}
                    aria-label={item.active ? "Desativar item" : "Ativar item"}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id, item.item)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Excluir item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Itens inativos não aparecerão em novas OS de manutenção preventiva. Excluir um item remove também as respostas em OS já existentes.
        </p>
      </CardContent>
    </Card>
  );
}
