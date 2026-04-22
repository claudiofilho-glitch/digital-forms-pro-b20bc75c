import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Search, Printer, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { STATUS_MAP, SERVICE_TYPE_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import StatsCards from "@/components/dashboard/StatsCards";
import TechnicianStats from "@/components/dashboard/TechnicianStats";
import OrdersChart from "@/components/dashboard/OrdersChart";
import type { Database } from "@/integrations/supabase/types";

type ServiceOrder = Database["public"]["Tables"]["service_orders"]["Row"];

const PAGE_SIZE = 20;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });

  const fetchOrders = async () => {
    setLoading(true);
    const { data, count } = await supabase
      .from("service_orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    setOrders(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  };

  const fetchStats = async () => {
    const [totalRes, pendingRes, inProgressRes, completedRes] = await Promise.all([
      supabase.from("service_orders").select("*", { count: "exact", head: true }),
      supabase.from("service_orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("service_orders").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
      supabase.from("service_orders").select("*", { count: "exact", head: true }).eq("status", "completed"),
    ]);
    setStats({
      total: totalRes.count || 0,
      pending: pendingRes.count || 0,
      inProgress: inProgressRes.count || 0,
      completed: completedRes.count || 0,
    });
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    fetchStats();
    const channel = supabase
      .channel("service_orders_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_orders" },
        () => {
          fetchOrders();
          fetchStats();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, tab, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number.toString().includes(search) ||
      o.requester_name.toLowerCase().includes(search.toLowerCase()) ||
      (o.client_name && o.client_name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchPriority = priorityFilter === "all" || o.service_type === priorityFilter;
    const matchTab = tab === "all" || o.status === tab;
    return matchSearch && matchStatus && matchPriority && matchTab;
  });

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Visão geral das ordens de serviço</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Link to="/nova-os">
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova OS
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards total={stats.total} pending={stats.pending} inProgress={stats.inProgress} completed={stats.completed} />

      {/* Charts */}
      <OrdersChart orders={orders} />

      {/* Technician Stats */}
      <TechnicianStats orders={orders} />

      {/* Orders Table with Tabs */}
      <div className="space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">Todas ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Pendentes ({stats.pending})</TabsTrigger>
            <TabsTrigger value="in_progress">Em andamento ({stats.inProgress})</TabsTrigger>
            <TabsTrigger value="completed">Concluídas ({stats.completed})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, número, solicitante ou cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Tipo de Atendimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.keys(SERVICE_TYPE_MAP).map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table or Empty State */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <ClipboardList size={48} className="text-muted-foreground" />
              <h3 className="text-base font-semibold">Nenhuma OS encontrada</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Tente ajustar os filtros ou crie uma nova ordem de serviço
              </p>
              <Link to="/nova-os">
                <Button size="sm" className="mt-2">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nova OS
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Nº</TableHead>
                      <TableHead>Título</TableHead>
                      <TableHead className="hidden md:table-cell">Cliente</TableHead>
                      <TableHead className="hidden md:table-cell">Tipo de Atendimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Técnico</TableHead>
                      <TableHead className="hidden lg:table-cell">Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((order) => (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/os/${order.id}`)}
                      >
                        <TableCell className="font-mono text-sm font-medium">
                          {order.order_number}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {order.title}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {order.client_name || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary" className={cn("text-xs", SERVICE_TYPE_MAP[order.service_type]?.class || "bg-muted text-muted-foreground")}>
                            {SERVICE_TYPE_MAP[order.service_type]?.label || order.service_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn("text-xs", STATUS_MAP[order.status].class)}>
                            {STATUS_MAP[order.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {order.assigned_name || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between gap-4 border-t p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Próxima
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
