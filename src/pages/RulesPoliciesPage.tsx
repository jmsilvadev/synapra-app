import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Business as OrganizationIcon,
  Folder as FolderIcon,
  Storage as NamespaceIcon,
  Source as RepositoryIcon,
  Policy as PolicyIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { extractErrorMessage } from "../services/apiClient";
import {
  getOrganizationRules,
  updateOrganizationRules,
  listProjectRules,
  getProjectRules,
  updateProjectRules,
  deleteProjectRules,
  listNamespaceRules,
  getNamespaceRules,
  updateNamespaceRules,
  deleteNamespaceRules,
  listRepositoryRules,
  getRepositoryRules,
  updateRepositoryRules,
  deleteRepositoryRules,
  getWatchSettings,
  upsertWatchSettings,
} from "../services/adminService";
import type { ProjectRuleSummary, NamespaceRuleSummary, RepositoryRuleSummary, WatchSettings } from "../types/admin";

function isNotFoundError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

type RulesTab = "organization" | "projects" | "namespaces" | "repositories";

interface RuleItem {
  uuid: string;
  id: string;
  name: string;
  sublabel: string;
}

const RulesPoliciesPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<RulesTab>("organization");

  const [organizationRules, setOrganizationRules] = useState("");
  const [projectList, setProjectList] = useState<ProjectRuleSummary[]>([]);
  const [namespaceList, setNamespaceList] = useState<NamespaceRuleSummary[]>([]);
  const [repositoryList, setRepositoryList] = useState<RepositoryRuleSummary[]>([]);

  const [selectedProjectUuid, setSelectedProjectUuid] = useState("");
  const [selectedNamespaceUuid, setSelectedNamespaceUuid] = useState("");
  const [selectedRepositoryUuid, setSelectedRepositoryUuid] = useState("");

  const [projectRules, setProjectRules] = useState("");
  const [namespaceRules, setNamespaceRules] = useState("");
  const [repositoryRules, setRepositoryRules] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingRules, setLoadingRules] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const [projectFilter, setProjectFilter] = useState("");

  const [rulesDialogOpen, setRulesDialogOpen] = useState(false);
  const [rulesDialogContent, setRulesDialogContent] = useState("");
  const [rulesDialogTarget, setRulesDialogTarget] = useState<{ type: "project" | "namespace" | "repository"; uuid: string; name: string } | null>(null);

  const [deleteDialogProject, setDeleteDialogProject] = useState<ProjectRuleSummary | null>(null);
  const [deleteDialogNamespace, setDeleteDialogNamespace] = useState<NamespaceRuleSummary | null>(null);
  const [deleteDialogRepository, setDeleteDialogRepository] = useState<RepositoryRuleSummary | null>(null);

  // Watch settings state
  const [watchSettingsDialogOpen, setWatchSettingsDialogOpen] = useState(false);
  const [watchSettingsTarget, setWatchSettingsTarget] = useState<RepositoryRuleSummary | null>(null);
  const [watchSettings, setWatchSettings] = useState<WatchSettings | null>(null);
  const [watchSettingsPatterns, setWatchSettingsPatterns] = useState("");
  const [watchSettingsExclude, setWatchSettingsExclude] = useState("");
  const [watchSettingsDebounce, setWatchSettingsDebounce] = useState("5s");
  const [watchSettingsBatchSize, setWatchSettingsBatchSize] = useState(50);
  const [loadingWatchSettings, setLoadingWatchSettings] = useState(false);
  const [savingWatchSettings, setSavingWatchSettings] = useState(false);

  const loadOrganizationRules = useCallback(async (clientId: string) => {
    try {
      const orgRules = await getOrganizationRules(clientId);
      setOrganizationRules(orgRules.rules_markdown || "");
    } catch (err) {
      if (!isNotFoundError(err)) {
        throw err;
      }
      setOrganizationRules("");
    }
  }, []);

  const loadProjectList = useCallback(async (clientId: string) => {
    const projects = await listProjectRules(clientId);
    setProjectList(projects);
    return projects;
  }, []);

  const loadNamespaceList = useCallback(async (clientId: string) => {
    const namespaces = await listNamespaceRules(clientId);
    setNamespaceList(namespaces);
    return namespaces;
  }, []);

  const loadRepositoryList = useCallback(async (clientId: string) => {
    const repos = await listRepositoryRules(clientId);
    setRepositoryList(repos);
    return repos;
  }, []);

  const loadProjectRulesContent = useCallback(async (clientId: string, projectUuid: string) => {
    setLoadingRules(true);
    try {
      const rules = await getProjectRules(clientId, projectUuid);
      setProjectRules(rules.rules_markdown || "");
    } catch (err) {
      if (isNotFoundError(err)) {
        setProjectRules("");
        return;
      }
      throw err;
    } finally {
      setLoadingRules(false);
    }
  }, []);

  const loadNamespaceRulesContent = useCallback(async (clientId: string, namespaceUuid: string) => {
    setLoadingRules(true);
    try {
      const rules = await getNamespaceRules(clientId, namespaceUuid);
      setNamespaceRules(rules.rules_markdown || "");
    } catch (err) {
      if (isNotFoundError(err)) {
        setNamespaceRules("");
        return;
      }
      throw err;
    } finally {
      setLoadingRules(false);
    }
  }, []);

  const loadRepositoryRulesContent = useCallback(async (clientId: string, repositoryUuid: string) => {
    setLoadingRules(true);
    try {
      const rules = await getRepositoryRules(clientId, repositoryUuid);
      setRepositoryRules(rules.rules_markdown || "");
    } catch (err) {
      if (isNotFoundError(err)) {
        setRepositoryRules("");
        return;
      }
      throw err;
    } finally {
      setLoadingRules(false);
    }
  }, []);

  const loadAllData = useCallback(async (clientId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await loadOrganizationRules(clientId);
      const [projects, namespaces, repos] = await Promise.all([
        loadProjectList(clientId),
        loadNamespaceList(clientId),
        loadRepositoryList(clientId),
      ]);

      if (projects.length > 0) {
        setSelectedProjectUuid(projects[0].project_uuid);
        await loadProjectRulesContent(clientId, projects[0].project_uuid);
      } else {
        setSelectedProjectUuid("");
        setProjectRules("");
      }

      if (namespaces.length > 0) {
        setSelectedNamespaceUuid(namespaces[0].namespace_uuid);
        await loadNamespaceRulesContent(clientId, namespaces[0].namespace_uuid);
      } else {
        setSelectedNamespaceUuid("");
        setNamespaceRules("");
      }

      if (repos.length > 0) {
        setSelectedRepositoryUuid(repos[0].repository_uuid);
        await loadRepositoryRulesContent(clientId, repos[0].repository_uuid);
      } else {
        setSelectedRepositoryUuid("");
        setRepositoryRules("");
      }
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.load_error")));
    } finally {
      setLoading(false);
    }
  }, [loadOrganizationRules, loadProjectList, loadNamespaceList, loadRepositoryList, loadProjectRulesContent, loadNamespaceRulesContent, loadRepositoryRulesContent, t]);

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      await loadAllData(currentOrganizationId);
    };
    void load();
  }, [currentOrganizationId, loadAllData]);

  const handleSaveOrganizationRules = async () => {
    if (!currentOrganizationId) return;
    if (!organizationRules.trim()) {
      setError(t("rules.validation.organization_empty"));
      setSuccess(null);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await updateOrganizationRules(currentOrganizationId, organizationRules);
      setOrganizationRules(response.rules_markdown || "");
      setSuccess(t("rules.success.organization_saved"));
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.organization_save")));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenRulesDialog = async (type: "project" | "namespace" | "repository", uuid: string, name: string) => {
    if (!currentOrganizationId) return;
    setRulesDialogTarget({ type, uuid, name });
    setRulesDialogContent("");
    setLoadingRules(true);
    setRulesDialogOpen(true);
    try {
      let rules = "";
      if (type === "project") {
        const r = await getProjectRules(currentOrganizationId, uuid);
        rules = r.rules_markdown || "";
      } else if (type === "namespace") {
        const r = await getNamespaceRules(currentOrganizationId, uuid);
        rules = r.rules_markdown || "";
      } else {
        const r = await getRepositoryRules(currentOrganizationId, uuid);
        rules = r.rules_markdown || "";
      }
      setRulesDialogContent(rules);
    } catch (err) {
      if (!isNotFoundError(err)) {
        setError(extractErrorMessage(err, t("rules.load_error")));
      }
      setRulesDialogContent("");
    } finally {
      setLoadingRules(false);
    }
  };

  const handleSaveRulesDialog = async () => {
    if (!currentOrganizationId || !rulesDialogTarget) return;
    if (!rulesDialogContent.trim()) {
      const validationKey = rulesDialogTarget.type === "project" 
        ? "rules.validation.project_empty" 
        : rulesDialogTarget.type === "namespace" 
          ? "rules.validation.namespace_empty" 
          : "rules.validation.repository_empty";
      setError(t(validationKey));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (rulesDialogTarget.type === "project") {
        await updateProjectRules(currentOrganizationId, rulesDialogTarget.uuid, rulesDialogContent);
        await loadProjectList(currentOrganizationId);
        setSuccess(t("rules.success.project_saved"));
      } else if (rulesDialogTarget.type === "namespace") {
        await updateNamespaceRules(currentOrganizationId, rulesDialogTarget.uuid, rulesDialogContent);
        await loadNamespaceList(currentOrganizationId);
        setSuccess(t("rules.success.namespace_saved"));
      } else {
        await updateRepositoryRules(currentOrganizationId, rulesDialogTarget.uuid, rulesDialogContent);
        await loadRepositoryList(currentOrganizationId);
        setSuccess(t("rules.success.repository_saved"));
      }
      setRulesDialogOpen(false);
      setRulesDialogTarget(null);
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.load_error")));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProjectRules = async (projectUuid: string) => {
    if (!currentOrganizationId) return;
    setDeletingKey(projectUuid);
    setError(null);
    setSuccess(null);
    try {
      await deleteProjectRules(currentOrganizationId, projectUuid);
      const updated = await loadProjectList(currentOrganizationId);
      if (selectedProjectUuid === projectUuid) {
        const next = updated[0];
        if (next) {
          setSelectedProjectUuid(next.project_uuid);
          await loadProjectRulesContent(currentOrganizationId, next.project_uuid);
        } else {
          setSelectedProjectUuid("");
          setProjectRules("");
        }
      }
      setSuccess(t("rules.success.project_deleted"));
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.delete_project")));
    } finally {
      setDeletingKey(null);
    }
  };

  const handleDeleteNamespaceRules = async (namespaceUuid: string) => {
    if (!currentOrganizationId) return;
    setDeletingKey(namespaceUuid);
    setError(null);
    setSuccess(null);
    try {
      await deleteNamespaceRules(currentOrganizationId, namespaceUuid);
      const updated = await loadNamespaceList(currentOrganizationId);
      if (selectedNamespaceUuid === namespaceUuid) {
        const next = updated[0];
        if (next) {
          setSelectedNamespaceUuid(next.namespace_uuid);
          await loadNamespaceRulesContent(currentOrganizationId, next.namespace_uuid);
        } else {
          setSelectedNamespaceUuid("");
          setNamespaceRules("");
        }
      }
      setSuccess(t("rules.success.namespace_deleted"));
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.delete_namespace")));
    } finally {
      setDeletingKey(null);
    }
  };

  const handleDeleteRepositoryRules = async (repositoryUuid: string) => {
    if (!currentOrganizationId) return;
    setDeletingKey(repositoryUuid);
    setError(null);
    setSuccess(null);
    try {
      await deleteRepositoryRules(currentOrganizationId, repositoryUuid);
      const updated = await loadRepositoryList(currentOrganizationId);
      if (selectedRepositoryUuid === repositoryUuid) {
        const next = updated[0];
        if (next) {
          setSelectedRepositoryUuid(next.repository_uuid);
          await loadRepositoryRulesContent(currentOrganizationId, next.repository_uuid);
        } else {
          setSelectedRepositoryUuid("");
          setRepositoryRules("");
        }
      }
      setSuccess(t("rules.success.repository_deleted"));
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.delete_repository")));
    } finally {
      setDeletingKey(null);
    }
  };

  const handleOpenWatchSettings = async (repo: RepositoryRuleSummary) => {
    if (!currentOrganizationId) return;
    setWatchSettingsTarget(repo);
    setLoadingWatchSettings(true);
    setWatchSettingsDialogOpen(true);
    try {
      const settings = await getWatchSettings(currentOrganizationId, repo.repository_uuid);
      if (settings) {
        setWatchSettings(settings);
        setWatchSettingsPatterns(settings.patterns.join("\n"));
        setWatchSettingsExclude(settings.exclude.join("\n"));
        setWatchSettingsDebounce(settings.debounce);
        setWatchSettingsBatchSize(settings.batch_size);
      } else {
        setWatchSettings(null);
        setWatchSettingsPatterns("");
        setWatchSettingsExclude("");
        setWatchSettingsDebounce("5s");
        setWatchSettingsBatchSize(50);
      }
    } catch (err) {
      if (!isNotFoundError(err)) {
        setError(extractErrorMessage(err, t("rules.load_error")));
      }
      setWatchSettings(null);
      setWatchSettingsPatterns("");
      setWatchSettingsExclude("");
      setWatchSettingsDebounce("5s");
      setWatchSettingsBatchSize(50);
    } finally {
      setLoadingWatchSettings(false);
    }
  };

  const handleSaveWatchSettings = async () => {
    if (!currentOrganizationId || !watchSettingsTarget) return;
    setSavingWatchSettings(true);
    setError(null);
    try {
      const patterns = watchSettingsPatterns.split("\n").map((p) => p.trim()).filter((p) => p);
      const exclude = watchSettingsExclude.split("\n").map((p) => p.trim()).filter((p) => p);
      await upsertWatchSettings(currentOrganizationId, watchSettingsTarget.repository_uuid, {
        patterns,
        exclude,
        debounce: watchSettingsDebounce,
        batch_size: watchSettingsBatchSize,
      });
      setSuccess(t("rules.success.watch_settings_saved"));
      setWatchSettingsDialogOpen(false);
      setWatchSettingsTarget(null);
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.watch_settings_save_error")));
    } finally {
      setSavingWatchSettings(false);
    }
  };

  const filteredNamespaceList = projectFilter 
    ? namespaceList.filter((n) => n.project_id === projectFilter)
    : namespaceList;

  const filteredRepositoryList = projectFilter
    ? repositoryList.filter((r) => r.project_id === projectFilter)
    : repositoryList;

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!currentOrganizationId) {
    return (
      <Container>
        <Alert severity="info">{t("rules.no_org")}</Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t("rules.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("rules.subtitle")}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Card variant="outlined">
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          textColor="inherit"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": {
              alignItems: "center",
              textTransform: "none",
              minHeight: 56,
            },
          }}
        >
          <Tab value="organization" icon={<OrganizationIcon />} iconPosition="start" label={t("rules.organization_tab")} />
          <Tab value="projects" icon={<FolderIcon />} iconPosition="start" label={t("rules.projects_tab", { count: projectList.length })} />
          <Tab value="namespaces" icon={<NamespaceIcon />} iconPosition="start" label={t("rules.namespaces_tab", { count: namespaceList.length })} />
          <Tab value="repositories" icon={<RepositoryIcon />} iconPosition="start" label={t("rules.repositories_tab", { count: repositoryList.length })} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === "organization" && (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{t("rules.organization_title")}</Typography>
                  <Typography color="text.secondary" variant="body2">{t("rules.organization_desc")}</Typography>
                </Box>
                <Tooltip title={t("common.reload")}>
                  <IconButton onClick={() => currentOrganizationId && void loadOrganizationRules(currentOrganizationId)} disabled={saving}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
              <TextField
                multiline
                minRows={12}
                fullWidth
                value={organizationRules}
                onChange={(e) => setOrganizationRules(e.target.value)}
                placeholder={t("rules.organization_placeholder")}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" onClick={handleSaveOrganizationRules} disabled={saving || !organizationRules.trim()}>
                  {saving ? t("rules.saving") : t("rules.organization_save")}
                </Button>
              </Box>
            </Stack>
          )}

          {activeTab === "projects" && (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">{t("rules.projects_title")}</Typography>
                  <Typography color="text.secondary" variant="body2">{t("rules.projects_desc")}</Typography>
                </Box>
                <Tooltip title={t("common.reload")}>
                  <IconButton onClick={() => currentOrganizationId && void loadProjectList(currentOrganizationId)}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              {projectList.length === 0 ? (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {t("rules.empty_list")}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("rules.project_list")}</TableCell>
                        <TableCell align="right">{t("rules.project.actions")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {projectList.map((project) => (
                        <TableRow key={project.project_uuid}>
                          <TableCell>
                            <Typography fontWeight="medium">{project.name || project.project_id}</Typography>
                            <Typography variant="body2" color="text.secondary">{project.project_id}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title={t("projects.rules")}>
                                <IconButton size="small" onClick={() => handleOpenRulesDialog("project", project.project_uuid, project.name || project.project_id)}>
                                  <PolicyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t("common.delete")}>
                                <IconButton size="small" onClick={() => setDeleteDialogProject(project)} disabled={deletingKey === project.project_uuid}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          )}

          {activeTab === "namespaces" && (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">{t("rules.namespaces_title")}</Typography>
                  <Typography color="text.secondary" variant="body2">{t("rules.namespaces_desc")}</Typography>
                </Box>
                <Tooltip title={t("common.reload")}>
                  <IconButton onClick={() => currentOrganizationId && void loadNamespaceList(currentOrganizationId)}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              <TextField
                select
                label={t("rules.filter_by_project")}
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                sx={{ minWidth: 250 }}
              >
                <MenuItem value="">{t("rules.all_projects")}</MenuItem>
                {projectList.map((p) => (
                  <MenuItem key={p.project_uuid} value={p.project_id}>{p.name || p.project_id}</MenuItem>
                ))}
              </TextField>

              {filteredNamespaceList.length === 0 ? (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {t("rules.empty_list")}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("rules.namespace_list")}</TableCell>
                        <TableCell>{t("rules.project_list")}</TableCell>
                        <TableCell align="right">{t("rules.namespace.actions")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredNamespaceList.map((namespace) => (
                        <TableRow key={namespace.namespace_uuid}>
                          <TableCell>
                            <Typography fontWeight="medium">{namespace.namespace}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{namespace.project_id}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title={t("namespaces.rules")}>
                                <IconButton size="small" onClick={() => handleOpenRulesDialog("namespace", namespace.namespace_uuid, namespace.namespace)}>
                                  <PolicyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t("common.delete")}>
                                <IconButton size="small" onClick={() => setDeleteDialogNamespace(namespace)} disabled={deletingKey === namespace.namespace_uuid}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          )}

          {activeTab === "repositories" && (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6">{t("rules.repositories_title")}</Typography>
                  <Typography color="text.secondary" variant="body2">{t("rules.repositories_desc")}</Typography>
                </Box>
                <Tooltip title={t("common.reload")}>
                  <IconButton onClick={() => currentOrganizationId && void loadRepositoryList(currentOrganizationId)}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              <TextField
                select
                label={t("rules.filter_by_project")}
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                sx={{ minWidth: 250 }}
              >
                <MenuItem value="">{t("rules.all_projects")}</MenuItem>
                {projectList.map((p) => (
                  <MenuItem key={p.project_uuid} value={p.project_id}>{p.name || p.project_id}</MenuItem>
                ))}
              </TextField>

              {filteredRepositoryList.length === 0 ? (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      {t("rules.empty_list")}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("rules.repository_list")}</TableCell>
                        <TableCell>{t("rules.project_list")}</TableCell>
                        <TableCell align="right">{t("rules.repository.actions")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredRepositoryList.map((repo) => (
                        <TableRow key={repo.repository_uuid}>
                          <TableCell>
                            <Typography fontWeight="medium">{repo.repository_name}</Typography>
                            <Typography variant="body2" color="text.secondary">{repo.repository_id}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{repo.project_id || "-"}</Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Tooltip title={t("rules.watch_settings")}>
                                <IconButton size="small" onClick={() => handleOpenWatchSettings(repo)}>
                                  <SettingsIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t("repositories.rules")}>
                                <IconButton size="small" onClick={() => handleOpenRulesDialog("repository", repo.repository_uuid, repo.repository_name)}>
                                  <PolicyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t("common.delete")}>
                                <IconButton size="small" onClick={() => setDeleteDialogRepository(repo)} disabled={deletingKey === repo.repository_uuid}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          )}
        </Box>
      </Card>

      {/* Rules Editor Dialog */}
      <Dialog open={rulesDialogOpen} onClose={() => !saving && setRulesDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          {rulesDialogTarget?.type === "project" && t("rules.dialog_project_title", { name: rulesDialogTarget?.name })}
          {rulesDialogTarget?.type === "namespace" && t("rules.dialog_namespace_title", { name: rulesDialogTarget?.name })}
          {rulesDialogTarget?.type === "repository" && t("rules.dialog_repository_title", { name: rulesDialogTarget?.name })}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {rulesDialogTarget?.type === "project" && t("rules.dialog_project_desc")}
            {rulesDialogTarget?.type === "namespace" && t("rules.dialog_namespace_desc")}
            {rulesDialogTarget?.type === "repository" && t("rules.dialog_repository_desc")}
          </Typography>
          {loadingRules ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={12}
              value={rulesDialogContent}
              onChange={(e) => setRulesDialogContent(e.target.value)}
              placeholder={
                rulesDialogTarget?.type === "project" ? t("rules.project_placeholder") :
                rulesDialogTarget?.type === "namespace" ? t("rules.namespace_placeholder") :
                t("rules.repository_placeholder")
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRulesDialogOpen(false)} disabled={saving}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleSaveRulesDialog} disabled={saving || loadingRules || !rulesDialogContent.trim()}>
            {saving ? t("rules.saving") : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Project Rules Dialog */}
      <Dialog open={Boolean(deleteDialogProject)} onClose={() => !deletingKey && setDeleteDialogProject(null)} fullWidth maxWidth="xs">
        <DialogTitle>{t("rules.delete_project")}</DialogTitle>
        <DialogContent>
          <Typography>{t("rules.delete_confirm", { workspace: deleteDialogProject?.project_id })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogProject(null)} disabled={Boolean(deletingKey)}>{t("common.cancel")}</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!deleteDialogProject || Boolean(deletingKey)}
            onClick={() => {
              if (!deleteDialogProject) return;
              void handleDeleteProjectRules(deleteDialogProject.project_uuid).finally(() => setDeleteDialogProject(null));
            }}
          >
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Namespace Rules Dialog */}
      <Dialog open={Boolean(deleteDialogNamespace)} onClose={() => !deletingKey && setDeleteDialogNamespace(null)} fullWidth maxWidth="xs">
        <DialogTitle>{t("rules.delete_namespace")}</DialogTitle>
        <DialogContent>
          <Typography>{t("rules.delete_confirm", { workspace: `${deleteDialogNamespace?.project_id}/${deleteDialogNamespace?.namespace}` })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogNamespace(null)} disabled={Boolean(deletingKey)}>{t("common.cancel")}</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!deleteDialogNamespace || Boolean(deletingKey)}
            onClick={() => {
              if (!deleteDialogNamespace) return;
              void handleDeleteNamespaceRules(deleteDialogNamespace.namespace_uuid).finally(() => setDeleteDialogNamespace(null));
            }}
          >
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Repository Rules Dialog */}
      <Dialog open={Boolean(deleteDialogRepository)} onClose={() => !deletingKey && setDeleteDialogRepository(null)} fullWidth maxWidth="xs">
        <DialogTitle>{t("rules.delete_repository")}</DialogTitle>
        <DialogContent>
          <Typography>{t("rules.delete_confirm", { workspace: deleteDialogRepository?.name })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogRepository(null)} disabled={Boolean(deletingKey)}>{t("common.cancel")}</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!deleteDialogRepository || Boolean(deletingKey)}
            onClick={() => {
              if (!deleteDialogRepository) return;
              void handleDeleteRepositoryRules(deleteDialogRepository.repository_uuid).finally(() => setDeleteDialogRepository(null));
            }}
          >
            {t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Watch Settings Dialog */}
      <Dialog open={watchSettingsDialogOpen} onClose={() => !savingWatchSettings && setWatchSettingsDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("rules.watch_settings_title", { name: watchSettingsTarget?.repository_name || "" })}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("rules.watch_settings_desc")}
          </Typography>
          {loadingWatchSettings ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>{t("rules.patterns_label")}</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={watchSettingsPatterns}
                  onChange={(e) => setWatchSettingsPatterns(e.target.value)}
                  placeholder={t("rules.patterns_placeholder")}
                  helperText={t("rules.patterns_helper")}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>{t("rules.exclude_label")}</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={watchSettingsExclude}
                  onChange={(e) => setWatchSettingsExclude(e.target.value)}
                  placeholder={t("rules.exclude_placeholder")}
                  helperText={t("rules.exclude_helper")}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>{t("rules.debounce_label")}</Typography>
                <TextField
                  fullWidth
                  value={watchSettingsDebounce}
                  onChange={(e) => setWatchSettingsDebounce(e.target.value)}
                  placeholder="5s"
                  helperText={t("rules.debounce_helper")}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>{t("rules.batch_size_label")}</Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={watchSettingsBatchSize}
                  onChange={(e) => setWatchSettingsBatchSize(parseInt(e.target.value, 10) || 50)}
                  helperText={t("rules.batch_size_helper")}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWatchSettingsDialogOpen(false)} disabled={savingWatchSettings}>{t("common.cancel")}</Button>
          <Button variant="contained" onClick={handleSaveWatchSettings} disabled={savingWatchSettings || loadingWatchSettings}>
            {savingWatchSettings ? t("rules.saving") : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RulesPoliciesPage;