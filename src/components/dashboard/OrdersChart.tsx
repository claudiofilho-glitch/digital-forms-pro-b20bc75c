import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts";
import { BarChart3, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type ServiceOrder = Database["public"]["Tables"]["service_orders"]["Row"];

interface OrdersChartProps {
  orders: ServiceOrder[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(38 92% 50%)",
  in_progress: "hsl(217 91% 60%)",
  completed: "hsl(142 71% 40%)",
  cancelled: "hsl(0 72% 51%)",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
};

export default function OrdersChart({ orders }: OrdersChartProps) {
  const [range, setRange] = useState<"7d" | "30d" | "year">("7d");

  const buildChartData = () => {
    if (range === "7d") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);
        const count = orders.filter((o) => {
          const created = new Date(o.created_at);
          return created >= d && created < nextDay;
        }).length;
        return { name: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit" }), total: count };
      });
    }
    if (range === "30d") {
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        d.setHours(0, 0, 0, 0);
        const nextDay = new Date(d);
        nextDay.setDate(nextDay.getDate() + 1);
        const count = orders.filter((o) => {
          const created = new Date(o.created_at);
          return created >= d && created < nextDay;
        }).length;
        return { name: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), total: count };
      });
    }
    // year — group by month
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      const nextMonth = new Date(d);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const count = orders.filter((o) => {
        const created = new Date(o.created_at);
        return created >= d && created < nextMonth;
      }).length;
      return { name: d.toLocaleDateString("pt-BR", { month: "short" }), total: count };
    });
  };

  const dailyData = buildChartData();

  // Technician stacked bar data
  const techMap = new Map<string, Record<string, number>>();
  orders.forEach((o) => {
    const name = o.assigned_name || "Não atribuído";
    if (!techMap.has(name)) {
      techMap.set(name, { pending: 0, in_progress: 0, completed: 0, cancelled: 0 });
    }
    const entry = techMap.get(name)!;
    entry[o.status] = (entry[o.status] || 0) + 1;
  });

  const techData = Array.from(techMap.entries())
    .map(([name, counts]) => ({ name, ...counts } as { name: string; pending: number; in_progress: number; completed: number; cancelled: number }))
    .sort((a, b) => {
      const totalA = a.pending + a.in_progress + a.completed + a.cancelled;
      const totalB = b.pending + b.in_progress + b.completed + b.cancelled;
      return totalB - totalA;
    });

  const barChartConfig = {
    total: { label: "OS Criadas", color: "hsl(var(--primary))" },
  };

  const techChartConfig = Object.entries(STATUS_LABELS).reduce((acc, [key, label]) => {
    acc[key] = { label, color: STATUS_COLORS[key] };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  // Client stacked bar data
  const clientMap = new Map<string, Record<string, number>>();
  orders.forEach((o) => {
    const name = o.client_name || "Sem cliente";
    if (!clientMap.has(name)) {
      clientMap.set(name, { pending: 0, in_progress: 0, completed: 0, cancelled: 0 });
    }
    const entry = clientMap.get(name)!;
    entry[o.status] = (entry[o.status] || 0) + 1;
  });

  const clientData = Array.from(clientMap.entries())
    .map(([name, counts]) => ({ name, ...counts } as { name: string; pending: number; in_progress: number; completed: number; cancelled: number }))
    .sort((a, b) => {
      const totalA = a.pending + a.in_progress + a.completed + a.cancelled;
      const totalB = b.pending + b.in_progress + b.completed + b.cancelled;
      return totalB - totalA;
    });

  const clientChartHeight = Math.max(220, clientData.length * 40);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              OS Criadas — Últimos 7 dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barChartConfig} className="h-[220px] w-full">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              OS por Técnico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={techChartConfig} className="h-[220px] w-full">
              <BarChart data={techData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend formatter={(value: string) => STATUS_LABELS[value] || value} />
                {Object.keys(STATUS_COLORS).map((status) => (
                  <Bar key={status} dataKey={status} stackId="a" fill={STATUS_COLORS[status]} radius={0} />
                ))}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Chamados por Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={techChartConfig} className="w-full" style={{ height: clientChartHeight }}>
            <BarChart data={clientData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} width={120} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend formatter={(value: string) => STATUS_LABELS[value] || value} />
              {Object.keys(STATUS_COLORS).map((status) => (
                <Bar key={status} dataKey={status} stackId="a" fill={STATUS_COLORS[status]} radius={0} />
              ))}
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}