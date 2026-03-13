import React, { useEffect, useState } from "react";
import { Alert, Card, CardContent, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { getOrganizationRules, getOrganizationSettings, getWorkspaceRules } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { OrganizationRules, WorkspaceRules } from "../types/admin";

const RulesPoliciesPage: React.FC = () => {
  const { currentClientId } = useAuth();
  const [organizationRules, setOrganizationRules] = useState<OrganizationRules | null>(null);
  const [workspaceRules, setWorkspaceRules] = useState<WorkspaceRules | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!currentClientId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [orgRules, settings] = await Promise.all([
          getOrganizationRules(currentClientId).catch(() => ({ rules_markdown: "" })),
          getOrganizationSettings(currentClientId).catch(() => ({})),
        ]);
        setOrganizationRules(orgRules);
        if (settings.default_project_id && settings.default_namespace) {
          const wsRules = await getWorkspaceRules(
            currentClientId,
            settings.default_project_id,
            settings.default_namespace
          ).catch(() => null);
          setWorkspaceRules(wsRules);
        } else {
          setWorkspaceRules(null);
        }
      } catch (err) {
        setError(extractErrorMessage(err, "Falha ao carregar regras"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentClientId]);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>Regras & Políticas</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography variant="h6">Regras da organização</Typography>
              <Typography component="pre" sx={{ whiteSpace: "pre-wrap", mb: 0 }}>
                {organizationRules?.rules_markdown || "Nenhuma regra organizacional configurada."}
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6">Workspace padrão</Typography>
              <Typography component="pre" sx={{ whiteSpace: "pre-wrap", mb: 0 }}>
                {workspaceRules?.rules_markdown || "Defina default_project_id/default_namespace em Configurações para carregar regras de workspace."}
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Container>
  );
};

export default RulesPoliciesPage;
