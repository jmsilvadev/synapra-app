import axios from "axios";
import { apiClient } from "./apiClient";
import type {
  AdminSession,
  ApiKey,
  ApiKeyCreateResponse,
  AuditLogRecord,
  AuditActionStats,
  BillingProfile,
  Client,
  DashboardSummary,
  InvoiceRecord,
  OrganizationRules,
  OrganizationSettings,
  Subscription,
  Usage,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  Namespace,
  CreateNamespaceRequest,
  Repository,
  CreateRepositoryRequest,
  ProjectRules,
  ProjectRuleSummary,
  NamespaceRules,
  NamespaceRuleSummary,
  RepositoryRules,
  RepositoryRuleSummary,
  WatchSettings,
  UpdateWatchSettingsRequest,
  SkillDefinition,
  CommandDefinition,
} from "../types/admin";

export type DashboardResponse = {
  client: Client;
  summary: DashboardSummary;
  usage: Usage;
  subscription?: Subscription;
};

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export async function loginAdminWithFirebase(payload: {
  id_token: string;
  email?: string | null;
  name?: string | null;
  picture_url?: string | null;
}) {
  const response = await apiClient.post<AdminSession>("/v1/console/auth/login", payload);
  return response.data;
}

export async function acceptInvitationWithFirebase(payload: {
  token: string;
  id_token: string;
  email?: string | null;
  name?: string | null;
  picture_url?: string | null;
}) {
  const response = await apiClient.post<AdminSession>("/v1/console/auth/invitations/accept", payload);
  return response.data;
}

export async function getCurrentAdminSession() {
  const response = await apiClient.get<AdminSession>("/v1/console/me");
  return response.data;
}

export async function logoutAdmin() {
  await apiClient.post("/v1/console/auth/logout");
}

export async function getClients() {
  const response = await apiClient.get<{ clients: Client[] }>("/v1/console/clients");
  return asArray(response.data?.clients);
}

export async function updateClient(clientId: string, payload: { name?: string; plan?: string }) {
  const response = await apiClient.put<Client>(`/v1/console/clients/${clientId}`, payload);
  return response.data;
}

export async function getDashboard(clientId: string) {
  const response = await apiClient.get<DashboardResponse>("/v1/console/dashboard", {
    params: { client_id: clientId },
  });
  return response.data;
}

export async function getOrganizationRules(clientId: string) {
  const response = await apiClient.get<OrganizationRules>(
    `/v1/console/clients/${clientId}/rules/organization`
  );
  return response.data;
}

export async function updateOrganizationRules(clientId: string, rulesMarkdown: string) {
  const response = await apiClient.put<OrganizationRules>(
    `/v1/console/clients/${clientId}/rules/organization`,
    { rules_markdown: rulesMarkdown }
  );
  return response.data;
}

export async function getClientApiKeys(clientId: string) {
  const response = await apiClient.get<{ api_keys: ApiKey[] }>(
    `/v1/console/clients/${clientId}/api-keys`
  );
  return asArray(response.data?.api_keys);
}

export async function createClientApiKey(clientId: string, label: string) {
  const response = await apiClient.post<ApiKeyCreateResponse>(
    `/v1/console/clients/${clientId}/api-keys`,
    { label }
  );
  return response.data;
}

