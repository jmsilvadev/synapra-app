import React, { useCallback, useEffect, useState } from "react";
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
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { extractErrorMessage } from "../services/apiClient";
import { createSkill, deleteSkill, listSkills, updateSkill } from "../services/adminService";
import type { SkillDefinition } from "../types/admin";

const SkillsPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();

  const [skills, setSkills] = useState<SkillDefinition[]>([]);
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Edit dialog state
  const [editSkill, setEditSkill] = useState<SkillDefinition | null>(null);
  const [editName, setEditName] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete dialog state
  const [deleteSkillTarget, setDeleteSkillTarget] = useState<SkillDefinition | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadSkills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listSkills();
      setSkills(response);
    } catch (err) {
      setError(extractErrorMessage(err, t("skills.load_error", { defaultValue: "Failed to load skills" })));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!currentOrganizationId) {
      setLoading(false);
      return;
    }
    void loadSkills();
  }, [currentOrganizationId, loadSkills]);

  const handleCreateSkill = async () => {
    if (!name.trim()) {
      setError(t("skills.validation.name", { defaultValue: "Skill name is required" }));
      return;
    }
    if (!instructions.trim()) {
      setError(t("skills.validation.instructions", { defaultValue: "Instructions are required" }));
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await createSkill({
        name: name.trim(),
        instructions: instructions.trim(),
        scope: "org",
      });
      setName("");
      setInstructions("");
      setSuccess(t("skills.success.created", { defaultValue: "Skill created successfully" }));
      await loadSkills();
    } catch (err) {
      setError(extractErrorMessage(err, t("skills.create_error", { defaultValue: "Failed to create skill" })));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEdit = (skill: SkillDefinition) => {
    setEditSkill(skill);
    setEditName(skill.name);
    setEditInstructions(skill.instructions || skill.prompt_template || skill.description || "");
    setError(null);
    setSuccess(null);
  };

  const handleCloseEdit = () => {
    setEditSkill(null);
  };

  const handleSaveEdit = async () => {
    if (!editSkill) return;
    if (!editName.trim()) {
      setError(t("skills.validation.name", { defaultValue: "Skill name is required" }));
      return;
    }
    if (!editInstructions.trim()) {
      setError(t("skills.validation.instructions", { defaultValue: "Instructions are required" }));
      return;
    }
    setEditSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateSkill(editSkill.id, { name: editName.trim(), instructions: editInstructions.trim() });
      setSuccess(t("skills.success.updated", { defaultValue: "Skill updated successfully" }));
      setEditSkill(null);
      await loadSkills();
    } catch (err) {
      setError(extractErrorMessage(err, t("skills.update_error", { defaultValue: "Failed to update skill" })));
    } finally {
      setEditSaving(false);
    }
  };

  const handleOpenDelete = (skill: SkillDefinition) => {
    setDeleteSkillTarget(skill);
    setError(null);
    setSuccess(null);
  };

  const handleCloseDelete = () => {
    setDeleteSkillTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteSkillTarget) return;
    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteSkill(deleteSkillTarget.id);
      setSuccess(t("skills.success.deleted", { defaultValue: "Skill deleted successfully" }));
      setDeleteSkillTarget(null);
      await loadSkills();
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, t("skills.delete_error", { defaultValue: "Failed to delete skill" }));
      const isConflict = (err as { response?: { status?: number } })?.response?.status === 409;
      setError(isConflict
        ? t("skills.delete_error_used_by_command", { defaultValue: "This skill cannot be deleted because it is used by one or more commands. Delete the commands first." })
        : msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t("skills.title", { defaultValue: "Skills" })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("skills.subtitle", { defaultValue: "Create organization skills with a name and instructions." })}
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">{t("skills.create", { defaultValue: "Create Skill" })}</Typography>
              <TextField
                label={t("skills.form.name", { defaultValue: "Skill Name" })}
                value={name}
                onChange={(event) => setName(event.target.value)}
                fullWidth
              />
              <TextField
                label={t("skills.form.instructions", { defaultValue: "Instructions" })}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                multiline
                minRows={6}
                fullWidth
              />
              <Box>
                <Button variant="contained" onClick={handleCreateSkill} disabled={saving}>
                  {saving
                    ? t("skills.form.creating", { defaultValue: "Creating..." })
                    : t("skills.form.submit", { defaultValue: "Create Skill" })}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">{t("skills.list", { defaultValue: "Organization Skills" })}</Typography>
              <Button variant="outlined" onClick={() => void loadSkills()} disabled={loading}>
                {t("skills.refresh", { defaultValue: "Refresh" })}
              </Button>
            </Stack>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("skills.columns.name", { defaultValue: "Name" })}</TableCell>
                      <TableCell>{t("skills.columns.scope", { defaultValue: "Scope" })}</TableCell>
                      <TableCell>{t("skills.columns.instructions", { defaultValue: "Instructions" })}</TableCell>
                      <TableCell align="right">{t("skills.columns.actions", { defaultValue: "Actions" })}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell>{skill.name}</TableCell>
                        <TableCell>{skill.scope}</TableCell>
                        <TableCell sx={{ whiteSpace: "pre-wrap" }}>{skill.instructions || skill.prompt_template || skill.description}</TableCell>
                        <TableCell align="right">
                          <Tooltip title={t("skills.actions.edit", { defaultValue: "Edit" })}>
                            <IconButton size="small" onClick={() => handleOpenEdit(skill)} aria-label="edit skill">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("skills.actions.delete", { defaultValue: "Delete" })}>
                            <IconButton size="small" color="error" onClick={() => handleOpenDelete(skill)} aria-label="delete skill">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {skills.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                          {t("skills.empty", { defaultValue: "No skills found" })}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Edit Skill Dialog */}
      <Dialog open={!!editSkill} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>{t("skills.edit.title", { defaultValue: "Edit Skill" })}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t("skills.form.name", { defaultValue: "Skill Name" })}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
              autoFocus
            />
            <TextField
              label={t("skills.form.instructions", { defaultValue: "Instructions" })}
              value={editInstructions}
              onChange={(e) => setEditInstructions(e.target.value)}
              multiline
              minRows={6}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={editSaving}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={editSaving}>
            {editSaving
              ? t("skills.edit.saving", { defaultValue: "Saving..." })
              : t("skills.edit.save", { defaultValue: "Save" })}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Skill Confirmation Dialog */}
      <Dialog open={!!deleteSkillTarget} onClose={handleCloseDelete}>
        <DialogTitle>{t("skills.delete.title", { defaultValue: "Delete Skill" })}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("skills.delete.confirm", {
              defaultValue: `Are you sure you want to delete the skill "{{name}}"? This action cannot be undone.`,
              name: deleteSkillTarget?.name ?? "",
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={deleting}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting
              ? t("skills.delete.deleting", { defaultValue: "Deleting..." })
              : t("skills.delete.confirm_button", { defaultValue: "Delete" })}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SkillsPage;
