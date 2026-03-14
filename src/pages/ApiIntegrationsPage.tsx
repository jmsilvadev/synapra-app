import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import {
  createClientApiKey,
  getClientApiKeys,
  getOrganizationSettings,
  revokeClientApiKey,
} from "../services/adminService";
import { useI18n } from "../i18n";
import { apiBaseURL, extractErrorMessage } from "../services/apiClient";
import type { ApiKey, OrganizationSettings } from "../types/admin";

type BootstrapDialogState = {
  sourceKeyId: string;
  keyId: string;
  keyLabel: string;
  apiKeySecret: string;
};

function shellQuote(value: string) {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

function buildBootstrapCommand(input: {
  apiURL: string;
  apiKeySecret: string;
  projectId: string;
  namespace: string;
}) {
  const payload = JSON.stringify({
    project_id: input.projectId,
    namespace: input.namespace,
    adapter: "agents",
  });

  return [
    'TMP_JSON="$(mktemp)"',
    `curl -s -X POST ${shellQuote(`${input.apiURL}/v1/bootstrap/render`)} \\`,
    '  -H "Content-Type: application/json" \\',
    `  -H "X-API-Key: ${input.apiKeySecret}" \\`,
    `  -d ${shellQuote(payload)} > "$TMP_JSON"`,
    '',
    `jq -r '.files[] | select(.file_name=="SYNAPRA.md") | .content' "$TMP_JSON" > SYNAPRA.md`,
    `BOOTSTRAP_BLOCK="$(jq -r '.files[] | select(.file_name=="AGENTS.md") | .content' "$TMP_JSON")"`,
    `printf "%s\n" "$BOOTSTRAP_BLOCK" | cat - AGENTS.md 2>/dev/null > AGENTS.md.tmp`,
    'mv AGENTS.md.tmp AGENTS.md',
    'rm -f "$TMP_JSON"',
  ].join("\n");
}

const ApiIntegrationsPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [knownSecrets, setKnownSecrets] = useState<Record<string, string>>({});
  const [label, setLabel] = useState("agent");
  const [openCreate, setOpenCreate] = useState(false);
  const [openBootstrap, setOpenBootstrap] = useState(false);
  const [bootstrapDialog, setBootstrapDialog] = useState<BootstrapDialogState | null>(null);
  const [bootstrapProjectId, setBootstrapProjectId] = useState("");
  const [bootstrapNamespace, setBootstrapNamespace] = useState("workspace");
  const [organizationSettings, setOrganizationSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [creatingBootstrapKey, setCreatingBootstrapKey] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadKeys = async () => {
    if (!currentOrganizationId) {
      setKeys([]);
      setOrganizationSettings(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [apiKeys, settings] = await Promise.all([
        getClientApiKeys(currentOrganizationId),
        getOrganizationSettings(currentOrganizationId).catch(() => null),
      ]);
      setKeys(apiKeys);
      setOrganizationSettings(settings);
    } catch (err) {
      setError(extractErrorMessage(err, t("api.load_error")));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadKeys();
  }, [currentOrganizationId]);

  const handleCreate = async () => {
    if (!currentOrganizationId || !label.trim()) {
      setError(t("api.validation.label"));
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const key = await createClientApiKey(currentOrganizationId, label.trim());
      setKnownSecrets((current) => ({ ...current, [key.id]: key.secret }));
      setOpenCreate(false);
      setLabel("agent");
      setBootstrapProjectId(organizationSettings?.default_project_id || "");
      setBootstrapNamespace(organizationSettings?.default_namespace || "workspace");
      setBootstrapDialog({
        sourceKeyId: key.id,
        keyId: key.id,
        keyLabel: key.label,
        apiKeySecret: key.secret,
      });
      setOpenBootstrap(true);
      setSuccess(t("api.bootstrap_key_created"));
      await loadKeys();
    } catch (err) {
      setError(extractErrorMessage(err, t("api.generate")));
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!currentOrganizationId) {
      return;
    }
    setRevokingKeyId(keyId);
    setError(null);
    setSuccess(null);
    try {
      await revokeClientApiKey(currentOrganizationId, keyId);
      setSuccess(t("api.success.revoked"));
      await loadKeys();
    } catch (err) {
      setError(extractErrorMessage(err, t("api.revoke")));
    } finally {
      setRevokingKeyId(null);
    }
  };

  const handleOpenBootstrap = async (key: ApiKey) => {
    setBootstrapProjectId(organizationSettings?.default_project_id || "");
    setBootstrapNamespace(organizationSettings?.default_namespace || "workspace");
    setError(null);
    setSuccess(null);

    const apiKeySecret = knownSecrets[key.id];
    if (apiKeySecret) {
      setBootstrapDialog({
        sourceKeyId: key.id,
        keyId: key.id,
        keyLabel: key.label,
        apiKeySecret,
      });
      setOpenBootstrap(true);
      return;
    }

    if (!currentOrganizationId) {
      return;
    }

    setCreatingBootstrapKey(true);
    try {
      const bootstrapKey = await createClientApiKey(currentOrganizationId, `${key.label}-bootstrap`);
      setKnownSecrets((current) => ({ ...current, [bootstrapKey.id]: bootstrapKey.secret }));
      setBootstrapDialog({
        sourceKeyId: key.id,
        keyId: bootstrapKey.id,
        keyLabel: bootstrapKey.label,
        apiKeySecret: bootstrapKey.secret,
      });
      setSuccess(t("api.bootstrap_key_created"));
      setOpenBootstrap(true);
      await loadKeys();
    } catch (err) {
      setError(extractErrorMessage(err, t("api.generate")));
    } finally {
      setCreatingBootstrapKey(false);
    }
  };

  const handleCopyBootstrapCommand = async () => {
    if (!bootstrapDialog || !bootstrapDialog.apiKeySecret || !bootstrapProjectId.trim() || !bootstrapNamespace.trim()) {
      setError(t("api.bootstrap_validation"));
      return;
    }
    try {
      await navigator.clipboard.writeText(
        buildBootstrapCommand({
          apiURL: apiBaseURL,
          apiKeySecret: bootstrapDialog.apiKeySecret,
          projectId: bootstrapProjectId.trim(),
          namespace: bootstrapNamespace.trim(),
        })
      );
      setSuccess(t("api.bootstrap_copied"));
    } catch {
      setError(t("api.error.copy"));
    }
  };



  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2 }}>
        <div>
          <Typography variant="h4">API</Typography>
          <Typography color="text.secondary">
            {t("api.subtitle")}
          </Typography>
        </div>
        <Button variant="contained" onClick={() => setOpenCreate(true)} disabled={!currentOrganizationId}>
          {t("api.generate")}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}


      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6">{t("api.how_to_use")}</Typography>
            <Typography color="text.secondary">
              {t("api.how_to_use_desc")}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <CircularProgress />
      ) : !currentOrganizationId ? (
        <Alert severity="info">{t("api.no_client")}</Alert>
      ) : (
        <Stack spacing={2}>
          {keys.length === 0 ? (
            <Card>
              <CardContent>
                <Typography variant="h6">{t("api.empty_title")}</Typography>
                <Typography color="text.secondary">
                  {t("api.empty_desc")}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            keys.map((key) => (
              <Card key={key.id}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6">{key.label}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("api.preview")}: {key.preview || t("api.no_preview")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("api.created_at")}: {key.created_at || "-"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("api.status")}: {key.revoked_at ? t("api.revoked_at", { date: key.revoked_at }) : t("api.active")}
                    </Typography>
                  </Stack>
                </CardContent>
                <Divider />
                <CardActions sx={{ px: 2, py: 1.5 }}>
                  <Button onClick={() => void handleOpenBootstrap(key)} disabled={creatingBootstrapKey || Boolean(key.revoked_at)}>
                    {t("api.bootstrap_button")}
                  </Button>
                  <Button
                    color="error"
                    onClick={() => void handleRevoke(key.id)}
                    disabled={Boolean(key.revoked_at) || revokingKeyId === key.id}
                  >
                    {revokingKeyId === key.id ? t("api.revoking") : t("api.revoke")}
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
        </Stack>
      )}

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("api.dialog_title")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography color="text.secondary">
              {t("api.dialog_desc")}
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label={t("api.dialog_label")}
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder={t("api.dialog_placeholder")}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>
            {creating ? t("api.dialog_generating") : t("api.dialog_generate")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openBootstrap} onClose={() => setOpenBootstrap(false)} fullWidth maxWidth="md">
        <DialogTitle>{t("api.bootstrap_title")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography color="text.secondary">
              {t("api.bootstrap_desc")}
            </Typography>
            <Alert severity="warning">{t("api.bootstrap_secret_warning")}</Alert>
            <TextField
              fullWidth
              label={t("api.bootstrap_key_label")}
              value={bootstrapDialog?.keyLabel || ""}
              InputProps={{ readOnly: true }}
            />
            <TextField
              fullWidth
              label={t("api.bootstrap_project_id")}
              value={bootstrapProjectId}
              onChange={(event) => setBootstrapProjectId(event.target.value)}
            />
            <TextField
              fullWidth
              label={t("api.bootstrap_namespace")}
              value={bootstrapNamespace}
              onChange={(event) => setBootstrapNamespace(event.target.value)}
            />
            <TextField
              fullWidth
              multiline
              minRows={12}
              label={t("api.bootstrap_command")}
              value={
                bootstrapDialog
                  ? buildBootstrapCommand({
                      apiURL: apiBaseURL,
                      apiKeySecret: bootstrapDialog.apiKeySecret,
                      projectId: bootstrapProjectId.trim() || "<PROJECT_ID>",
                      namespace: bootstrapNamespace.trim() || "workspace",
                    })
                  : ""
              }
              InputProps={{ readOnly: true }}
            />
            <Typography variant="body2" color="text.secondary">
              {t("api.bootstrap_requires_jq")}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBootstrap(false)}>{t("common.close")}</Button>
          <Button onClick={() => void handleCopyBootstrapCommand()} variant="contained">
            {t("api.bootstrap_copy")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApiIntegrationsPage;
