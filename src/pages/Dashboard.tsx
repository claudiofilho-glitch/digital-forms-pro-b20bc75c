import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Search, Printer, Eye } from "lucide-react";
import { STATUS_MAP, PRIORITY_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";
import StatsCards from "@/components/dashboard/StatsCards";
import TechnicianStats from "@/components/dashboard/TechnicianStats";
import OrdersChart from "@/components/dashboard/OrdersChart";
import type { Database } from "@/integrations/supabase/types";

type ServiceOrder = Database["public"]["Tables"]["service_orders"]["Row"];

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("service_orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.order_number.toString().includes(search) ||
      o.requester_name.toLowerCase().includes(search.toLowerCase()) ||
      (o.client_name && o.client_name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchPriority = priorityFilter === "all" || o.priority === priorityFilter;
    const matchTab = tab === "all" || o.status === tab;
    return matchSearch && matchStatus && matchPriority && matchTab;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    inProgress: orders.filter((o) => o.status === "in_progress").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

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
            <TabsTrigger value="all">Todas ({orders.length})</TabsTrigger>
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
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas prioridades</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Nº</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Prioridade</TableHead>
                    <TableHead className="hidden lg:table-cell">Técnico</TableHead>
                    <TableHead className="hidden lg:table-cell">Data</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                        Nenhuma ordem de serviço encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((order) => (
                      <TableRow key={order.id} className="group">
                        <TableCell className="font-mono text-sm font-medium">
                          {order.order_number}
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {order.title}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {order.client_name || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {order.service_type}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn("text-xs", STATUS_MAP[order.status].class)}>
                            {STATUS_MAP[order.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary" className={cn("text-xs", PRIORITY_MAP[order.priority].class)}>
                            {PRIORITY_MAP[order.priority].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {order.assigned_name || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Link to={`/os/${order.id}`}>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
