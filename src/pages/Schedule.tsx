import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_MAP } from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";

type ServiceOrder = Database["public"]["Tables"]["service_orders"]["Row"];

type ViewMode = "week" | "month";

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d: Date) {
  const x = startOfDay(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
}
function startOfMonthGrid(d: Date) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  return startOfWeek(first);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function Schedule() {
  const { role, user } = useAuth();
  const [view, setView] = useState<ViewMode>("week");
  const [cursor, setCursor] = useState(new Date());
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [technicians, setTechnicians] = useState<{ user_id: string; full_name: string }[]>([]);
  const [techFilter, setTechFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const isStaff = role === "admin" || role === "administrative" || role === "coordinator";

  const range = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(cursor);
      return { start, end: addDays(start, 7), days: 7 };
    }
    const start = startOfMonthGrid(cursor);
    return { start, end: addDays(start, 42), days: 42 };
  }, [cursor, view]);

  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from("service_orders")
      .select("*")
      .gte("scheduled_date", range.start.toISOString())
      .lt("scheduled_date", range.end.toISOString())
      .not("scheduled_date", "is", null)
      .order("scheduled_date", { ascending: true });

    if (techFilter !== "all") q = q.eq("assigned_to", techFilter);

    q.then(({ data }) => {
      setOrders(data || []);
      setLoading(false);
    });
  }, [range.start, range.end, techFilter]);

  useEffect(() => {
    if (!isStaff) return;
    supabase
      .from("user_roles")
      .select("user_id, role")
      .in("role", ["technician", "admin"])
      .then(async ({ data: roles }) => {
        if (!roles?.length) return;
        const ids = [...new Set(roles.map((r) => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", ids);
        setTechnicians(profiles || []);
      });
  }, [isStaff]);

  const ordersByDay = useMemo(() => {
    const map = new Map<string, ServiceOrder[]>();
    for (const o of orders) {
      if (!o.scheduled_date) continue;
      const key = startOfDay(new Date(o.scheduled_date)).toISOString();
      const arr = map.get(key) || [];
      arr.push(o);
      map.set(key, arr);
    }
    return map;
  }, [orders]);

  const goPrev = () => {
    const d = new Date(cursor);
    if (view === "week") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCursor(d);
  };
  const goNext = () => {
    const d = new Date(cursor);
    if (view === "week") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCursor(d);
  };
  const goToday = () => setCursor(new Date());

  const headerLabel = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(cursor);
      const end = addDays(start, 6);
      return `${start.getDate()}/${start.getMonth() + 1} – ${end.getDate()}/${end.getMonth() + 1}/${end.getFullYear()}`;
    }
    return `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;
  }, [cursor, view]);

  const days = useMemo(() => {
    return Array.from({ length: range.days }, (_, i) => addDays(range.start, i));
  }, [range]);

  const today = startOfDay(new Date());

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Agenda do Técnico
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualização das Ordens de Serviço agendadas
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isStaff && (
            <Select value={techFilter} onValueChange={setTechFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os técnicos</SelectItem>
                {technicians.map((t) => (
                  <SelectItem key={t.user_id} value={t.user_id}>{t.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex rounded-md border bg-card overflow-hidden">
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("week")}
              className="rounded-none"
            >
              Semana
            </Button>
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
              className="rounded-none"
            >
              Mês
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goPrev}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={goToday}>Hoje</Button>
            <Button variant="outline" size="icon" onClick={goNext}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <CardTitle className="text-base font-semibold capitalize">{headerLabel}</CardTitle>
          <div className="text-xs text-muted-foreground">
            {orders.length} OS agendada{orders.length === 1 ? "" : "s"}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : view === "month" ? (
            <MonthGrid days={days} cursor={cursor} today={today} ordersByDay={ordersByDay} />
          ) : (
            <WeekGrid days={days} today={today} ordersByDay={ordersByDay} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MonthGrid({
  days, cursor, today, ordersByDay,
}: { days: Date[]; cursor: Date; today: Date; ordersByDay: Map<string, ServiceOrder[]> }) {
  return (
    <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
      {WEEK_DAYS.map((d) => (
        <div key={d} className="bg-muted text-xs font-semibold text-center py-2 text-muted-foreground uppercase">
          {d}
        </div>
      ))}
      {days.map((d) => {
        const key = startOfDay(d).toISOString();
        const dayOrders = ordersByDay.get(key) || [];
        const isOtherMonth = d.getMonth() !== cursor.getMonth();
        const isToday = sameDay(d, today);
        return (
          <div
            key={key}
            className={cn(
              "bg-card min-h-[110px] p-1.5 flex flex-col gap-1",
              isOtherMonth && "bg-muted/30",
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full",
                isToday && "bg-primary text-primary-foreground",
                isOtherMonth && !isToday && "text-muted-foreground",
              )}>
                {d.getDate()}
              </span>
              {dayOrders.length > 2 && (
                <span className="text-[10px] text-muted-foreground">+{dayOrders.length - 2}</span>
              )}
            </div>
            <div className="flex flex-col gap-1 overflow-hidden">
              {dayOrders.slice(0, 2).map((o) => (
                <OrderChip key={o.id} order={o} compact />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeekGrid({
  days, today, ordersByDay,
}: { days: Date[]; today: Date; ordersByDay: Map<string, ServiceOrder[]> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
      {days.map((d) => {
        const key = startOfDay(d).toISOString();
        const dayOrders = ordersByDay.get(key) || [];
        const isToday = sameDay(d, today);
        return (
          <div
            key={key}
            className={cn(
              "rounded-lg border bg-card flex flex-col min-h-[200px]",
              isToday && "border-primary border-2",
            )}
          >
            <div className={cn(
              "px-2 py-2 border-b text-center",
              isToday && "bg-primary/10",
            )}>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">
                {WEEK_DAYS[d.getDay()]}
              </div>
              <div className={cn("text-lg font-bold", isToday && "text-primary")}>
                {d.getDate()}/{d.getMonth() + 1}
              </div>
            </div>
            <div className="p-2 flex-1 flex flex-col gap-2 overflow-y-auto">
              {dayOrders.length === 0 ? (
                <p className="text-[11px] text-muted-foreground text-center py-3">Sem OS</p>
              ) : (
                dayOrders.map((o) => <OrderChip key={o.id} order={o} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderChip({ order, compact = false }: { order: ServiceOrder; compact?: boolean }) {
  const status = STATUS_MAP[order.status];
  const time = order.scheduled_date
    ? new Date(order.scheduled_date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "";

  if (compact) {
    return (
      <Link
        to={`/helpdesk/os/${order.id}`}
        className={cn(
          "block text-[10px] px-1.5 py-0.5 rounded truncate font-medium hover:opacity-80 transition-opacity",
          status?.class || "bg-muted text-muted-foreground",
        )}
        title={`${order.order_number} - ${order.title}`}
      >
        {time} {order.order_number}
      </Link>
    );
  }

  return (
    <Link
      to={`/helpdesk/os/${order.id}`}
      className="block rounded-md border bg-background p-2 hover:border-primary hover:shadow-sm transition-all"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono font-bold">{order.order_number}</span>
        <Badge variant="secondary" className={cn(status?.class, "text-[9px] px-1 py-0")}>
          {status?.label}
        </Badge>
      </div>
      <p className="text-xs font-medium truncate">{order.title}</p>
      <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
        {time && <div className="font-semibold text-foreground">🕒 {time}</div>}
        {order.assigned_name && (
          <div className="flex items-center gap-1 truncate"><User className="h-2.5 w-2.5" /> {order.assigned_name}</div>
        )}
        {order.client_name && (
          <div className="flex items-center gap-1 truncate"><MapPin className="h-2.5 w-2.5" /> {order.client_name}</div>
        )}
      </div>
    </Link>
  );
}
