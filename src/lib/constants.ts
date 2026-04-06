export const STATUS_MAP = {
  pending: { label: "Pendente", class: "status-pending" },
  in_progress: { label: "Em andamento", class: "status-in-progress" },
  completed: { label: "Concluída", class: "status-completed" },
  cancelled: { label: "Cancelada", class: "bg-destructive/15 text-destructive" },
} as const;

export const PRIORITY_MAP = {
  low: { label: "Baixa", class: "bg-muted text-muted-foreground" },
  medium: { label: "Média", class: "status-pending" },
  high: { label: "Alta", class: "bg-destructive/15 text-destructive" },
  urgent: { label: "Urgente", class: "bg-destructive text-destructive-foreground" },
} as const;

export const SERVICE_TYPES = [
  "Elétrica",
  "Hidráulica",
  "Pintura",
  "Alvenaria",
  "Ar-condicionado",
  "Limpeza",
  "Jardinagem",
  "TI / Rede",
  "Geral",
] as const;
