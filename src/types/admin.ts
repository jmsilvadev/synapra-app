export type AdminUser = {
  id: string;
  provider: string;
  external_subject?: string;
  email: string;
  name: string;
  picture_url?: string;
  platform_role: string;
  active: boolean;
};

export type Membership = {
  id: string;
  user_id: string;
  organization_id: string;
  organization_name?: string;
  organization_plan?: string;
  role: string;
  active: boolean;
};

export type AdminSession = {
  token?: string;
  expires_at: string;
  user: AdminUser;
  memberships: Membership[];
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
  organization_id?: string;
  rules_markdown: string;
};

export type WorkspaceRules = {
  organization_id?: string;
  project_id: string;
  namespace: string;
  rules_markdown: string;
};

export type AuditLogRecord = {
  id: number;
  organization_id: string;
  action: string;
  metadata: string;
  created_at: string;
};

export type OrganizationSettings = {
  organization_id?: string;
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
