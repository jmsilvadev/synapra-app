export type Plan = {
  id: string;
  name: string;
  price: string;
  subtitle: string;
  seats: number;
  workspaces: number;
  apiRequests: number;
  syncs: number;
  support: string;
};

export type UsageMetric = {
  id: string;
  label: string;
  used: number;
  limit: number;
  delta: string;
  tone: "warning" | "info" | "error";
};

export type WorkspaceMetric = {
  name: string;
  tier: string;
  health: string;
  spend: string;
  trend: number[];
};

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "EUR 149",
    subtitle: "Ideal para validar fluxos assistidos com um time pequeno.",
    seats: 8,
    workspaces: 2,
    apiRequests: 120000,
    syncs: 200,
    support: "Email em horario comercial",
  },
  {
    id: "growth",
    name: "Growth",
    price: "EUR 399",
    subtitle: "Operacao comercial com automacoes, workspaces e limites maiores.",
    seats: 24,
    workspaces: 6,
    apiRequests: 600000,
    syncs: 1200,
    support: "Slack compartilhado e SLA de 8h",
  },
  {
    id: "scale",
    name: "Scale",
    price: "EUR 990",
    subtitle: "Conta multi-time com governanca, faturamento central e suporte premium.",
    seats: 90,
    workspaces: 20,
    apiRequests: 2200000,
    syncs: 5000,
    support: "Canal dedicado e SLA de 1h",
  },
];

export const usageMetrics: UsageMetric[] = [
  {
    id: "requests",
    label: "Requisicoes API",
    used: 418200,
    limit: 600000,
    delta: "+16% vs fevereiro",
    tone: "warning",
  },
  {
    id: "syncs",
    label: "Knowledge syncs",
    used: 934,
    limit: 1200,
    delta: "Pico nas ultimas 72h",
    tone: "info",
  },
  {
    id: "seats",
    label: "Assentos ativos",
    used: 19,
    limit: 24,
    delta: "3 convites pendentes",
    tone: "error",
  },
];

export const workspaces: WorkspaceMetric[] = [
  {
    name: "ops-core",
    tier: "Producao",
    health: "Saudavel",
    spend: "EUR 142",
    trend: [28, 34, 41, 39, 55, 61, 72],
  },
  {
    name: "support-copilot",
    tier: "Suporte",
    health: "Atencao",
    spend: "EUR 87",
    trend: [14, 19, 27, 25, 33, 42, 48],
  },
  {
    name: "sales-lab",
    tier: "Experimentos",
    health: "Saudavel",
    spend: "EUR 31",
    trend: [8, 12, 11, 18, 21, 18, 26],
  },
];

export const invoices = [
  { id: "INV-2026-031", period: "Mar 2026", total: "EUR 399", status: "Pago" },
  { id: "INV-2026-022", period: "Fev 2026", total: "EUR 441", status: "Pago" },
  { id: "INV-2026-011", period: "Jan 2026", total: "EUR 390", status: "Pago" },
];

export const addOns = [
  {
    id: "burst",
    name: "Burst credits",
    description: "Pacote extra para picos de uso sem migrar de plano.",
    price: "EUR 90",
  },
  {
    id: "audit",
    name: "Audit trail",
    description: "Historico exportavel por workspace e por usuario.",
    price: "EUR 60",
  },
  {
    id: "sso",
    name: "SSO + SCIM",
    description: "Provisionamento automatico para organizacoes maiores.",
    price: "EUR 120",
  },
];
