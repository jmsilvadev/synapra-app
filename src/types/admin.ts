export type AdminUser = {
  id: string;
  organization_id: string;
  organization_name?: string;
  external_subject?: string;
  email: string;
  name: string;
  picture_url?: string;
  role?: string;
  active: boolean;
};

export type User = {
  id: string;
  organization_id?: string;
  role?: string;
  external_subject?: string;
  email: string;
  name: string;
  picture_url?: string;
  active: boolean;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
};

export type Invitation = {
  id: string;
  organization_id: string;
  organization_name?: string;
  email: string;
  role: string;
  invited_by_user_id?: string;
  token?: string;
  expires_at: string;
  accepted_at?: string;
  created_at?: string;
};

export type CreateInvitationRequest = {
  organization_id: string;
  email: string;
  role: string;
};

export type AdminSession = {
  token?: string;
  expires_at: string;
  user: AdminUser;
};

export type Client = {
  id: string;
  name: string;
  plan: string;
  created_at?: string;
  user_count: number;
  api_key_count: number;
};

export type DashboardSummary = {
  organization_id: string;
  users_total: number;
  api_keys_total: number;
  namespaces_total: number;
  documents_total: number;
  audit_events_24h: number;
  search_requests_24h: number;
};

export type Usage = {
  organization_id: string;
  plan?: string;
  stored_chunks: number;
  stored_memories: number;
  search_requests_24h: number;
  ingestion_requests: number;
  approx_tokens_stored: number;
  limits?: {
    max_stored_chunks: number;
    max_stored_memories: number;
    max_search_requests_24h: number;
    max_ingestion_requests: number;
    max_approx_tokens_stored: number;
  };
  summary?: {
    stored_chunks: {
      used: number;
      limit: number;
      remaining: number;
      percent_consumed: number;
    };
    stored_memories: {
      used: number;
      limit: number;
      remaining: number;
      percent_consumed: number;
    };
    search_requests_24h: {
      used: number;
      limit: number;
      remaining: number;
      percent_consumed: number;
    };
    ingestion_requests: {
      used: number;
      limit: number;
      remaining: number;
      percent_consumed: number;
    };
    approx_tokens_stored: {
      used: number;
      limit: number;
      remaining: number;
      percent_consumed: number;
    };
  };
  scu?: {
    monthly_allowance: number;
    consumed: number;
    remaining: number;
    percent_consumed: number;
    billing_period_start?: string;
    billing_period_end?: string;
    by_operation?: Array<{
      operation_type: string;
      scu_consumed: number;
      operations: number;
    }>;
  };
};

export type Plan = {
  code: string;
  name: string;
  description?: string;
  billing_cycle: string;
  price_cents: number;
  currency_code: string;
  trial_days: number;
  invoice_provider: string;
  scu_monthly_allowance?: number;
  active: boolean;
};

export type OrganizationRules = {
  organization_id: string;
  rules_markdown: string;
};

export type SkillDefinition = {
  id: string;
  key: string;
  scope: string;
  organization_id: string;
  project_id: string;
  name: string;
  aliases: string[];
  description: string;
  instructions: string;    // primary field
  pipeline: string[];
  prompt_template: string; // backward compat
  tools: string[];
  context_strategy: string;
  config: Record<string, unknown>;
  enabled: boolean;
  is_system: boolean;
  usage_count: number;
  avg_tokens: number;
  created_at: string;
  updated_at: string;
};

export type CommandDefinition = {
  id: string;
  organization_id: string;
  slug: string;    // friendly alias; same as trigger
  trigger: string;
  skill_id: string;
  description: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
};

export type ProjectRules = {
  organization_id: string;
  project_uuid: string;
  rules_markdown: string;
  created_at?: string;
  updated_at?: string;
};

export type ProjectRuleSummary = {
  organization_id: string;
  project_uuid: string;
  project_id: string;
  project_name: string;
  created_at?: string;
  updated_at?: string;
};

export type NamespaceRules = {
  organization_id: string;
  project_uuid: string;
  namespace_uuid: string;
  project_id: string;
  namespace: string;
  rules_markdown: string;
  created_at?: string;
  updated_at?: string;
};

export type NamespaceRuleSummary = {
  organization_id: string;
  project_uuid: string;
  namespace_uuid: string;
  project_id: string;
  namespace: string;
  created_at?: string;
  updated_at?: string;
};

export type RepositoryRules = {
  organization_id: string;
  repository_uuid: string;
  rules_markdown: string;
  created_at?: string;
  updated_at?: string;
};

export type RepositoryRuleSummary = {
  organization_id: string;
  repository_uuid: string;
  repository_name: string;
  repository_full_name: string;
  created_at?: string;
  updated_at?: string;
};

export type AuditLogRecord = {
  id: number;
  organization_id: string;
  action: string;
  metadata: string;
  created_at: string;
};

