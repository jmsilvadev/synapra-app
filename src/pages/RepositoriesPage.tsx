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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
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
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { apiClient, apiBaseURL, extractErrorMessage } from "../services/apiClient";

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
}

interface SyncedRepository {
  id: string;
  github_repo_id: number;
  repo_name: string;
  project_id: string;
  namespace: string;
  branch: string;
  status: string;
  created_at: string;
}

const RepositoriesPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [integration, setIntegration] = useState<GitHubIntegration | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [syncedRepos, setSyncedRepos] = useState<SyncedRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSyncDialog, setOpenSyncDialog] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [syncForm, setSyncForm] = useState({
    project_id: "github",
    namespace: "",
    branch: "main",
  });

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      try {
        const [integrationRes, syncedRes] = await Promise.all([
          apiClient.get(`/v1/console/clients/${currentOrganizationId}/github`)
            .catch(() => ({ data: { connected: false } })),
          apiClient.get(`/v1/console/clients/${currentOrganizationId}/github/synced`)
            .catch(() => ({ data: { repositories: [] } })),
        ]);

        const integrationData = integrationRes.data;
        setIntegration(integrationData);

        const syncedData = syncedRes.data;
        setSyncedRepos(syncedData.repositories || []);

        if (integrationData.connected) {
          const reposRes = await apiClient.get(`/v1/console/clients/${currentOrganizationId}/github/repositories`);
          const reposData = reposRes.data;
          setRepositories(reposData.repositories || []);
        }
      } catch (err) {
        setError(extractErrorMessage(err, t("repositories.load_error")));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [currentOrganizationId, t]);

  const handleConnect = async () => {
    if (!currentOrganizationId) return;
    window.location.href = `${apiBaseURL}/v1/console/clients/${currentOrganizationId}/github/authorize`;
  };

  const handleDisconnect = async () => {
    if (!currentOrganizationId) return;
    setLoading(true);
    try {
      await apiClient.delete(`/v1/console/clients/${currentOrganizationId}/github`);
      setIntegration({ connected: false });
      setRepositories([]);
      setSuccess(t("repositories.disconnected"));
    } catch (err) {
      setError(extractErrorMessage(err, t("repositories.disconnect_error")));
    } finally {
      setLoading(false);
    }
  };

  const handleSyncClick = (repo: GitHubRepository) => {
    setSelectedRepo(repo);
    setSyncForm({
      project_id: "github",
      namespace: repo.name,
      branch: "main",
    });
    setOpenSyncDialog(true);
  };

  const handleSync = async () => {
    if (!currentOrganizationId || !selectedRepo) return;
    setSyncing(true);
    setError(null);
    try {
      const res = await apiClient.post(`/v1/console/clients/${currentOrganizationId}/github/repositories`, {
        repo_id: selectedRepo.id,
        repo_name: selectedRepo.full_name,
        project_id: syncForm.project_id,
        namespace: syncForm.namespace,
        branch: syncForm.branch,
      });
      setSuccess(t("repositories.sync_success", { namespace: res.data.namespace }));
      setOpenSyncDialog(false);
      
      const syncedRes = await apiClient.get(`/v1/console/clients/${currentOrganizationId}/github/synced`);
      const syncedData = syncedRes.data;
      setSyncedRepos(syncedData.repositories || []);
    } catch (err) {
      setError(extractErrorMessage(err, t("repositories.sync_error")));
    } finally {
      setSyncing(false);
    }
  };

  const handleRemoveSync = async (repoId: string) => {
    if (!currentOrganizationId) return;
    try {
      await apiClient.delete(`/v1/console/clients/${currentOrganizationId}/github/repositories/${repoId}`);
      setSyncedRepos(syncedRepos.filter((r) => r.id !== repoId));
      setSuccess(t("repositories.removed"));
    } catch (err) {
      setError(extractErrorMessage(err, t("repositories.remove_error")));
    }
  };

  const isRepoSynced = (repoId: number) => syncedRepos.some((r) => r.github_repo_id === repoId);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>{t("repositories.title")}</Typography>
      
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

      {integration?.connected && (
        <>
          <Typography variant="h5" sx={{ mb: 2 }}>{t("repositories.synced")}</Typography>
          {syncedRepos.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>{t("repositories.no_synced")}</Alert>
          ) : (
            <List sx={{ mb: 3 }}>
              {syncedRepos.map((repo) => (
                <ListItem key={repo.id} divider>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={repo.repo_name}
                    secondary={`${repo.project_id}/${repo.namespace} (${repo.branch})`}
                  />
                  <Chip 
                    label={repo.status} 
                    color={repo.status === "synced" ? "success" : "default"} 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Tooltip title={t("common.delete")}>
                    <IconButton edge="end" onClick={() => handleRemoveSync(repo.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          )}

          <Typography variant="h5" sx={{ mb: 2 }}>{t("repositories.available")}</Typography>
          {repositories.length === 0 ? (
            <Alert severity="info">{t("repositories.no_repositories")}</Alert>
          ) : (
            <List>
              {repositories.map((repo) => (
                <ListItem key={repo.id} divider>
                  <ListItemIcon>
                    {repo.private ? <LockIcon /> : <PublicIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={repo.name}
                    secondary={repo.full_name}
                  />
                  {isRepoSynced(repo.id) ? (
                    <Chip label={t("repositories.already_synced")} color="success" size="small" />
                  ) : (
                    <Button
                      size="small"
                      startIcon={<SyncIcon />}
                      onClick={() => handleSyncClick(repo)}
                    >
                      {t("repositories.sync")}
                    </Button>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </>
      )}

      <Dialog open={openSyncDialog} onClose={() => setOpenSyncDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("repositories.sync_dialog_title")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t("repositories.project_id")}
              value={syncForm.project_id}
              onChange={(e) => setSyncForm({ ...syncForm, project_id: e.target.value })}
            />
            <TextField
              fullWidth
              label={t("repositories.namespace")}
              value={syncForm.namespace}
              onChange={(e) => setSyncForm({ ...syncForm, namespace: e.target.value })}
            />
            <TextField
              fullWidth
              label={t("repositories.branch")}
              value={syncForm.branch}
              onChange={(e) => setSyncForm({ ...syncForm, branch: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSyncDialog(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSync} variant="contained" disabled={syncing}>
            {syncing ? t("repositories.syncing") : t("repositories.sync_now")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RepositoriesPage;