export async function revokeClientApiKey(clientId: string, keyId: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/api-keys/${keyId}`);
}

export async function getDeviceRegistrations(clientId: string) {
  const response = await apiClient.get<{ devices: ApiKey[] }>(
    `/v1/console/clients/${clientId}/devices`
  );
  return asArray(response.data?.devices);
}

export async function getAuditLogs(
  clientId: string,
  action?: string,
  member?: string,
  startDate?: string,
  endDate?: string,
  limit = 20,
  offset = 0
) {
  const params: Record<string, string> = { client_id: clientId, limit: String(limit), offset: String(offset) };
  if (action) {
    params.action = action;
  }
  if (member) {
    params.member = member;
  }
  if (startDate) {
    params.start_date = startDate;
  }
  if (endDate) {
    params.end_date = endDate;
  }
  const response = await apiClient.get<{ logs: AuditLogRecord[] }>("/v1/console/logs/audit", {
    params,
  });
  return asArray(response.data?.logs);
}

export async function getAuditActionStats(clientId: string) {
  const response = await apiClient.get<{ stats: AuditActionStats[] }>("/v1/console/logs/stats", {
    params: { client_id: clientId },
  });
  return asArray(response.data?.stats);
}

export async function getSynapraMetrics(clientId: string) {
  const response = await apiClient.get<{ metrics: SynapraMetrics }>("/v1/console/synapra/metrics", {
    params: { client_id: clientId },
  });
  return response.data?.metrics;
}

export async function getOrganizationSettings(clientId: string) {
  const response = await apiClient.get<OrganizationSettings>(
    `/v1/console/clients/${clientId}/settings`
  );
  return response.data;
}

export async function updateOrganizationSettings(clientId: string, payload: OrganizationSettings) {
  const response = await apiClient.put<OrganizationSettings>(
    `/v1/console/clients/${clientId}/settings`,
    payload
  );
  return response.data;
}

export async function getBillingProfile(clientId: string) {
  const response = await apiClient.get<BillingProfile>(
    `/v1/console/clients/${clientId}/billing/profile`
  );
  return response.data;
}

export async function updateBillingProfile(clientId: string, payload: BillingProfile) {
  const response = await apiClient.put<BillingProfile>(
    `/v1/console/clients/${clientId}/billing/profile`,
    payload
  );
  return response.data;
}

export async function getSubscription(clientId: string) {
  const response = await apiClient.get<Subscription>(
    `/v1/console/clients/${clientId}/billing/subscription`
  );
  return response.data;
}

export async function getUsage(clientId: string) {
  const response = await apiClient.get<Usage>(`/v1/console/clients/${clientId}/usage`);
  return response.data;
}

export async function getInvoices(clientId: string) {
  const response = await apiClient.get<{ invoices: InvoiceRecord[] }>(
    `/v1/console/clients/${clientId}/billing/invoices`
  );
  return asArray(response.data?.invoices);
}

export async function getProjects(clientId: string) {
  const response = await apiClient.get<{ projects: Project[] }>(
    `/v1/console/clients/${clientId}/projects`
  );
  return asArray(response.data?.projects);
}

export async function createProject(clientId: string, payload: CreateProjectRequest) {
  const response = await apiClient.post<Project>(
    `/v1/console/clients/${clientId}/projects`,
    payload
  );
  return response.data;
}

export async function getProject(clientId: string, projectId: string) {
  const response = await apiClient.get<Project>(
    `/v1/console/clients/${clientId}/projects/${projectId}`
  );
  return response.data;
}

export async function updateProject(clientId: string, projectId: string, payload: UpdateProjectRequest) {
  const response = await apiClient.put<Project>(
    `/v1/console/clients/${clientId}/projects/${projectId}`,
    payload
  );
  return response.data;
}

export async function deleteProject(clientId: string, projectId: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/projects/${projectId}`);
}

export async function getNamespaces(clientId: string, projectId: string) {
  const response = await apiClient.get<{ namespaces: Namespace[] }>(
    `/v1/console/clients/${clientId}/namespaces`,
    { params: { project_id: projectId } }
  );
  return asArray(response.data?.namespaces);
}

export async function createNamespace(clientId: string, payload: CreateNamespaceRequest) {
  const response = await apiClient.post<Namespace>(
    `/v1/console/clients/${clientId}/namespaces`,
    payload
  );
  return response.data;
}

export async function deleteNamespace(clientId: string, namespaceId: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/namespaces/${namespaceId}`);
}

export async function getRepositories(clientId: string, projectId?: string) {
  const params = projectId ? { project_id: projectId } : {};
  const response = await apiClient.get<{ repositories: Repository[] }>(
    `/v1/console/clients/${clientId}/repositories`,
    { params }
  );
  return asArray(response.data?.repositories);
}

export async function createRepository(clientId: string, payload: CreateRepositoryRequest) {
  const response = await apiClient.post<Repository>(
    `/v1/console/clients/${clientId}/repositories`,
    payload
  );
  return response.data;
}

export async function getRepository(clientId: string, repositoryId: string) {
  const response = await apiClient.get<Repository>(
    `/v1/console/clients/${clientId}/repositories/${repositoryId}`
  );
  return response.data;
}

export async function deleteRepository(clientId: string, repositoryId: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/repositories/${repositoryId}`);
}

export async function createGitHubFiles(clientId: string, payload: {
  repo: string;
  branch: string;
  project_id: string;
  namespace_id: string;
}) {
  const response = await apiClient.post(`/v1/console/clients/${clientId}/github/files`, payload);
  return response.data;
}

export async function syncGitHubRepository(clientId: string, payload: {
  repo_id: number;
  repo_name: string;
  project_id: string;
  namespace_id: string;
  branch: string;
}) {
  const response = await apiClient.post(`/v1/console/clients/${clientId}/github/repositories`, payload);
  return response.data;
}

