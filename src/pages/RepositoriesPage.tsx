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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Add as AddIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { apiClient, apiBaseURL, extractErrorMessage } from "../services/apiClient";
import { getProjects, getRepositories, createRepository, deleteRepository } from "../services/adminService";
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
}

const RepositoriesPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [integration, setIntegration] = useState<GitHubIntegration | null>(null);
  const [githubRepos, setGithubRepos] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openSyncDialog, setOpenSyncDialog] = useState(false);
  const [selectedGithubRepo, setSelectedGithubRepo] = useState<GitHubRepository | null>(null);
  const [syncForm, setSyncForm] = useState({
    project_id: "",
    default_branch: "main",
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
          apiClient.get(`/v1/console/clients/${currentOrganizationId}/github`)
            .catch(() => ({ data: { connected: false } })),
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
    setSyncForm({
      project_id: projects[0].id,
      default_branch: repo.default_branch || "main",
    });
    setOpenSyncDialog(true);
  };

  const handleSync = async () => {
    if (!currentOrganizationId || !selectedGithubRepo) return;
    setSyncing(true);
    setError(null);
    try {
      await createRepository(currentOrganizationId, {
        project_id: syncForm.project_id,
        github_repo_id: selectedGithubRepo.id,
        name: selectedGithubRepo.name,
        full_name: selectedGithubRepo.full_name,
        html_url: selectedGithubRepo.html_url,
        default_branch: syncForm.default_branch,
        is_private: selectedGithubRepo.private,
      });
      setSuccess(t("repositories.sync_success", { name: selectedGithubRepo.full_name }));
      setOpenSyncDialog(false);
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
                        <TableCell>{repo.default_branch}</TableCell>
                        <TableCell>
                          <Chip 
                            label={repo.sync_status} 
                            color={repo.sync_status === "synced" ? "success" : repo.sync_status === "error" ? "error" : "default"} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={t("common.delete")}>
                            <IconButton size="small" onClick={() => handleRemoveRepository(repo.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
          <Typography variant="h5" sx={{ mb: 2 }}>{t("repositories.available")}</Typography>
          {projects.length === 0 ? (
            <Alert severity="warning">{t("repositories.no_projects")}</Alert>
          ) : (
            <List>
              {githubRepos.map((repo) => (
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
            <FormControl fullWidth>
              <InputLabel>{t("repositories.project")}</InputLabel>
              <Select
                value={syncForm.project_id}
                onChange={(e) => setSyncForm({ ...syncForm, project_id: e.target.value })}
                label={t("repositories.project")}
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} ({p.slug})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t("repositories.branch")}
              value={syncForm.default_branch}
              onChange={(e) => setSyncForm({ ...syncForm, default_branch: e.target.value })}
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