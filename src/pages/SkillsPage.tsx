import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { extractErrorMessage } from "../services/apiClient";
import { createSkill, listSkills } from "../services/adminService";
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skills.map((skill) => (
                      <TableRow key={skill.id}>
                        <TableCell>{skill.name}</TableCell>
                        <TableCell>{skill.scope}</TableCell>
                        <TableCell sx={{ whiteSpace: "pre-wrap" }}>{skill.instructions || skill.prompt_template || skill.description}</TableCell>
                      </TableRow>
                    ))}
                    {skills.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
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
    </Container>
  );
};

export default SkillsPage;
