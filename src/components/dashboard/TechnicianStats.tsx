import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ServiceOrder = Database["public"]["Tables"]["service_orders"]["Row"];

interface TechnicianStatsProps {
  orders: ServiceOrder[];
}

interface TechnicianData {
  name: string;
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

export default function TechnicianStats({ orders }: TechnicianStatsProps) {
  const techMap = new Map<string, TechnicianData>();

  orders.forEach((o) => {
    const name = o.assigned_name || "Não atribuído";
    const key = o.assigned_to || "unassigned";
    if (!techMap.has(key)) {
      techMap.set(key, { name, total: 0, pending: 0, inProgress: 0, completed: 0 });
    }
    const t = techMap.get(key)!;
    t.total++;
    if (o.status === "pending") t.pending++;
    if (o.status === "in_progress") t.inProgress++;
    if (o.status === "completed") t.completed++;
  });

  const techs = Array.from(techMap.values()).sort((a, b) => b.total - a.total);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Técnicos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {techs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum técnico encontrado</p>
        ) : (
          techs.map((tech) => (
            <div key={tech.name} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{tech.name}</p>
                <p className="text-xs text-muted-foreground">{tech.total} OS no total</p>
              </div>
              <div className="flex gap-1.5">
                {tech.pending > 0 && (
                  <Badge variant="secondary" className="status-pending text-xs">{tech.pending} pend.</Badge>
                )}
                {tech.inProgress > 0 && (
                  <Badge variant="secondary" className="status-in-progress text-xs">{tech.inProgress} andamento</Badge>
                )}
                {tech.completed > 0 && (
                  <Badge variant="secondary" className="status-completed text-xs">{tech.completed} concl.</Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