export type AuditActionStats = {
  action: string;
  count_24h: number;
  count_48h: number;
  count_7d: number;
};

export type SynapraMetrics = {
  total_queries: number;
  total_chunks: number;
  est_tokens_saved: number;
  queries_last_24h: number;
  chunks_last_24h: number;
  est_tokens_last_24h: number;
};

export type OrganizationSettings = {
  organization_id: string;
  website_url?: string;
  support_email?: string;
  default_project_id?: string;
  default_namespace?: string;
  allowed_email_domain?: string;
};

export type BillingProfile = {
  legal_name: string;
  billing_email: string;
  contact_name?: string;
  vat_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country_code?: string;
};

export type Subscription = {
  organization_id: string;
  plan_code: string;
  provider: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  trial_ends_at?: string;
  cancel_at_period_end: boolean;
};

export type InvoiceRecord = {
  id: string;
  provider: string;
  external_id: string;
  external_url?: string;
  status: string;
  currency_code: string;
  reference?: string;
  source_type: string;
  source_id: string;
  total_cents: number;
  issued_at?: string;
};

export type ApiKey = {
  id: string;
  label: string;
  preview?: string;
  created_at?: string;
  revoked_at?: string;
  last_used_at?: string;
  user_id?: string;
  user_email?: string;
  device_info?: string;
};

export type ApiKeyCreateResponse = ApiKey & {
  secret: string;
};

export type Project = {
  id: string;
  organization_id: string;
  slug: string;
  name: string;
  created_at: string;
  updated_at?: string;
};

export type CreateProjectRequest = {
  slug: string;
  name: string;
};

export type UpdateProjectRequest = {
  slug?: string;
  name?: string;
};

export type Namespace = {
  id: string;
  organization_id: string;
  project_id: string;
  name: string;
  created_at: string;
};

export type CreateNamespaceRequest = {
  project_id: string;
  name: string;
};

export type Repository = {
  id: string;
  organization_id: string;
  project_id: string;
  namespace_id?: string;
  github_repo_id?: number;
  name: string;
  full_name: string;
  html_url?: string;
  clone_url?: string;
  default_branch: string;
  is_private: boolean;
  last_sync_at?: string;
  sync_status: string;
  sync_error?: string;
  pending_docs?: number;
  created_at: string;
  updated_at?: string;
};

export type CreateRepositoryRequest = {
  project_id: string;
  github_repo_id?: number;
  name: string;
  full_name: string;
  html_url?: string;
  clone_url?: string;
  default_branch: string;
  is_private: boolean;
};

export type WatchSettings = {
  id: string;
  repository_id: string;
  patterns: string[];
  exclude: string[];
  debounce: string;
  batch_size: number;
  created_at?: string;
  updated_at?: string;
};

export type UpdateWatchSettingsRequest = {
  patterns: string[];
  exclude: string[];
  debounce: string;
  batch_size: number;
};

export type ContextFunction = {
  name: string;
  full_name: string;
  file_path: string;
  line_start: number;
  line_end: number;
  receiver?: string;
  is_exported: boolean;
  is_method: boolean;
  return_types?: string[];
  score: number;
};

export type ContextType = {
  name: string;
  file_path: string;
  line_start: number;
  line_end: number;
  type_kind: string;
  fields?: ContextField[];
  embeds?: string[];
  methods?: string[];
  score: number;
};

export type ContextField = {
  name: string;
  type: string;
};

export type ContextInterface = {
  name: string;
  file_path: string;
  line_start: number;
  line_end: number;
  methods?: string[];
  score: number;
};

export type ContextCall = {
  caller_name: string;
  callee_name: string;
  callee_file?: string;
  call_type: string;
};

export type ContextImplementation = {
  interface_name: string;
  implementor_name: string;
  implementor_file?: string;
};

export type ContextResponse = {
  query: string;
  task?: string;
  files?: ContextFile[];
  modules?: ContextModule[];
  endpoints?: ContextEndpoint[];
  memories?: ContextMemory[];
  summary: string;
  functions?: ContextFunction[];
  types?: ContextType[];
  interfaces?: ContextInterface[];
  calls?: ContextCall[];
  implementations?: ContextImplementation[];
  graph_summary?: string;
  memory_sync?: string;
  memory_sync_details?: {
    memory_type?: string;
    confidence?: number;
    margin?: number;
    secondary_type?: string;
  };
};

export type ContextFile = {
  path: string;
  content?: string;
  score: number;
  source?: string;
  source_type?: string;
  line_start?: number;
  line_end?: number;
  section_anchor?: string;
  symbol?: string;
  relevance?: string;
};

export type ContextModule = {
  name: string;
  path: string;
  type: string;
  relevance?: string;
};

export type ContextEndpoint = {
  method: string;
  path: string;
  handler?: string;
  relevance?: string;
};

export type ContextMemory = {
  id: string;
  type: string;
  title: string;
  content: string;
  created_at: string;
};