export async function getProjectRules(clientId: string, projectUuid: string) {
  const response = await apiClient.get<ProjectRules>(
    `/v1/console/clients/${clientId}/rules/projects/${projectUuid}`
  );
  return response.data;
}

export async function listProjectRules(clientId: string) {
  const response = await apiClient.get<{ projects: ProjectRuleSummary[] }>(
    `/v1/console/clients/${clientId}/rules/projects`
  );
  return asArray(response.data?.projects);
}

export async function updateProjectRules(clientId: string, projectUuid: string, rulesMarkdown: string) {
  const response = await apiClient.put<ProjectRules>(
    `/v1/console/clients/${clientId}/rules/projects/${projectUuid}`,
    { rules_markdown: rulesMarkdown }
  );
  return response.data;
}

export async function deleteProjectRules(clientId: string, projectUuid: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/rules/projects/${projectUuid}`);
}

export async function getNamespaceRules(clientId: string, namespaceUuid: string) {
  const response = await apiClient.get<NamespaceRules>(
    `/v1/console/clients/${clientId}/rules/namespaces/${namespaceUuid}`
  );
  return response.data;
}

export async function listNamespaceRules(clientId: string) {
  const response = await apiClient.get<{ namespaces: NamespaceRuleSummary[] }>(
    `/v1/console/clients/${clientId}/rules/namespaces`
  );
  return asArray(response.data?.namespaces);
}

export async function updateNamespaceRules(clientId: string, namespaceUuid: string, rulesMarkdown: string) {
  const response = await apiClient.put<NamespaceRules>(
    `/v1/console/clients/${clientId}/rules/namespaces/${namespaceUuid}`,
    { rules_markdown: rulesMarkdown }
  );
  return response.data;
}

export async function deleteNamespaceRules(clientId: string, namespaceUuid: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/rules/namespaces/${namespaceUuid}`);
}

export async function getRepositoryRules(clientId: string, repositoryUuid: string) {
  const response = await apiClient.get<RepositoryRules>(
    `/v1/console/clients/${clientId}/rules/repositories/${repositoryUuid}`
  );
  return response.data;
}

export async function listRepositoryRules(clientId: string) {
  const response = await apiClient.get<{ repositories: RepositoryRuleSummary[] }>(
    `/v1/console/clients/${clientId}/rules/repositories`
  );
  return asArray(response.data?.repositories);
}

export async function updateRepositoryRules(clientId: string, repositoryUuid: string, rulesMarkdown: string) {
  const response = await apiClient.put<RepositoryRules>(
    `/v1/console/clients/${clientId}/rules/repositories/${repositoryUuid}`,
    { rules_markdown: rulesMarkdown }
  );
  return response.data;
}

export async function deleteRepositoryRules(clientId: string, repositoryUuid: string) {
  await apiClient.delete(`/v1/console/clients/${clientId}/rules/repositories/${repositoryUuid}`);
}

