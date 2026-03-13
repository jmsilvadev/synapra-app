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
  revokeClientApiKey,
} from "../services/adminService";
import { useI18n } from "../i18n";
import { extractErrorMessage } from "../services/apiClient";
import type { ApiKey, ApiKeyCreateResponse } from "../types/admin";

const ApiIntegrationsPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [createdKey, setCreatedKey] = useState<ApiKeyCreateResponse | null>(null);
  const [label, setLabel] = useState("agent");
  const [openCreate, setOpenCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadKeys = async () => {
    if (!currentOrganizationId) {
      setKeys([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setKeys(await getClientApiKeys(currentOrganizationId));
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
      setCreatedKey(key);
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

  const handleCopySecret = async () => {
    if (!createdKey?.secret) {
      return;
    }
    try {
      await navigator.clipboard.writeText(createdKey.secret);
      setSuccess(t("api.success.copied"));
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

      {createdKey && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6">{t("api.new_key_title")}</Typography>
              <Typography color="text.secondary">
                {t("api.new_key_desc")}
              </Typography>
              <TextField
                fullWidth
                value={createdKey.secret}
                InputProps={{ readOnly: true }}
              />
            </Stack>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button variant="outlined" onClick={handleCopySecret}>
              {t("api.copy_secret")}
            </Button>
            <Button onClick={() => setCreatedKey(null)}>
              {t("common.close")}
            </Button>
          </CardActions>
        </Card>
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
    </Container>
  );
};

export default ApiIntegrationsPage;
