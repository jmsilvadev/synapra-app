import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DevicesIcon from "@mui/icons-material/Devices";
import KeyIcon from "@mui/icons-material/Key";
import { useAuth } from "../context/AuthContext";
import {
  getClientApiKeys,
  getDeviceRegistrations,
  getOrganizationSettings,
  revokeClientApiKey,
} from "../services/adminService";
import { useI18n } from "../i18n";
import { extractErrorMessage } from "../services/apiClient";
import type { ApiKey, OrganizationSettings } from "../types/admin";

type DeleteDialogState = {
  keyId: string;
  keyLabel: string;
};

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleString();
}

const ApiIntegrationsPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [openDevices, setOpenDevices] = useState(false);
  const [devices, setDevices] = useState<ApiKey[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState | null>(null);
  const [organizationSettings, setOrganizationSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleDelete = async (keyId: string) => {
    if (!currentOrganizationId) {
      return;
    }
    setDeletingKeyId(keyId);
    setError(null);
    setSuccess(null);
    try {
      await revokeClientApiKey(currentOrganizationId, keyId);
      setKeys((current) => current.filter((key) => key.id !== keyId));
      setSuccess(t("api.success.deleted"));
    } catch (err) {
      setError(extractErrorMessage(err, t("common.delete")));
    } finally {
      setDeletingKeyId(null);
    }
  };

  const handleOpenDevices = async (key: ApiKey) => {
    setDevicesLoading(true);
    setOpenDevices(true);
    setDevices([]);
    if (!currentOrganizationId || !key.user_id) {
      setDevicesLoading(false);
      return;
    }
    try {
      const data = await getDeviceRegistrations(currentOrganizationId);
      setDevices(data.filter((d) => d.user_id === key.user_id));
    } catch {
      setDevices([]);
    } finally {
      setDevicesLoading(false);
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


      <Card sx={{ mb: 3, backgroundColor: "info.lighter" }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6">How to Generate API Keys</Typography>
            <Typography color="text.secondary">
              API keys are generated on your machine when you run the <Typography component="code" sx={{ fontFamily: "monospace", backgroundColor: "action.hover", px: 1, py: 0.5 }}>elastra auth login</Typography> command in your terminal. This page displays all your active API keys and allows you to manage their access.
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
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <KeyIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                <Typography variant="h6" gutterBottom>No API Keys yet</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Generate your first API key by running <Typography component="code" sx={{ fontFamily: "monospace", backgroundColor: "action.hover", px: 1, py: 0.5 }}>elastra auth login</Typography> on your machine.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            keys.map((key) => (
              <Card key={key.id} variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <KeyIcon color="primary" />
                        <Typography variant="h6">{key.label}</Typography>
                        <Chip 
                          size="small" 
                          icon={key.revoked_at ? <CancelIcon /> : <CheckCircleIcon />}
                          label={key.revoked_at ? t("api.revoked_at", { date: key.revoked_at }) : t("api.active")}
                          color={key.revoked_at ? "error" : "success"}
                          variant="outlined"
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {t("api.preview")}: <Chip size="small" label={key.preview || "-"} variant="outlined" />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("api.created_at")}: {key.created_at || "-"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Devices">
                        <IconButton
                          onClick={() => void handleOpenDevices(key)}
                          disabled={!key.user_id}
                        >
                          <DevicesIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("common.delete")}>
                        <IconButton 
                          color="error"
                          onClick={() => setDeleteDialog({ keyId: key.id, keyLabel: key.label })}
                          disabled={Boolean(key.revoked_at) || deletingKeyId === key.id}
                        >
                          {deletingKeyId === key.id ? <CircularProgress size={24} /> : <DeleteOutlineIcon color="error" />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}

      <Dialog open={openDevices} onClose={() => setOpenDevices(false)} fullWidth maxWidth="md">
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <DevicesIcon color="primary" />
            <Typography variant="h6">Devices</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {devicesLoading ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress />
            </Stack>
          ) : devices.length === 0 ? (
            <Alert severity="info">No device registrations found.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Device</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Last Used At</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {devices.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.user_email || d.user_id || "-"}</TableCell>
                      <TableCell>{d.device_info || "-"}</TableCell>
                      <TableCell>{formatDate(d.created_at)}</TableCell>
                      <TableCell>{formatDate(d.last_used_at)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          icon={d.revoked_at ? <CancelIcon /> : <CheckCircleIcon />}
                          label={d.revoked_at ? "Revoked" : "Active"}
                          color={d.revoked_at ? "error" : "success"}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDevices(false)}>{t("common.close")}</Button>
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
            sx={{ color: "common.white" }}
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