export async function getWatchSettings(clientId: string, repositoryUuid: string): Promise<WatchSettings | null> {
  try {
    const response = await apiClient.get<{ watch_settings: WatchSettings | null }>(
      `/v1/console/clients/${clientId}/repositories/${repositoryUuid}/watch-settings`
    );
    return response.data?.watch_settings || null;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function upsertWatchSettings(
  clientId: string,
  repositoryUuid: string,
  settings: UpdateWatchSettingsRequest
): Promise<WatchSettings> {
  const response = await apiClient.put<{ watch_settings: WatchSettings }>(
    `/v1/console/clients/${clientId}/repositories/${repositoryUuid}/watch-settings`,
    settings
  );
  return response.data.watch_settings;
}

export type ProjectStats = {
  project_id: string;
  project_name: string;
  namespaces_count: number;
  repositories_count: number;
  documents_count: number;
  chunks_count: number;
  vectors_count: number;
  embeddings_count: number;
  functions_count: number;
  modules_count: number;
  endpoints_count: number;
  entities_count: number;
};

export type NamespaceStats = {
  namespace_id: string;
  namespace_name: string;
  project_id: string;
  project_name: string;
  documents_count: number;
  chunks_count: number;
  vectors_count: number;
};

export type RepositoryStats = {
  repository_id: string;
  repository_name: string;
  project_id: string;
  project_name: string;
  documents_count: number;
  chunks_count: number;
  vectors_count: number;
};

export type StatsResponse = {
  projects: ProjectStats[];
  namespaces: NamespaceStats[];
  repositories: RepositoryStats[];
};

export async function getStats(clientId: string): Promise<StatsResponse> {
  const response = await apiClient.get<StatsResponse>(`/v1/console/clients/${clientId}/stats`);
  return response.data;
}

export type KnowledgeSearchChunk = {
  chunk_id: string;
  document_id: string;
  content: string;
  score: number;
  source: string;
  source_path: string;
  title: string;
  source_type: string;
  section_anchor: string;
  symbol: string;
  chunk_index: number;
  line_start: number;
  line_end: number;
};

export type KnowledgeSearchRequest = {
  project_id: string;
  namespace_id?: string;
  query: string;
  top_k?: number;
};

export type KnowledgeSearchResponse = {
  query: string;
  results: KnowledgeSearchChunk[];
};

export async function searchKnowledge(
  projectId: string,
  query: string,
  namespaceId?: string,
  topK?: number
): Promise<KnowledgeSearchResponse> {
  const response = await apiClient.post<KnowledgeSearchResponse>("/v1/knowledge/search", {
    project_id: projectId,
    query,
    namespace_id: namespaceId,
    top_k: topK || 20,
  });
  return response.data;
}

export async function getContext(
  projectId: string,
  query: string,
  namespaceId?: string,
  task?: string,
  topK?: number
): Promise<import("../types/admin").ContextResponse> {
  const body: Record<string, unknown> = {
    project_id: projectId,
    query,
    top_k: topK || 10,
  };
  if (namespaceId) {
    body.namespace_id = namespaceId;
  }
  if (task) {
    body.task = task;
  }
  const response = await apiClient.post<import("../types/admin").ContextResponse>("/v1/context", body);
  return response.data;
}

export async function listUsers(clientId: string) {
  const response = await apiClient.get<{ users: any[] }>(`/v1/console/clients/${clientId}/users`);
  return asArray(response.data?.users);
}

export async function listInvitations(clientId: string) {
  const response = await apiClient.get<{ invitations: any[] }>(`/v1/console/clients/${clientId}/invitations`);
  return asArray(response.data?.invitations);
}

export async function createInvitation(
  clientId: string,
  payload: { email: string; role: string }
) {
  const response = await apiClient.post<any>(`/v1/console/invitations`, {
    organization_id: clientId,
    ...payload,
  });
  return response.data;
}

export async function resendInvitation(invitationId: string) {
  const response = await apiClient.post<any>(`/v1/console/invitations/${invitationId}/resend`);
  return response.data;
}

export type CreateSkillPayload = {
  name: string;
  instructions: string;    // primary field
  prompt_template?: string; // backward compat (fallback)
  description?: string;
  key?: string;
  scope?: "org" | "project";
  project_id?: string;
};

export type CreateCommandPayload = {
  slug: string;     // friendly name (without leading slash)
  trigger?: string; // backward compat; derived from slug if omitted
  skill_id: string;
  description?: string;
};

export async function listSkills() {
  const response = await apiClient.get<{ skills: SkillDefinition[] }>("/v1/skills");
  return asArray(response.data?.skills);
}

export async function createSkill(payload: CreateSkillPayload) {
  const instructions = payload.instructions || payload.prompt_template || "";
  const response = await apiClient.post<SkillDefinition>("/v1/skills", {
    name: payload.name,
    instructions,
    prompt_template: instructions,
    description: payload.description || instructions,
    key: payload.key || "",
    scope: payload.scope || "org",
    project_id: payload.project_id || "",
    aliases: [],
    pipeline: [],
    tools: [],
    context_strategy: "compressed",
    config: {},
    enabled: true,
  });
  return response.data;
}

export async function updateSkill(skillId: string, payload: { name: string; instructions: string }) {
  const response = await apiClient.put<SkillDefinition>(`/v1/skills/${skillId}`, {
    name: payload.name,
    instructions: payload.instructions,
    prompt_template: payload.instructions,
    description: payload.instructions,
  });
  return response.data;
}

export async function deleteSkill(skillId: string) {
  await apiClient.delete(`/v1/skills/${skillId}`);
}

export async function listCommands() {
  const response = await apiClient.get<{ commands: CommandDefinition[] }>("/v1/commands");
  return asArray(response.data?.commands);
}

export async function createCommand(payload: CreateCommandPayload) {
  const trigger = payload.trigger || (payload.slug.startsWith("/") ? payload.slug : `/${payload.slug}`);
  const response = await apiClient.post<CommandDefinition>("/v1/commands", {
    trigger,
    skill_id: payload.skill_id,
    description: payload.description || "",
  });
  return response.data;
}

export async function deleteCommand(commandId: string) {
  await apiClient.delete(`/v1/commands/${commandId}`);
}
