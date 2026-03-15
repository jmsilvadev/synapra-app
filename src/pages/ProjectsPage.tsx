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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  Policy as PolicyIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { extractErrorMessage } from "../services/apiClient";
import { getProjects, createProject, deleteProject, getRepositories, getProjectRules, updateProjectRules } from "../services/adminService";
import type { Project, Repository } from "../types/admin";

const ProjectsPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [projects, setProjects] = useState<Project[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", slug: "" });
  const [creating, setCreating] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [rulesDialogProject, setRulesDialogProject] = useState<Project | null>(null);
  const [rulesContent, setRulesContent] = useState("");
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesSaving, setRulesSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      try {
        const [projectsData, reposData] = await Promise.all([
          getProjects(currentOrganizationId).catch(() => []),
          getRepositories(currentOrganizationId).catch(() => []),
        ]);
        setProjects(projectsData);
        setRepositories(reposData);
      } catch (err) {
        setError(extractErrorMessage(err, t("projects.load_error")));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [currentOrganizationId, t]);

  const handleCreate = async () => {
    if (!currentOrganizationId || !createForm.name || !createForm.slug) return;
    setCreating(true);
    setError(null);
    try {
      const newProject = await createProject(currentOrganizationId, {
        name: createForm.name,
        slug: createForm.slug,
      });
      setProjects([...projects, newProject]);
      setSuccess(t("projects.success.created"));
      setOpenCreateDialog(false);
      setCreateForm({ name: "", slug: "" });
    } catch (err) {
      setError(extractErrorMessage(err, t("projects.load_error")));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!currentOrganizationId || !deleteProjectId) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteProject(currentOrganizationId, deleteProjectId);
      setProjects(projects.filter((p) => p.id !== deleteProjectId));
      setRepositories(repositories.filter((r) => r.project_id !== deleteProjectId));
      setSuccess(t("projects.success.deleted"));
      setDeleteProjectId(null);
    } catch (err) {
      setError(extractErrorMessage(err, t("projects.load_error")));
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenRules = async (project: Project) => {
    setRulesDialogProject(project);
    setRulesLoading(true);
    setRulesContent("");
    setError(null);
    try {
      if (currentOrganizationId) {
        const rules = await getProjectRules(currentOrganizationId, project.id);
        setRulesContent(rules.rules_markdown || "");
      }
    } catch (err) {
      setRulesContent("");
    } finally {
      setRulesLoading(false);
    }
  };

  const handleSaveRules = async () => {
    if (!currentOrganizationId || !rulesDialogProject) return;
    if (!rulesContent.trim()) {
      setError(t("rules.validation.project_empty"));
      return;
    }
    setRulesSaving(true);
    setError(null);
    try {
      await updateProjectRules(currentOrganizationId, rulesDialogProject.id, rulesContent);
      setSuccess(t("rules.success.project_saved"));
      setRulesDialogProject(null);
    } catch (err) {
      setError(extractErrorMessage(err, t("projects.rules_error")));
    } finally {
      setRulesSaving(false);
    }
  };

  const getRepoCount = (projectId: string) => 
    repositories.filter((r) => r.project_id === projectId).length;

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4">{t("projects.title")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t("projects.subtitle")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
        >
          {t("projects.create")}
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {projects.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <FolderIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              <Typography variant="h6">{t("projects.no_projects")}</Typography>
              <Button variant="contained" onClick={() => setOpenCreateDialog(true)}>
                {t("projects.create_first")}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("projects.name")}</TableCell>
                <TableCell>{t("projects.slug")}</TableCell>
                <TableCell>{t("projects.repositories")}</TableCell>
                <TableCell>{t("projects.created_at")}</TableCell>
                <TableCell align="right">{t("projects.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Typography fontWeight="medium">{project.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {project.slug}
                    </Typography>
                  </TableCell>
                  <TableCell>{getRepoCount(project.id)}</TableCell>
                  <TableCell>
                    {new Date(project.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title={t("projects.rules")}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenRules(project)}
                        >
                          <PolicyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("common.delete")}>
                        <IconButton
                          size="small"
                          onClick={() => setDeleteProjectId(project.id)}
                        >
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

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("projects.dialog_title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("projects.dialog_desc")}
          </Typography>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label={t("projects.dialog_name")}
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
            <TextField
              fullWidth
              label={t("projects.dialog_slug")}
              value={createForm.slug}
              onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
              helperText="Lowercase letters, numbers, and hyphens only"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>{t("common.cancel")}</Button>
          <Button 
            onClick={handleCreate} 
            variant="contained" 
            disabled={creating || !createForm.name || !createForm.slug}
          >
            {creating ? t("projects.dialog_creating") : t("projects.dialog_create")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteProjectId} onClose={() => setDeleteProjectId(null)}>
        <DialogTitle>{t("projects.delete_confirm_title")}</DialogTitle>
        <DialogContent>
          <Typography>{t("projects.delete_confirm_desc", { name: projects.find((p) => p.id === deleteProjectId)?.name })}</Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {t("projects.delete_confirm_warning")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteProjectId(null)}>{t("common.cancel")}</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleting}>
            {deleting ? t("common.delete") : t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={!!rulesDialogProject} 
        onClose={() => setRulesDialogProject(null)} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle>{t("projects.rules_dialog_title", { name: rulesDialogProject?.name })}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("projects.rules_dialog_desc")}
          </Typography>
          {rulesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TextField
              fullWidth
              multiline
              rows={12}
              value={rulesContent}
              onChange={(e) => setRulesContent(e.target.value)}
              placeholder={t("rules.project_placeholder")}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRulesDialogProject(null)}>{t("common.cancel")}</Button>
          <Button 
            onClick={handleSaveRules} 
            variant="contained" 
            disabled={rulesSaving || rulesLoading || !rulesContent.trim()}
          >
            {rulesSaving ? t("rules.saving") : t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectsPage;