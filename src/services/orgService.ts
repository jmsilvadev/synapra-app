import { apiClient } from "./apiClient";

export interface OrganizationSummary {
  total_projects: number;
  total_functions: number;
  total_calls: number;
  total_interfaces: number;
  total_types: number;
  total_schemas: number;
  total_endpoints: number;
  exported_functions: number;
  cross_repo_dependencies: number;
  languages: Record<string, number>;
  dependency_graph: Record<string, string[]>;
}

export interface Function {
  id: string;
  name: string;
  full_name: string;
  file_path: string;
  line_start: number;
  line_end: number;
  receiver: string;
  parameters: Parameter[];
  return_types: string[];
  is_exported: boolean;
  is_method: boolean;
  is_interface_method: boolean;
  complexity: number;
}

export interface Parameter {
  name: string;
  type: string;
}

export interface Call {
  id: string;
  analysis_id: string;
  caller_id: string;
  caller_name: string;
  callee_name: string;
  callee_file: string;
  call_type: string;
}

export interface OrganizationGraph {
  projects: ProjectSummary[];
  functions: Function[];
  calls: Call[];
  interfaces: Interface[];
  types: Type[];
  schemas: Schema[];
  module_count: number;
}

export interface ProjectSummary {
  project_id: string;
  namespace: string;
  language: string;
  status: string;
}

export interface Interface {
  id: string;
  name: string;
  file_path: string;
  line_start: number;
  line_end: number;
  methods: string[];
}

export interface Type {
  id: string;
  name: string;
  file_path: string;
  line_start: number;
  line_end: number;
  type_kind: string;
  fields: Field[];
  embeds: string[];
  methods: string[];
}

export interface Field {
  name: string;
  type: string;
  json_tag: string;
  exported: boolean;
}

export interface Schema {
  id: string;
  table_name: string;
  columns: Column[];
  indexes: Index[];
  constraints: Constraint[];
  file_path: string;
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
}

export interface Index {
  name: string;
  columns: string[];
  unique: boolean;
}

export interface Constraint {
  name: string;
  type: string;
  columns: string[];
  reference_table: string;
  reference_columns: string[];
}

export interface RepoDependency {
  source_project: string;
  source_namespace: string;
  target_project: string;
  target_namespace: string;
  function_name: string;
  call_count: number;
  relation_type: string;
}

export interface EndpointSummary {
  method: string;
  path: string;
  handler: string;
  project_id: string;
  namespace: string;
  file_path: string;
  line_start: number;
}

export interface FunctionMatch {
  function: Function;
  project_id: string;
  namespace: string;
  score: number;
  match_type: string;
}

export interface OrgImpactAnalysis {
  function_name: string;
  occurrences: FunctionOccurrence[];
  affected_projects: string[];
  cross_repo_callers: CrossRepoCaller[];
  risk_level: string;
  summary: string;
}

export interface FunctionOccurrence {
  function: Function;
  project_id: string;
}

export interface CrossRepoCaller {
  function: Function;
  source_project: string;
  source_namespace: string;
  target_project: string;
  target_namespace: string;
}

export async function getOrganizationSummary(): Promise<OrganizationSummary> {
  const response = await apiClient.get<OrganizationSummary>("/v1/console/org/summary");
  return response.data;
}

export async function getOrganizationGraph(): Promise<OrganizationGraph> {
  const response = await apiClient.get<OrganizationGraph>("/v1/console/org/graph");
  return response.data;
}

export async function getOrganizationEndpoints(): Promise<EndpointSummary[]> {
  const response = await apiClient.get<{ endpoints: EndpointSummary[] }>("/v1/console/org/endpoints");
  return response.data.endpoints;
}

export async function getOrganizationDependencies(): Promise<RepoDependency[]> {
  const response = await apiClient.get<{ dependencies: RepoDependency[] }>("/v1/console/org/dependencies");
  return response.data.dependencies || [];
}

export async function searchOrganizationFunctions(query: string, limit: number = 20): Promise<FunctionMatch[]> {
  const response = await apiClient.get<{ results: FunctionMatch[] }>("/v1/console/org/search", {
    params: { q: query, limit },
  });
  return response.data.results || [];
}

export async function analyzeOrgImpact(functionName: string): Promise<OrgImpactAnalysis> {
  const response = await apiClient.post<OrgImpactAnalysis>("/v1/console/org/impact", {
    function_name: functionName,
  });
  return response.data;
}