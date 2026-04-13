export const STATUS_MAP = {
  pending: { label: "Pendente", class: "status-pending" },
  in_progress: { label: "Em andamento", class: "status-in-progress" },
  completed: { label: "Concluída", class: "status-completed" },
  cancelled: { label: "Cancelada", class: "bg-destructive/15 text-destructive" },
} as const;

export const SERVICE_TYPE_MAP: Record<string, { label: string; class: string }> = {
  Software: { label: "Software", class: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  Hardware: { label: "Hardware", class: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  "Rede/TI": { label: "Rede/TI", class: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  "Manutenção Preventiva": { label: "Manutenção Preventiva", class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  "Manutenção Corretiva": { label: "Manutenção Corretiva", class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  "Atendimento Geral": { label: "Atendimento Geral", class: "bg-muted text-muted-foreground" },
} as const;

export const SERVICE_TYPES = Object.keys(SERVICE_TYPE_MAP);

// Keep PRIORITY_MAP for backward compat if needed
export const PRIORITY_MAP = {
  low: { label: "Baixa", class: "bg-muted text-muted-foreground" },
  medium: { label: "Média", class: "status-pending" },
  high: { label: "Alta", class: "bg-destructive/15 text-destructive" },
  urgent: { label: "Urgente", class: "bg-destructive text-destructive-foreground" },
} as const;
