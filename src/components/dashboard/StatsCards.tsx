import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

function StatCard({ icon: Icon, label, value, className }: { icon: any; label: string; value: number; className?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", className || "bg-muted")}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StatsCards({ total, pending, inProgress, completed }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard icon={ClipboardList} label="Total" value={total} />
      <StatCard icon={AlertTriangle} label="Pendentes" value={pending} className="status-pending" />
      <StatCard icon={Clock} label="Em andamento" value={inProgress} className="status-in-progress" />
      <StatCard icon={CheckCircle} label="Concluídas" value={completed} className="status-completed" />
    </div>
  );
}
