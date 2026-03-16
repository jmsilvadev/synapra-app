import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";
import {
  GitHub as GitHubIcon,
  Sync as SyncIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
  Folder as FolderIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { apiClient, apiBaseURL, extractErrorMessage } from "../services/apiClient";
import { getProjects, getNamespaces, getRepositories, createRepository, deleteRepository, createGitHubFiles, syncGitHubRepository } from "../services/adminService";
import type { Project, Repository } from "../types/admin";

interface GitHubIntegration {
  connected: boolean;
  github_user?: string;
  created_at?: string;
  updated_at?: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch?: string;
}

const RepositoriesPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [namespaces, setNamespaces] = useState<{ id: string; name: string; project_id: string }[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [integration, setIntegration] = useState<GitHubIntegration | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSyncDialog, setOpenSyncDialog] = useState(false);
  const [selectedGithubRepo, setSelectedGithubRepo] = useState<GitHubRepository | null>(null);
  const [editingRepository, setEditingRepository] = useState<Repository | null>(null);
  const [syncForm, setSyncForm] = useState({
    project_id: "",
    namespace_id: "",
    default_branch: "main",
    create_files: true,
  });

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      try {
        const [projectsData, reposData, integrationRes] = await Promise.all([
          getProjects(currentOrganizationId).catch(() => []),
          getRepositories(currentOrganizationId).catch(() => []),
          apiClient.get(`/v1/console/clients/${currentOrganizationId}/github`).catch(() => ({ data: { connected: false } })),
        ]);
        setProjects(projectsData);
        setRepositories(reposData);
        setIntegration(integrationRes.data);

        if (integrationRes.data.connected) {
          const reposRes = await apiClient.get(`/v1/console/clients/${currentOrganizationId}/github/repositories`);
          setGithubRepos(reposRes.data.repositories || []);
        }
      } catch (err) {
        setError(extractErrorMessage(err, t("repositories.load_error")));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [currentOrganizationId, t]);

  useEffect(() => {
    const loadNamespaces = async () => {
      if (!currentOrganizationId || !syncForm.project_id) return;
      try {
        const namespacesData = await getNamespaces(currentOrganizationId, syncForm.project_id);
        setNamespaces(namespacesData);
        if (namespacesData.length > 0) {
          setSyncForm(prev => ({ ...prev, namespace_id: namespacesData[0].id }));
        }
      } catch (err) {
        setNamespaces([]);
      }
    };
    void loadNamespaces();
  }, [currentOrganizationId, syncForm.project_id]);

  const handleConnect = async () => {
    if (!currentOrganizationId) return;
    const authHeader = apiClient.defaults.headers.common.Authorization as string | undefined;
    const token = authHeader ? authHeader.replace("Bearer ", "") : "";
    if (!token) {
      setError(t("repositories.no_token"));
      return;
    }
    
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    const authUrl = `${apiBaseURL}/v1/console/clients/${currentOrganizationId}/github/authorize?token=${encodeURIComponent(token)}`;
    const popup = window.open(
      authUrl,
      "GitHubOAuth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,resizable=yes,scrollbars=yes`
    );
    
    if (!popup) {
      setError(t("repositories.popup_blocked"));
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "github-connected" && event.data?.success) {
        window.removeEventListener("message", handleMessage);
        setIntegration({ connected: true, github_user: event.data.user });
        setSuccess(t("repositories.connected", { user: event.data.user }));
        loadGithubRepos();
      }
    };
    
    window.addEventListener("message", handleMessage);
    
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener("message", handleMessage);
      }
    }, 500);
  };

  const loadGithubRepos = async () => {
    if (!currentOrganizationId) return;
    try {
      const reposRes = await apiClient.get(`/v1/console/clients/${currentOrganizationId}/github/repositories`);
      setGithubRepos(reposRes.data.repositories || []);
    } catch (err) {
      console.error("Failed to load GitHub repos:", err);
    }
  };

  const handleDisconnect = async () => {
    if (!currentOrganizationId) return;
    setLoading(true);
    try {
      await apiClient.delete(`/v1/console/clients/${currentOrganizationId}/github`);
      setIntegration({ connected: false });
      setGithubRepos([]);
      setSuccess(t("repositories.disconnected"));
    } catch (err) {
      setError(extractErrorMessage(err, t("repositories.disconnect_error")));
    } finally {
      setLoading(false);
    }
  };

  const handleSyncClick = (repo: GitHubRepository) => {
    if (projects.length === 0) {
      setError(t("repositories.no_projects"));
      return;
    }
    setSelectedGithubRepo(repo);
    setEditingRepository(null);
    setSyncForm({
      project_id: projects[0].id,
      namespace_id: "",
      default_branch: repo.default_branch || "main",
      create_files: true,
    });
    setOpenSyncDialog(true);
  };

  const handleResyncClick = async (repo: Repository) => {
    if (projects.length === 0) {
      setError(t("repositories.no_projects"));
      return;
    }
    setSelectedGithubRepo(null);
    setEditingRepository(repo);
    setSyncForm({
      project_id: repo.project_id,
      namespace_id: repo.namespace_id || "",
      default_branch: repo.default_branch || "main",
      create_files: false,
    });
    
    if (repo.project_id) {
      try {
        const namespacesData = await getNamespaces(currentOrganizationId!, repo.project_id);
        setNamespaces(namespacesData);
      } catch (err) {
        setNamespaces([]);
      }
    }
    setOpenSyncDialog(true);
  };

  const handleSync = async () => {
    if (!currentOrganizationId) return;
    if (!syncForm.project_id || !syncForm.namespace_id) {
      setError(t("repositories.select_project_namespace"));
      return;
    }
    
    const repoId = selectedGithubRepo?.id || editingRepository?.github_repo_id;
    const repoName = selectedGithubRepo?.full_name || editingRepository?.full_name;
    
    if (!repoId || !repoName) return;
    
    setSyncing(true);
    setError(null);
    try {
      if (syncForm.create_files && selectedGithubRepo) {
        await createGitHubFiles(currentOrganizationId, {
          repo: repoName,
          branch: syncForm.default_branch,
          project_id: syncForm.project_id,
          namespace_id: syncForm.namespace_id,
        });
      }
      await syncGitHubRepository(currentOrganizationId, {
        repo_id: repoId,
        repo_name: repoName,
        project_id: syncForm.project_id,
        namespace_id: syncForm.namespace_id,
        branch: syncForm.default_branch,
      });
      setSuccess(editingRepository 
        ? t("repositories.resync_success", { name: repoName })
        : t("repositories.sync_success", { name: repoName }));
      setOpenSyncDialog(false);
      setSelectedGithubRepo(null);
      setEditingRepository(null);
      const reposData = await getRepositories(currentOrganizationId);
      setRepositories(reposData);
    } catch (err) {
      setError(extractErrorMessage(err, t("repositories.sync_error")));
    } finally {
      setSyncing(false);
    }
  };

  const handleRemoveRepository = async (repoId: string) => {
    if (!currentOrganizationId) return;
    try {
      await deleteRepository(currentOrganizationId, repoId);
      setRepositories(repositories.filter((r) => r.id !== repoId));
      setSuccess(t("repositories.removed"));
    } catch (err) {
      setError(extractErrorMessage(err, t("repositories.remove_error")));
    }
  };

  const handleRefresh = async () => {
    if (!currentOrganizationId) return;
    setRefreshing(true);
    try {
      const reposData = await getRepositories(currentOrganizationId);
      setRepositories(reposData);
    } catch (err) {
      setError(extractErrorMessage(err, t("repositories.load_error")));
    } finally {
      setRefreshing(false);
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? `${project.name} (${project.slug})` : projectId;
  };

  const isRepoSynced = (repoId: number) => repositories.some((r) => r.github_repo_id === repoId);

  const repositoriesByProject = repositories.reduce((acc, repo) => {
    const key = repo.project_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(repo);
    return acc;
  }, {} as Record<string, Repository[]>);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4">{t("repositories.title")}</Typography>
        <Tooltip title={t("common.refresh")}>
          <IconButton onClick={handleRefresh} disabled={refreshing}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <GitHubIcon color="primary" fontSize="large" />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">{t("repositories.github_connection")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {integration?.connected 
                  ? t("repositories.connected_as", { user: integration.github_user })
                  : t("repositories.not_connected")}
              </Typography>
            </Box>
            {integration?.connected ? (
              <Button
                variant="outlined"
                color="error"
                startIcon={<LinkOffIcon />}
                onClick={handleDisconnect}
              >
                {t("repositories.disconnect")}
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<LinkIcon />}
                onClick={handleConnect}
              >
                {t("repositories.connect")}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h5" sx={{ mb: 2 }}>{t("repositories.synced")}</Typography>
      
      {repositories.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>{t("repositories.no_synced")}</Alert>
      ) : (
        Object.entries(repositoriesByProject).map(([projectId, repos]) => (
          <Card key={projectId} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {getProjectName(projectId)}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("repositories.table.name")}</TableCell>
                      <TableCell>{t("repositories.table.branch")}</TableCell>
                      <TableCell>{t("repositories.table.status")}</TableCell>
                      <TableCell align="right">{t("repositories.table.actions")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {repos.map((repo) => (
                      <TableRow key={repo.id}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {repo.is_private ? <LockIcon fontSize="small" /> : <PublicIcon fontSize="small" />}
                            <Typography variant="body2">{repo.full_name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{repo.default_branch || "main"}</TableCell>
                        <TableCell>
                          <Chip 
                            label={repo.pending_docs > 0 ? t("repositories.processing") : (repo.status || "synced")} 
                            size="small" 
                            color={repo.status === "error" ? "error" : (repo.pending_docs > 0 ? "warning" : "success")} 
                          />
                        </TableCell>
<TableCell align="right">
                           <Stack direction="row" spacing={1} justifyContent="flex-end">
<Tooltip title={t("repositories.resync")}>
                                <IconButton size="small" onClick={() => handleResyncClick(repo)} disabled={syncing}>
                                  <SyncIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                             <Tooltip title={t("common.delete")}>
                               <IconButton size="small" onClick={() => handleRemoveRepository(repo.id)}>
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
            </CardContent>
          </Card>
        ))
      )}

      {integration?.connected && (
        <>
          <Typography variant="h5" sx={{ mb: 2, mt: 3 }}>{t("repositories.available")}</Typography>
          {githubRepos.length === 0 ? (
            <Alert severity="info">{t("repositories.no_available")}</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("repositories.table.name")}</TableCell>
                    <TableCell>{t("repositories.table.visibility")}</TableCell>
                    <TableCell align="right">{t("repositories.table.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {githubRepos.map((repo) => (
                    <TableRow key={repo.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {repo.private ? <LockIcon fontSize="small" color="action" /> : <PublicIcon fontSize="small" color="action" />}
                          <Typography variant="body2">{repo.full_name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={repo.private ? "Private" : "Public"} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        {isRepoSynced(repo.id) ? (
                          <Chip label={t("repositories.already_synced")} size="small" color="success" />
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<SyncIcon />}
                            onClick={() => handleSyncClick(repo)}
                          >
                            {t("repositories.sync")}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      <Dialog open={openSyncDialog} onClose={() => setOpenSyncDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingRepository ? t("repositories.resync_dialog_title") : t("repositories.sync_dialog_title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("repositories.sync_dialog_desc")}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>{selectedGithubRepo?.full_name}</strong>
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label={t("repositories.select_project")}
              value={syncForm.project_id}
              onChange={(e) => setSyncForm({ ...syncForm, project_id: e.target.value })}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label={t("repositories.select_namespace")}
              value={syncForm.namespace_id}
              onChange={(e) => setSyncForm({ ...syncForm, namespace_id: e.target.value })}
              disabled={!syncForm.project_id || namespaces.length === 0}
            >
              {namespaces.map((ns) => (
                <MenuItem key={ns.id} value={ns.id}>
                  {ns.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label={t("repositories.default_branch")}
              value={syncForm.default_branch}
              onChange={(e) => setSyncForm({ ...syncForm, default_branch: e.target.value })}
            />
            {!editingRepository && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={syncForm.create_files}
                      onChange={(e) => setSyncForm({ ...syncForm, create_files: e.target.checked })}
                    />
                  }
                  label={t("repositories.create_files")}
                />
                {syncForm.create_files && (
                  <Typography variant="caption" color="text.secondary">
                    {t("repositories.create_files_desc")}
                  </Typography>
                )}
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenSyncDialog(false); setSelectedGithubRepo(null); setEditingRepository(null); }}>{t("common.cancel")}</Button>
          <Button
            variant="contained"
            onClick={handleSync}
            disabled={syncing || !syncForm.project_id || !syncForm.namespace_id}
          >
            {syncing ? <CircularProgress size={24} /> : editingRepository ? t("repositories.resync") : t("repositories.sync")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RepositoriesPage;