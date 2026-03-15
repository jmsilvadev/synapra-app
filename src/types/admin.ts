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
  active: boolean;
};

export type OrganizationRules = {
  organization_id: string;
  rules_markdown: string;
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
