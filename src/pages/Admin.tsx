import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Users, Shield, Wrench, User as UserIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRow {
  user_id: string;
  full_name: string;
  phone: string | null;
  role: AppRole;
  created_at: string;
}

const ROLE_CONFIG: Record<AppRole, { label: string; icon: typeof Shield; class: string }> = {
  admin: { label: "Administrador", icon: Shield, class: "bg-destructive/15 text-destructive" },
  technician: { label: "Técnico", icon: Wrench, class: "bg-primary/15 text-primary" },
  user: { label: "Usuário", icon: UserIcon, class: "bg-muted text-muted-foreground" },
};

export default function Admin() {
  const { role } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  useEffect(() => {
    if (role === "admin") fetchUsers();
  }, [role]);

  if (role !== "admin") return <Navigate to="/" replace />;

  const fetchUsers = async () => {
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, phone, created_at"),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    const profiles = profilesRes.data || [];
    const roles = rolesRes.data || [];

    const roleMap = new Map<string, AppRole>();
    for (const r of roles) {
      const current = roleMap.get(r.user_id);
      if (!current || r.role === "admin" || (r.role === "technician" && current === "user")) {
        roleMap.set(r.user_id, r.role);
      }
    }

    const merged: UserRow[] = profiles.map((p) => ({
      user_id: p.user_id,
      full_name: p.full_name,
      phone: p.phone,
      role: roleMap.get(p.user_id) || "user",
      created_at: p.created_at,
    }));

    merged.sort((a, b) => a.full_name.localeCompare(b.full_name));
    setUsers(merged);
    setLoading(false);
  };

  const changeRole = async (userId: string, newRole: AppRole) => {
    // Delete existing roles, then insert new one
    const { error: delError } = await supabase.from("user_roles").delete().eq("user_id", userId);
    if (delError) {
      toast({ title: "Erro", description: "Não foi possível alterar o perfil.", variant: "destructive" });
      return;
    }
    const { error: insError } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    if (insError) {
      toast({ title: "Erro", description: "Não foi possível alterar o perfil.", variant: "destructive" });
      return;
    }

    setUsers((prev) => prev.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u)));
    toast({ title: "Perfil atualizado", description: `Perfil alterado para ${ROLE_CONFIG[newRole].label}.` });
  };

  const filtered = users.filter((u) => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    technicians: users.filter((u) => u.role === "technician").length,
    regularUsers: users.filter((u) => u.role === "user").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
        <p className="text-muted-foreground text-sm">Administre perfis e permissões dos usuários</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Total" value={stats.total} />
        <StatCard icon={Shield} label="Admins" value={stats.admins} className="bg-destructive/15 text-destructive" />
        <StatCard icon={Wrench} label="Técnicos" value={stats.technicians} className="bg-primary/15 text-primary" />
        <StatCard icon={UserIcon} label="Usuários" value={stats.regularUsers} className="bg-muted text-muted-foreground" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="admin">Administrador</SelectItem>
            <SelectItem value="technician">Técnico</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
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
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden sm:table-cell">Telefone</TableHead>
                  <TableHead>Perfil Atual</TableHead>
                  <TableHead>Alterar Perfil</TableHead>
                  <TableHead className="hidden md:table-cell">Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((u) => {
                    const rc = ROLE_CONFIG[u.role];
                    return (
                      <TableRow key={u.user_id}>
                        <TableCell className="font-medium">{u.full_name || "Sem nome"}</TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {u.phone || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn("text-xs", rc.class)}>
                            <rc.icon className="mr-1 h-3 w-3" />
                            {rc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select value={u.role} onValueChange={(v) => changeRole(u.user_id, v as AppRole)}>
                            <SelectTrigger className="w-[150px] h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="technician">Técnico</SelectItem>
                              <SelectItem value="user">Usuário</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
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
