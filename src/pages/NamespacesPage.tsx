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
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Storage as NamespaceIcon,
  Policy as PolicyIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { extractErrorMessage } from "../services/apiClient";
import { getNamespaces, createNamespace, deleteNamespace, getProjects, getNamespaceRules, updateNamespaceRules } from "../services/adminService";
import type { Namespace, Project } from "../types/admin";

const NamespacesPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", projectId: "" });
  const [creating, setCreating] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [deleteNamespaceId, setDeleteNamespaceId] = useState<string | null>(null);
  const [deleteNamespaceName, setDeleteNamespaceName] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  const [rulesDialogNamespace, setRulesDialogNamespace] = useState<Namespace | null>(null);
  const [rulesContent, setRulesContent] = useState("");
  const [rulesLoading, setRulesLoading] = useState(false);
  const [rulesSaving, setRulesSaving] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      if (!currentOrganizationId) return;
      try {
        const projectsData = await getProjects(currentOrganizationId);
        setProjects(projectsData);
        if (projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].id);
        }
      } catch (err) {
        setError(extractErrorMessage(err, t("namespaces.load_error")));
      }
    };
    void loadProjects();
  }, [currentOrganizationId, t]);

  useEffect(() => {
    const loadNamespaces = async () => {
      if (!currentOrganizationId || !selectedProjectId) {
        setLoading(false);
        return;
      }
      try {
        const namespacesData = await getNamespaces(currentOrganizationId, selectedProjectId);
        setNamespaces(namespacesData);
      } catch (err) {
        setError(extractErrorMessage(err, t("namespaces.load_error")));
      } finally {
        setLoading(false);
      }
    };
    void loadNamespaces();
  }, [currentOrganizationId, selectedProjectId, t]);

  const handleCreate = async () => {
    if (!currentOrganizationId || !createForm.name || !createForm.projectId) return;
    setCreating(true);
    setError(null);
    try {
      const newNamespace = await createNamespace(currentOrganizationId, {
        name: createForm.name,
        project_id: createForm.projectId,
      });
      setNamespaces([...namespaces, newNamespace]);
      setSuccess(t("namespaces.success.created"));
      setOpenCreateDialog(false);
      setCreateForm({ name: "", projectId: "" });
    } catch (err) {
      setError(extractErrorMessage(err, t("namespaces.load_error")));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!currentOrganizationId || !deleteNamespaceId) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteNamespace(currentOrganizationId, deleteNamespaceId);
      setNamespaces(namespaces.filter((n) => n.id !== deleteNamespaceId));
      setSuccess(t("namespaces.success.deleted"));
      setDeleteNamespaceId(null);
      setDeleteNamespaceName("");
    } catch (err) {
      setError(extractErrorMessage(err, t("namespaces.load_error")));
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenRules = async (namespace: Namespace) => {
    setRulesDialogNamespace(namespace);
    setRulesLoading(true);
    setRulesContent("");
    setError(null);
    try {
      if (currentOrganizationId) {
        const rules = await getNamespaceRules(currentOrganizationId, namespace.id);
        setRulesContent(rules.rules_markdown || "");
      }
    } catch (err) {
      setRulesContent("");
    } finally {
      setRulesLoading(false);
    }
  };

  const handleSaveRules = async () => {
    if (!currentOrganizationId || !rulesDialogNamespace) return;
    if (!rulesContent.trim()) {
      setError(t("rules.validation.namespace_empty"));
      return;
    }
    setRulesSaving(true);
    setError(null);
    try {
      await updateNamespaceRules(currentOrganizationId, rulesDialogNamespace.id, rulesContent);
      setSuccess(t("rules.success.namespace_saved"));
      setRulesDialogNamespace(null);
    } catch (err) {
      setError(extractErrorMessage(err, t("namespaces.rules_error")));
    } finally {
      setRulesSaving(false);
    }
  };

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
          <Typography variant="h4">{t("namespaces.title")}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t("namespaces.subtitle")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setCreateForm({ name: "", projectId: selectedProjectId });
            setOpenCreateDialog(true);
          }}
          disabled={projects.length === 0}
        >
          {t("namespaces.create")}
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>{success}</Alert>}

      {projects.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
              <NamespaceIcon sx={{ fontSize: 48, color: "text.secondary" }} />
              <Typography variant="h6">{t("namespaces.no_projects")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t("namespaces.create_project_first")}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <TextField
              select
              label={t("namespaces.select_project")}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {namespaces.length === 0 ? (
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2} alignItems="center" sx={{ py: 4 }}>
                  <NamespaceIcon sx={{ fontSize: 48, color: "text.secondary" }} />
                  <Typography variant="h6">{t("namespaces.no_namespaces")}</Typography>
                  <Button variant="contained" onClick={() => {
                    setCreateForm({ name: "", projectId: selectedProjectId });
                    setOpenCreateDialog(true);
                  }}>
                    {t("namespaces.create_first")}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("namespaces.name")}</TableCell>
                    <TableCell>{t("namespaces.project")}</TableCell>
                    <TableCell>{t("namespaces.created_at")}</TableCell>
                    <TableCell align="right">{t("namespaces.actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {namespaces.map((namespace) => (
                    <TableRow key={namespace.id}>
                      <TableCell>
                        <Typography fontWeight="medium">{namespace.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {projects.find((p) => p.id === namespace.project_id)?.name || namespace.project_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(namespace.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title={t("namespaces.rules")}>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenRules(namespace)}
                            >
                              <PolicyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("common.delete")}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setDeleteNamespaceId(namespace.id);
                                setDeleteNamespaceName(namespace.name);
                              }}
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
        </>
      )}

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("namespaces.dialog_title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("namespaces.dialog_desc")}
          </Typography>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              label={t("namespaces.dialog_project")}
              value={createForm.projectId}
              onChange={(e) => setCreateForm({ ...createForm, projectId: e.target.value })}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label={t("namespaces.dialog_name")}
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>{t("common.cancel")}</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={creating || !createForm.name || !createForm.projectId}
          >
            {creating ? t("namespaces.dialog_creating") : t("namespaces.dialog_create")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteNamespaceId} onClose={() => setDeleteNamespaceId(null)}>
        <DialogTitle>{t("namespaces.delete_confirm_title")}</DialogTitle>
        <DialogContent>
          <Typography>{t("namespaces.delete_confirm_desc", { name: deleteNamespaceName })}</Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {t("namespaces.delete_confirm_warning")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteNamespaceId(null)}>{t("common.cancel")}</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ color: "common.white" }} disabled={deleting}>
            {deleting ? t("common.delete") : t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={!!rulesDialogNamespace} 
        onClose={() => setRulesDialogNamespace(null)} 
        fullWidth 
        maxWidth="md"
      >
        <DialogTitle>{t("namespaces.rules_dialog_title", { name: rulesDialogNamespace?.name })}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("namespaces.rules_dialog_desc")}
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
              placeholder={t("rules.namespace_placeholder")}
              sx={{ mt: 1 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRulesDialogNamespace(null)}>{t("common.cancel")}</Button>
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

export default NamespacesPage;