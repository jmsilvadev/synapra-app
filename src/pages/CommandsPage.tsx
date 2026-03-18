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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
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
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { extractErrorMessage } from "../services/apiClient";
import { createCommand, deleteCommand, listCommands, listSkills } from "../services/adminService";
import type { CommandDefinition, SkillDefinition } from "../types/admin";

function normalizeTrigger(slug: string): string {
  const raw = slug.trim();
  if (!raw) return "";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

const CommandsPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();

  const [commands, setCommands] = useState<CommandDefinition[]>([]);
  const [skills, setSkills] = useState<SkillDefinition[]>([]);
  const [slug, setSlug] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Delete dialog state
  const [deleteCommandTarget, setDeleteCommandTarget] = useState<CommandDefinition | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cmds, sks] = await Promise.all([listCommands(), listSkills()]);
      setCommands(cmds);
      setSkills(sks);
    } catch (err) {
      setError(extractErrorMessage(err, t("commands.load_error", { defaultValue: "Failed to load commands" })));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!currentOrganizationId) {
      setLoading(false);
      return;
    }
    void loadData();
  }, [currentOrganizationId, loadData]);

  const handleCreateCommand = async () => {
    const trigger = normalizeTrigger(slug);
    if (!trigger) {
      setError(t("commands.validation.slug", { defaultValue: "Command slug is required" }));
      return;
    }
    if (!selectedSkillId) {
      setError(t("commands.validation.skill", { defaultValue: "A skill must be selected" }));
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await createCommand({ slug: trigger, skill_id: selectedSkillId });
      setSlug("");
      setSelectedSkillId("");
      setSuccess(t("commands.success.created", { defaultValue: "Command created successfully" }));
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err, t("commands.create_error", { defaultValue: "Failed to create command" })));
    } finally {
      setSaving(false);
    }
  };

  const getSkillName = (skillId: string) => {
    const sk = skills.find((s) => s.id === skillId);
    return sk ? sk.name : skillId;
  };

  const handleOpenDelete = (command: CommandDefinition) => {
    setDeleteCommandTarget(command);
    setError(null);
    setSuccess(null);
  };

  const handleCloseDelete = () => {
    setDeleteCommandTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCommandTarget) return;
    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteCommand(deleteCommandTarget.id);
      setSuccess(t("commands.success.deleted", { defaultValue: "Command deleted successfully" }));
      setDeleteCommandTarget(null);
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err, t("commands.delete_error", { defaultValue: "Failed to delete command" })));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {t("commands.title", { defaultValue: "Commands" })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("commands.subtitle", { defaultValue: "Route a command slug to a skill." })}
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">{t("commands.create", { defaultValue: "Create Command" })}</Typography>
              <TextField
                label={t("commands.form.slug", { defaultValue: "Command Slug" })}
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="ex: synapra_explain or /synapra_explain"
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel id="skill-select-label">
                  {t("commands.form.skill", { defaultValue: "Skill" })}
                </InputLabel>
                <Select
                  labelId="skill-select-label"
                  value={selectedSkillId}
                  label={t("commands.form.skill", { defaultValue: "Skill" })}
                  onChange={(event) => setSelectedSkillId(event.target.value)}
                >
                  {skills.map((sk) => (
                    <MenuItem key={sk.id} value={sk.id}>
                      {sk.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box>
                <Button variant="contained" onClick={handleCreateCommand} disabled={saving}>
                  {saving
                    ? t("commands.form.creating", { defaultValue: "Creating..." })
                    : t("commands.form.submit", { defaultValue: "Create Command" })}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">{t("commands.list", { defaultValue: "Organization Commands" })}</Typography>
              <Button variant="outlined" onClick={() => void loadData()} disabled={loading}>
                {t("commands.refresh", { defaultValue: "Refresh" })}
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
                      <TableCell>{t("commands.columns.trigger", { defaultValue: "Trigger" })}</TableCell>
                      <TableCell>{t("commands.columns.skill", { defaultValue: "Skill" })}</TableCell>
                      <TableCell align="right">{t("commands.columns.actions", { defaultValue: "Actions" })}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {commands.map((command) => (
                      <TableRow key={command.id}>
                        <TableCell>{command.trigger}</TableCell>
                        <TableCell>{getSkillName(command.skill_id)}</TableCell>
                        <TableCell align="right">
                          <Tooltip title={t("commands.actions.delete", { defaultValue: "Delete" })}>
                            <IconButton size="small" color="error" onClick={() => handleOpenDelete(command)} aria-label="delete command">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {commands.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                          {t("commands.empty", { defaultValue: "No commands found" })}
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

      {/* Delete Command Confirmation Dialog */}
      <Dialog open={!!deleteCommandTarget} onClose={handleCloseDelete}>
        <DialogTitle>{t("commands.delete.title", { defaultValue: "Delete Command" })}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("commands.delete.confirm", {
              defaultValue: `Are you sure you want to delete the command "{{trigger}}"? This action cannot be undone.`,
              trigger: deleteCommandTarget?.trigger ?? "",
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={deleting}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting
              ? t("commands.delete.deleting", { defaultValue: "Deleting..." })
              : t("commands.delete.confirm_button", { defaultValue: "Delete" })}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CommandsPage;
