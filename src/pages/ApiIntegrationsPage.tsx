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

type DeleteDialogState = {
  keyId: string;
  keyLabel: string;
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
    'TMP_SCRIPT="$(mktemp)"',
    `cat > "$TMP_SCRIPT" <<'SYNAPRA_BOOTSTRAP'`,
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    '',
    'mkdir -p "$HOME/.synapra"',
    `printf "%s\\n" ${shellQuote(input.apiKeySecret)} > "$HOME/.synapra/api_key"`,
    'chmod 600 "$HOME/.synapra/api_key"',
    '',
    'TMP_JSON="$(mktemp)"',
    'trap \'rm -f "$TMP_JSON"\' EXIT',
    `curl -s -X POST ${shellQuote(`${input.apiURL}/v1/bootstrap/render`)} \\`,
    '  -H "Content-Type: application/json" \\',
    '  -H "X-API-Key: $(cat "$HOME/.synapra/api_key")" \\',
    `  -d ${shellQuote(payload)} > "$TMP_JSON"`,
    '',
    `jq -r '.files[] | select(.file_name=="SYNAPRA.md") | .content' "$TMP_JSON" > SYNAPRA.md`,
    `BOOTSTRAP_BLOCK="$(jq -r '.files[] | select(.file_name=="AGENTS.md") | .content' "$TMP_JSON")"`,
    'if [ -f AGENTS.md ]; then',
    `  awk 'BEGIN { skipping = 1 } skipping { if ($0 == "<!-- synapra:bootstrap:v1 -->" || $0 == "<!-- /synapra:bootstrap:v1 -->" || $0 == "# Synapra Bootstrap" || $0 == "Read \`SYNAPRA.md\` before using local files as the main source of project discovery." || $0 == "Treat \`SYNAPRA.md\` as mandatory workspace context injected by the Synapra backend." || $0 == "If this file already contains repository-specific instructions below this block, follow them together with \`SYNAPRA.md\`." || $0 == "Before your final response, if you produced durable knowledge or code changes, you must execute \`POST /v1/knowledge/sync\`." || $0 == "") next; skipping = 0 } { print }' AGENTS.md > AGENTS.md.clean`,
    'else',
    '  : > AGENTS.md.clean',
    'fi',
    `printf "%s\n" "$BOOTSTRAP_BLOCK" | cat - AGENTS.md.clean > AGENTS.md.tmp`,
    'mv AGENTS.md.tmp AGENTS.md',
    'rm -f AGENTS.md.clean',
    'SYNAPRA_BOOTSTRAP',
    'bash "$TMP_SCRIPT"',
    'rm -f "$TMP_SCRIPT"',
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
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState | null>(null);
  const [bootstrapProjectId, setBootstrapProjectId] = useState("");
  const [bootstrapNamespace, setBootstrapNamespace] = useState("workspace");
  const [organizationSettings, setOrganizationSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [creatingBootstrapKey, setCreatingBootstrapKey] = useState(false);
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null);
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
      setSuccess(t("api.success.created"));
      await loadKeys();
    } catch (err) {
      setError(extractErrorMessage(err, t("api.generate")));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (keyId: string) => {
    if (!currentOrganizationId) {
      return;
    }
    setDeletingKeyId(keyId);
    setError(null);
    setSuccess(null);
    try {
      await revokeClientApiKey(currentOrganizationId, keyId);
      setKnownSecrets((current) => {
        const next = { ...current };
        delete next[keyId];
        return next;
      });
      setKeys((current) => current.filter((key) => key.id !== keyId));
      setSuccess(t("api.success.deleted"));
    } catch (err) {
      setError(extractErrorMessage(err, t("common.delete")));
    } finally {
      setDeletingKeyId(null);
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

    setBootstrapDialog({
      sourceKeyId: key.id,
      keyId: key.id,
      keyLabel: key.label,
      apiKeySecret: "",
    });
    setOpenBootstrap(true);
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
                    onClick={() => setDeleteDialog({ keyId: key.id, keyLabel: key.label })}
                    disabled={Boolean(key.revoked_at) || deletingKeyId === key.id}
                  >
                    {deletingKeyId === key.id ? t("api.deleting") : t("common.delete")}
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

      <Dialog open={Boolean(deleteDialog)} onClose={() => setDeleteDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t("api.delete_confirm_title")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography color="text.secondary">
              {t("api.delete_confirm_desc", { label: deleteDialog?.keyLabel || "" })}
            </Typography>
            <Alert severity="warning">{t("api.delete_confirm_warning")}</Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>{t("common.cancel")}</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (!deleteDialog) {
                return;
              }
              void handleDelete(deleteDialog.keyId);
              setDeleteDialog(null);
            }}
            disabled={!deleteDialog || deletingKeyId === deleteDialog.keyId}
          >
            {deleteDialog && deletingKeyId === deleteDialog.keyId ? t("api.deleting") : t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApiIntegrationsPage;
