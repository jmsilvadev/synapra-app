import React, { useCallback, useEffect, useState } from "react";
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
import { extractErrorMessage } from "../services/apiClient";
import type { WorkspaceRuleSummary } from "../types/admin";

function workspaceKey(projectId: string, namespace: string) {
  return `${projectId}::${namespace}`;
}

const RulesPoliciesPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
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
    } finally {
      setLoadingWorkspace(false);
    }
  }, []);

  const loadRulesData = useCallback(async (clientId: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const orgRules = await getOrganizationRules(clientId);
      setOrganizationRules(orgRules.rules_markdown || "");

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
      setError(extractErrorMessage(err, "Falha ao carregar regras"));
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
      setError("Informe project_id e namespace para consultar as regras do workspace.");
      setSuccess(null);
      return;
    }

    setError(null);
    setSuccess(null);
    await loadWorkspaceRules(currentOrganizationId, projectId, namespace);
    setSuccess("Regras do workspace carregadas do Postgres.");
  };

  const handleSaveOrganizationRules = async () => {
    if (!currentOrganizationId) {
      return;
    }
    if (!organizationRules.trim()) {
      setError("As regras da organização não podem ficar vazias.");
      setSuccess(null);
      return;
    }

    setSavingOrganization(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await updateOrganizationRules(currentOrganizationId, organizationRules);
      setOrganizationRules(response.rules_markdown || "");
      setSuccess("Regras da organização gravadas no Postgres e disponíveis para o Synapra.");
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao salvar regras da organização"));
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
      setError("Informe project_id e namespace antes de salvar as regras do workspace.");
      setSuccess(null);
      return;
    }
    if (!workspaceRules.trim()) {
      setError("As regras do workspace não podem ficar vazias.");
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
      setSuccess("Regras do workspace gravadas no Postgres e usadas no render do Synapra.");
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao salvar regras do workspace"));
    } finally {
      setSavingWorkspace(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Regras & Políticas
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Estas regras ficam persistidas no Postgres e entram no contexto que o Synapra entrega aos agentes.
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
          Nenhuma organização associada ao utilizador autenticado.
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
                    label="Organização"
                  />
                  <Tab
                    value="workspaces"
                    label={`Workspaces (${workspaceList.length})`}
                  />
                </Tabs>

                {activeTab === "organization" ? (
                  <Stack spacing={2}>
                    <div>
                      <Typography variant="h6">Regras da organização</Typography>
                      <Typography color="text.secondary">
                        Estas regras valem para todos os workspaces da organização.
                      </Typography>
                    </div>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        onClick={() => currentOrganizationId && void loadRulesData(currentOrganizationId)}
                        disabled={loading}
                      >
                        Recarregar
                      </Button>
                    </Stack>
                    <TextField
                      multiline
                      minRows={12}
                      fullWidth
                      value={organizationRules}
                      onChange={(event) => setOrganizationRules(event.target.value)}
                      placeholder="Escreva aqui as regras globais da organização..."
                    />
                    <div>
                      <Button
                        variant="contained"
                        onClick={handleSaveOrganizationRules}
                        disabled={savingOrganization}
                      >
                        {savingOrganization ? "A guardar..." : "Salvar regras da organização"}
                      </Button>
                    </div>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <div>
                      <Typography variant="h6">Regras dos workspaces</Typography>
                      <Typography color="text.secondary">
                        Cada organização pode ter vários workspaces. Selecione um existente ou crie um novo.
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
                                  <Typography variant="subtitle1">Lista de workspaces</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {workspaceList.length} cadastrado(s)
                                  </Typography>
                                </div>
                                <Stack direction="row" spacing={1}>
                                  <Button variant="outlined" size="small" onClick={handleCreateWorkspaceDraft}>
                                    Novo
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => currentOrganizationId && void refreshWorkspaceList(currentOrganizationId)}
                                  >
                                    Recarregar
                                  </Button>
                                </Stack>
                              </Stack>
                              <Divider />
                              {workspaceList.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                  Nenhum workspace configurado ainda.
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
                                  <Typography variant="subtitle1">Editor do workspace</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Defina o par `project_id` + `namespace` e edite as regras do workspace selecionado.
                                  </Typography>
                                </div>
                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                  <TextField
                                    fullWidth
                                    label="Project ID"
                                    value={projectId}
                                    onChange={(event) => setProjectId(event.target.value)}
                                    placeholder="ex: synapra-app"
                                  />
                                  <TextField
                                    fullWidth
                                    label="Namespace"
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
                                    {loadingWorkspace ? "A carregar..." : "Carregar regras"}
                                  </Button>
                                  <Button
                                    variant="contained"
                                    onClick={handleSaveWorkspaceRules}
                                    disabled={savingWorkspace}
                                  >
                                    {savingWorkspace ? "A guardar..." : "Salvar workspace"}
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
                            placeholder="Escreva aqui as regras específicas deste workspace..."
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
