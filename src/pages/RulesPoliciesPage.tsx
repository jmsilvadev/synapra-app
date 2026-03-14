import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import {
  getOrganizationRules,
  getWorkspaceRules,
  listWorkspaceRules,
  updateOrganizationRules,
  updateWorkspaceRules,
} from "../services/adminService";
import { useI18n } from "../i18n";
import { extractErrorMessage } from "../services/apiClient";
import type { WorkspaceRuleSummary } from "../types/admin";

function workspaceKey(projectId: string, namespace: string) {
  return `${projectId}::${namespace}`;
}

function isNotFoundError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

const RulesPoliciesPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [organizationRules, setOrganizationRules] = useState("");
  const [workspaceRules, setWorkspaceRules] = useState("");
  const [workspaceList, setWorkspaceList] = useState<WorkspaceRuleSummary[]>([]);
  const [projectId, setProjectId] = useState("");
  const [namespace, setNamespace] = useState("");
  const [activeTab, setActiveTab] = useState<"organization" | "workspaces">("organization");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);
  const [savingOrganization, setSavingOrganization] = useState(false);
  const [savingWorkspace, setSavingWorkspace] = useState(false);

  const refreshWorkspaceList = useCallback(async (clientId: string) => {
    const workspaces = await listWorkspaceRules(clientId);
    setWorkspaceList(workspaces);
    return workspaces;
  }, []);

  const loadWorkspaceRules = useCallback(async (clientId: string, nextProjectId: string, nextNamespace: string) => {
    if (!nextProjectId.trim() || !nextNamespace.trim()) {
      setWorkspaceRules("");
      return;
    }

    setLoadingWorkspace(true);
    try {
      const response = await getWorkspaceRules(clientId, nextProjectId.trim(), nextNamespace.trim());
      setWorkspaceRules(response?.rules_markdown || "");
    } catch (err) {
      if (isNotFoundError(err)) {
        setWorkspaceRules("");
        return;
      }
      throw err;
    } finally {
      setLoadingWorkspace(false);
    }
  }, []);

  const loadRulesData = useCallback(async (clientId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      try {
        const orgRules = await getOrganizationRules(clientId);
        setOrganizationRules(orgRules.rules_markdown || "");
      } catch (err) {
        if (isNotFoundError(err)) {
          setOrganizationRules("");
        } else {
          throw err;
        }
      }

      const workspaces = await refreshWorkspaceList(clientId);

      if (workspaces.length > 0) {
        setActiveTab("workspaces");
        const firstWorkspace = workspaces[0];
        setProjectId(firstWorkspace.project_id);
        setNamespace(firstWorkspace.namespace);
        await loadWorkspaceRules(clientId, firstWorkspace.project_id, firstWorkspace.namespace);
      } else {
        setProjectId("");
        setNamespace("");
        setWorkspaceRules("");
      }
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.load_error")));
    } finally {
      setLoading(false);
    }
  }, [loadWorkspaceRules, refreshWorkspaceList]);

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }

      await loadRulesData(currentOrganizationId);
    };

    void load();
  }, [currentOrganizationId, loadRulesData]);

  const handleWorkspaceSelect = async (nextProjectId: string, nextNamespace: string) => {
    if (!currentOrganizationId) {
      return;
    }
    setProjectId(nextProjectId);
    setNamespace(nextNamespace);
    setError(null);
    setSuccess(null);
    await loadWorkspaceRules(currentOrganizationId, nextProjectId, nextNamespace);
  };

  const handleCreateWorkspaceDraft = () => {
    setProjectId("");
    setNamespace("");
    setWorkspaceRules("");
    setError(null);
    setSuccess(null);
  };

  const handleLoadWorkspaceRules = async () => {
    if (!currentOrganizationId) {
      return;
    }
      if (!projectId.trim() || !namespace.trim()) {
      setError(t("rules.validation.workspace_lookup"));
      setSuccess(null);
      return;
    }

    setError(null);
    setSuccess(null);
    await loadWorkspaceRules(currentOrganizationId, projectId, namespace);
    setSuccess(t("rules.success.workspace_loaded"));
  };

  const handleSaveOrganizationRules = async () => {
    if (!currentOrganizationId) {
      return;
    }
    if (!organizationRules.trim()) {
      setError(t("rules.validation.organization_empty"));
      setSuccess(null);
      return;
    }

    setSavingOrganization(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await updateOrganizationRules(currentOrganizationId, organizationRules);
      setOrganizationRules(response.rules_markdown || "");
      setSuccess(t("rules.success.organization_saved"));
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.organization_save")));
    } finally {
      setSavingOrganization(false);
    }
  };

  const handleSaveWorkspaceRules = async () => {
    if (!currentOrganizationId) {
      return;
    }
    const trimmedProjectId = projectId.trim();
    const trimmedNamespace = namespace.trim();
    if (!trimmedProjectId || !trimmedNamespace) {
      setError(t("rules.validation.workspace_identity"));
      setSuccess(null);
      return;
    }
    if (!workspaceRules.trim()) {
      setError(t("rules.validation.workspace_empty"));
      setSuccess(null);
      return;
    }

    setSavingWorkspace(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await updateWorkspaceRules(currentOrganizationId, {
        project_id: trimmedProjectId,
        namespace: trimmedNamespace,
        rules_markdown: workspaceRules,
      });
      setWorkspaceRules(response.rules_markdown || "");
      const workspaces = await refreshWorkspaceList(currentOrganizationId);
      const exists = workspaces.some(
        (item) => item.project_id === trimmedProjectId && item.namespace === trimmedNamespace
      );
      if (!exists) {
        setWorkspaceList((current) => [
          ...current,
          { project_id: trimmedProjectId, namespace: trimmedNamespace },
        ]);
      }
      setSuccess(t("rules.success.workspace_saved"));
    } catch (err) {
      setError(extractErrorMessage(err, t("rules.save_workspace")));
    } finally {
      setSavingWorkspace(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t("rules.title")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("rules.subtitle")}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      {loading ? (
        <CircularProgress />
      ) : !currentOrganizationId ? (
        <Alert severity="info">
          {t("rules.no_org")}
        </Alert>
      ) : (
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Tabs
                  value={activeTab}
                  onChange={(_, value) => setActiveTab(value)}
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
                  <Tab
                    value="organization"
                    label={t("rules.organization_tab")}
                  />
                  <Tab
                    value="workspaces"
                    label={t("rules.workspaces_tab", { count: workspaceList.length })}
                  />
                </Tabs>

                {activeTab === "organization" ? (
                  <Stack spacing={2}>
                    <div>
                      <Typography variant="h6">{t("rules.organization_title")}</Typography>
                      <Typography color="text.secondary">
                        {t("rules.organization_desc")}
                      </Typography>
                    </div>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        onClick={() => currentOrganizationId && void loadRulesData(currentOrganizationId)}
                        disabled={loading}
                      >
                        {t("common.reload")}
                      </Button>
                    </Stack>
                    <TextField
                      multiline
                      minRows={12}
                      fullWidth
                      value={organizationRules}
                      onChange={(event) => setOrganizationRules(event.target.value)}
                      placeholder={t("rules.organization_placeholder")}
                    />
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleSaveOrganizationRules}
                        disabled={savingOrganization}
                      >
                        {savingOrganization ? t("rules.organization_saving") : t("rules.organization_save")}
                      </Button>
                    </div>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <div>
                      <Typography variant="h6">{t("rules.workspaces_title")}</Typography>
                      <Typography color="text.secondary">
                        {t("rules.workspaces_desc")}
                      </Typography>
                    </div>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                          <CardContent>
                            <Stack spacing={2}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                spacing={2}
                              >
                                <div>
                                  <Typography variant="subtitle1">{t("rules.workspace_list")}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {t("rules.workspace_registered", { count: workspaceList.length })}
                                  </Typography>
                                </div>
                                <Stack direction="row" spacing={1}>
                                  <Button variant="outlined" size="small" onClick={handleCreateWorkspaceDraft}>
                                    {t("common.new")}
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => currentOrganizationId && void refreshWorkspaceList(currentOrganizationId)}
                                  >
                                    {t("common.reload")}
                                  </Button>
                                </Stack>
                              </Stack>
                              <Divider />
                              {workspaceList.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                  {t("rules.workspace_empty")}
                                </Typography>
                              ) : (
                                <Stack spacing={1}>
                                  {workspaceList.map((item) => {
                                    const selected =
                                      item.project_id === projectId && item.namespace === namespace;
                                    return (
                                      <Card
                                        key={workspaceKey(item.project_id, item.namespace)}
                                        variant="outlined"
                                        sx={{
                                          cursor: "pointer",
                                          borderColor: selected
                                            ? "rgba(0, 224, 255, 0.45)"
                                            : "rgba(0, 198, 184, 0.10)",
                                        }}
                                        onClick={() => void handleWorkspaceSelect(item.project_id, item.namespace)}
                                      >
                                        <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                                          <Stack spacing={1}>
                                            <Typography variant="subtitle2">{item.project_id}</Typography>
                                            <Chip
                                              label={item.namespace}
                                              size="small"
                                              color={selected ? "primary" : "default"}
                                              variant="outlined"
                                              sx={{ width: "fit-content" }}
                                            />
                                          </Stack>
                                        </CardContent>
                                      </Card>
                                    );
                                  })}
                                </Stack>
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
                                <div>
                                  <Typography variant="subtitle1">{t("rules.workspace_editor")}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {t("rules.workspace_editor_desc")}
                                  </Typography>
                                </div>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                  <TextField
                                    fullWidth
                                    label={t("rules.project_id")}
                                    value={projectId}
                                    onChange={(event) => setProjectId(event.target.value)}
                                    placeholder="ex: synapra-app"
                                  />
                                  <TextField
                                    fullWidth
                                    label={t("rules.namespace")}
                                    value={namespace}
                                    onChange={(event) => setNamespace(event.target.value)}
                                    placeholder="ex: workspace"
                                  />
                                </Stack>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  <Button
                                    variant="outlined"
                                    onClick={handleLoadWorkspaceRules}
                                    disabled={loadingWorkspace}
                                  >
                                    {loadingWorkspace ? t("rules.loading_workspace") : t("rules.load_workspace")}
                                  </Button>
                                  <Button
                                    variant="contained"
                                    onClick={handleSaveWorkspaceRules}
                                    disabled={savingWorkspace}
                                  >
                                    {savingWorkspace ? t("rules.saving_workspace") : t("rules.save_workspace")}
                                  </Button>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                          <TextField
                            multiline
                            minRows={12}
                            fullWidth
                            value={workspaceRules}
                            onChange={(event) => setWorkspaceRules(event.target.value)}
                            placeholder={t("rules.workspace_placeholder")}
                          />
                        </Stack>
                      </Grid>
                    </Grid>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Container>
  );
};

export default RulesPoliciesPage;
