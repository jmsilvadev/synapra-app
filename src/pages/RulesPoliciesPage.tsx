import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Add as AddIcon,
  DeleteOutline,
  Refresh as RefreshIcon,
  Rule as RuleIcon,
  Folder as FolderIcon,
  Save as SaveIcon,
  Source as SourceIcon,
  AccountTree as ProjectIcon,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
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
} from "../services/adminService";
import { useI18n } from "../i18n";
import { extractErrorMessage } from "../services/apiClient";
import type { ProjectRuleSummary, NamespaceRuleSummary, RepositoryRuleSummary } from "../types/admin";

function isNotFoundError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

type RulesTab = "organization" | "projects" | "namespaces" | "repositories";

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
  const [deleteDialogProject, setDeleteDialogProject] = useState<ProjectRuleSummary | null>(null);
  const [deleteDialogNamespace, setDeleteDialogNamespace] = useState<NamespaceRuleSummary | null>(null);
  const [deleteDialogRepository, setDeleteDialogRepository] = useState<RepositoryRuleSummary | null>(null);

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

  const handleProjectSelect = async (projectUuid: string) => {
    if (!currentOrganizationId) return;
    setSelectedProjectUuid(projectUuid);
    setError(null);
    setSuccess(null);
    await loadProjectRulesContent(currentOrganizationId, projectUuid);
  };

  const handleSaveProjectRules = async () => {
    if (!currentOrganizationId || !selectedProjectUuid) return;
    if (!projectRules.trim()) {
      setError(t("rules.validation.project_empty"));
      setSuccess(null);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateProjectRules(currentOrganizationId, selectedProjectUuid, projectRules);
      await loadProjectList(currentOrganizationId);
      setSuccess(t("rules.success.project_saved"));
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.project_save")));
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

  const handleNamespaceSelect = async (namespaceUuid: string) => {
    if (!currentOrganizationId) return;
    setSelectedNamespaceUuid(namespaceUuid);
    setError(null);
    setSuccess(null);
    await loadNamespaceRulesContent(currentOrganizationId, namespaceUuid);
  };

  const handleSaveNamespaceRules = async () => {
    if (!currentOrganizationId || !selectedNamespaceUuid) return;
    if (!namespaceRules.trim()) {
      setError(t("rules.validation.namespace_empty"));
      setSuccess(null);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateNamespaceRules(currentOrganizationId, selectedNamespaceUuid, namespaceRules);
      await loadNamespaceList(currentOrganizationId);
      setSuccess(t("rules.success.namespace_saved"));
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.namespace_save")));
    } finally {
      setSaving(false);
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

  const handleRepositorySelect = async (repositoryUuid: string) => {
    if (!currentOrganizationId) return;
    setSelectedRepositoryUuid(repositoryUuid);
    setError(null);
    setSuccess(null);
    await loadRepositoryRulesContent(currentOrganizationId, repositoryUuid);
  };

  const handleSaveRepositoryRules = async () => {
    if (!currentOrganizationId || !selectedRepositoryUuid) return;
    if (!repositoryRules.trim()) {
      setError(t("rules.validation.repository_empty"));
      setSuccess(null);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateRepositoryRules(currentOrganizationId, selectedRepositoryUuid, repositoryRules);
      await loadRepositoryList(currentOrganizationId);
      setSuccess(t("rules.success.repository_saved"));
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.repository_save")));
    } finally {
      setSaving(false);
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

  const renderRulesEditor = (
    rulesContent: string,
    setRulesContent: (v: string) => void,
    placeholder: string,
    onSave: () => Promise<void>,
    saving: boolean,
    loadingRulesContent: boolean
  ) => (
    <TextField
      multiline
      minRows={12}
      fullWidth
      value={rulesContent}
      onChange={(e) => setRulesContent(e.target.value)}
      placeholder={placeholder}
      disabled={loadingRulesContent}
    />
  );

  const renderItemList = <T extends { created_at?: string; updated_at?: string }>(
    items: T[],
    selectedKey: string,
    getKey: (item: T) => string,
    getLabel: (item: T) => string,
    getSublabel: (item: T) => string,
    onSelect: (key: string) => void,
    onDelete: (key: string) => void,
    deleting: string | null
  ) => (
    <Stack spacing={1}>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t("rules.empty_list")}
        </Typography>
      ) : (
        items.map((item) => {
          const key = getKey(item);
          const selected = key === selectedKey;
          return (
            <Card
              key={key}
              variant="outlined"
              sx={{
                cursor: "pointer",
                borderColor: selected ? "rgba(0, 224, 255, 0.45)" : "rgba(0, 198, 184, 0.10)",
              }}
              onClick={() => void onSelect(key)}
            >
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">{getLabel(item)}</Typography>
                    <Chip
                      label={getSublabel(item)}
                      size="small"
                      color={selected ? "primary" : "default"}
                      variant="outlined"
                      sx={{ width: "fit-content" }}
                    />
                  </Stack>
                  <IconButton
                    size="small"
                    color="error"
                    disabled={deleting === key}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(key);
                    }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          );
        })
      )}
    </Stack>
  );

  if (loading) {
    return (
      <Container>
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
              alignItems: "flex-start",
              textTransform: "none",
              minHeight: 56,
            },
          }}
        >
          <Tab value="organization" icon={<RuleIcon />} iconPosition="start" label={t("rules.organization_tab")} />
          <Tab value="projects" icon={<ProjectIcon />} iconPosition="start" label={t("rules.projects_tab", { count: projectList.length })} />
          <Tab value="namespaces" icon={<FolderIcon />} iconPosition="start" label={t("rules.namespaces_tab", { count: namespaceList.length })} />
          <Tab value="repositories" icon={<SourceIcon />} iconPosition="start" label={t("rules.repositories_tab", { count: repositoryList.length })} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === "organization" && (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box>
                  <Typography variant="h6">{t("rules.organization_title")}</Typography>
                  <Typography color="text.secondary">{t("rules.organization_desc")}</Typography>
                </Box>
                <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                  <Tooltip title={t("common.reload")}>
                    <IconButton onClick={() => currentOrganizationId && void loadOrganizationRules(currentOrganizationId)} disabled={loading}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
              {renderRulesEditor(
                organizationRules,
                setOrganizationRules,
                t("rules.organization_placeholder"),
                handleSaveOrganizationRules,
                saving,
                false
              )}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveOrganizationRules} disabled={saving}>
                  {saving ? t("rules.saving") : t("rules.organization_save")}
                </Button>
              </Box>
            </Stack>
          )}

          {activeTab === "projects" && (
            <Stack spacing={3}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box>
                  <Typography variant="h6">{t("rules.projects_title")}</Typography>
                  <Typography color="text.secondary">{t("rules.projects_desc")}</Typography>
                </Box>
                <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                  <Tooltip title={t("common.reload")}>
                    <IconButton onClick={() => currentOrganizationId && void loadProjectList(currentOrganizationId)} disabled={loading}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle1">{t("rules.project_list")}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("rules.registered_count", { count: projectList.length })}
                          </Typography>
                        </Box>
                        <Divider />
                        {renderItemList(
                          projectList,
                          selectedProjectUuid,
                          (p) => p.project_uuid,
                          (p) => p.project_id,
                          (p) => p.name || p.project_id,
                          handleProjectSelect,
                          (uuid) => {
                            const item = projectList.find((p) => p.project_uuid === uuid);
                            if (item) setDeleteDialogProject(item);
                          },
                          deletingKey
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Stack spacing={2}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack spacing={2}>
                          <Typography variant="subtitle1">{t("rules.editor_title")}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("rules.editor_desc")}
                          </Typography>
                          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveProjectRules} disabled={saving || !selectedProjectUuid}>
                            {saving ? t("rules.saving") : t("rules.save_project")}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                    {renderRulesEditor(
                      projectRules,
                      setProjectRules,
                      t("rules.project_placeholder"),
                      handleSaveProjectRules,
                      saving,
                      loadingRules
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          )}

          {activeTab === "namespaces" && (
            <Stack spacing={3}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box>
                  <Typography variant="h6">{t("rules.namespaces_title")}</Typography>
                  <Typography color="text.secondary">{t("rules.namespaces_desc")}</Typography>
                </Box>
                <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                  <Tooltip title={t("common.reload")}>
                    <IconButton onClick={() => currentOrganizationId && void loadNamespaceList(currentOrganizationId)} disabled={loading}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle1">{t("rules.namespace_list")}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("rules.registered_count", { count: namespaceList.length })}
                          </Typography>
                        </Box>
                        <Divider />
                        {renderItemList(
                          namespaceList,
                          selectedNamespaceUuid,
                          (n) => n.namespace_uuid,
                          (n) => n.namespace,
                          (n) => n.project_id,
                          handleNamespaceSelect,
                          (uuid) => {
                            const item = namespaceList.find((n) => n.namespace_uuid === uuid);
                            if (item) setDeleteDialogNamespace(item);
                          },
                          deletingKey
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Stack spacing={2}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack spacing={2}>
                          <Typography variant="subtitle1">{t("rules.editor_title")}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("rules.editor_desc")}
                          </Typography>
                          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveNamespaceRules} disabled={saving || !selectedNamespaceUuid}>
                            {saving ? t("rules.saving") : t("rules.save_namespace")}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                    {renderRulesEditor(
                      namespaceRules,
                      setNamespaceRules,
                      t("rules.namespace_placeholder"),
                      handleSaveNamespaceRules,
                      saving,
                      loadingRules
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          )}

          {activeTab === "repositories" && (
            <Stack spacing={3}>
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                <Box>
                  <Typography variant="h6">{t("rules.repositories_title")}</Typography>
                  <Typography color="text.secondary">{t("rules.repositories_desc")}</Typography>
                </Box>
                <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                  <Tooltip title={t("common.reload")}>
                    <IconButton onClick={() => currentOrganizationId && void loadRepositoryList(currentOrganizationId)} disabled={loading}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <CardContent>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="subtitle1">{t("rules.repository_list")}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("rules.registered_count", { count: repositoryList.length })}
                          </Typography>
                        </Box>
                        <Divider />
                        {renderItemList(
                          repositoryList,
                          selectedRepositoryUuid,
                          (r) => r.repository_uuid,
                          (r) => r.name,
                          (r) => r.repository_id,
                          handleRepositorySelect,
                          (uuid) => {
                            const item = repositoryList.find((r) => r.repository_uuid === uuid);
                            if (item) setDeleteDialogRepository(item);
                          },
                          deletingKey
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Stack spacing={2}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack spacing={2}>
                          <Typography variant="subtitle1">{t("rules.editor_title")}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("rules.editor_desc")}
                          </Typography>
                          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveRepositoryRules} disabled={saving || !selectedRepositoryUuid}>
                            {saving ? t("rules.saving") : t("rules.save_repository")}
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                    {renderRulesEditor(
                      repositoryRules,
                      setRepositoryRules,
                      t("rules.repository_placeholder"),
                      handleSaveRepositoryRules,
                      saving,
                      loadingRules
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          )}
        </Box>
      </Card>

      <Dialog open={Boolean(deleteDialogProject)} onClose={() => !deletingKey && setDeleteDialogProject(null)} fullWidth maxWidth="xs">
        <DialogTitle>{t("rules.delete_project")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteDialogProject && t("rules.delete_confirm", { workspace: deleteDialogProject.project_id })}
          </DialogContentText>
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

      <Dialog open={Boolean(deleteDialogNamespace)} onClose={() => !deletingKey && setDeleteDialogNamespace(null)} fullWidth maxWidth="xs">
        <DialogTitle>{t("rules.delete_namespace")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteDialogNamespace && t("rules.delete_confirm", { workspace: `${deleteDialogNamespace.project_id}/${deleteDialogNamespace.namespace}` })}
          </DialogContentText>
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

      <Dialog open={Boolean(deleteDialogRepository)} onClose={() => !deletingKey && setDeleteDialogRepository(null)} fullWidth maxWidth="xs">
        <DialogTitle>{t("rules.delete_repository")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteDialogRepository && t("rules.delete_confirm", { workspace: deleteDialogRepository.name })}
          </DialogContentText>
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
    </Container>
  );
};

export default RulesPoliciesPage;