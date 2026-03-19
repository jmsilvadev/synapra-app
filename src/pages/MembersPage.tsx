import React, { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Devices as DevicesIcon,
  Email as EmailIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Mail as MailIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import {
  createInvitation,
  getOrganizationSettings,
  listInvitations,
  listUsers,
  resendInvitation,
  updateOrganizationSettings,
  updateUserRole,
} from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { Invitation, OrganizationSettings, User } from "../types/admin";

function formatDate(locale: string, value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function roleLabel(role: string): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "user":
      return "User";
    case "owner":
      return "Owner";
    default:
      return role || "Viewer";
  }
}

function getRoleColor(role: string): "success" | "warning" | "default" | "error" {
  switch (role) {
    case "admin":
      return "success";
    case "owner":
      return "error";
    default:
      return "default";
  }
}

type DeviceLimitDrafts = Record<string, string>;

const MembersPage: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const { locale } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [organizationSettings, setOrganizationSettings] = useState<OrganizationSettings | null>(null);
  const [defaultDevicesInput, setDefaultDevicesInput] = useState("1");
  const [deviceLimitDrafts, setDeviceLimitDrafts] = useState<DeviceLimitDrafts>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDefaultDevices, setSavingDefaultDevices] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deviceModalUser, setDeviceModalUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ email: "", role: "user" });

  const isAdmin = user?.role === "admin" || user?.role === "owner";

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      try {
        const [usersData, invitationsData, settingsData] = await Promise.all([
          listUsers(currentOrganizationId).catch(() => []),
          listInvitations(currentOrganizationId).catch(() => []),
          getOrganizationSettings(currentOrganizationId).catch(() => null),
        ]);
        setUsers(usersData);
        setInvitations(invitationsData);
        const resolvedSettings = settingsData || {
          organization_id: currentOrganizationId,
          default_max_devices_per_user: 1,
        };
        setOrganizationSettings(resolvedSettings);
        setDefaultDevicesInput(String(resolvedSettings.default_max_devices_per_user || 1));
        setDeviceLimitDrafts(
          usersData.reduce<DeviceLimitDrafts>((acc, item) => {
            acc[item.id] = item.max_devices_override ? String(item.max_devices_override) : "";
            return acc;
          }, {})
        );
      } catch (err) {
        setError(extractErrorMessage(err, "Failed to load members"));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [currentOrganizationId]);

  const handleInvite = async () => {
    if (!currentOrganizationId || !formData.email) {
      setError("Email is required");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const newInvitation = await createInvitation(currentOrganizationId, {
        email: formData.email,
        role: formData.role,
      });
      setInvitations((prev) => [newInvitation, ...prev]);
      setFormData({ email: "", role: "user" });
      setOpenDialog(false);
      setSuccess(`Invitation sent to ${formData.email}`);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to send invitation"));
    } finally {
      setSaving(false);
    }
  };

  const handleResendInvitation = async (invitationId: string, email: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedInvitation = await resendInvitation(invitationId);
      setInvitations((prev) => prev.map((inv) => (inv.id === invitationId ? updatedInvitation : inv)));
      setSuccess(`Invitation resent to ${email}`);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to resend invitation"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUserActive = async (targetUser: User, nextActive: boolean) => {
    if (!currentOrganizationId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateUserRole(currentOrganizationId, targetUser.id, {
        role: targetUser.role || "user",
        active: nextActive,
      });
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, ...updated } : u)));
      setDeviceLimitDrafts((prev) => ({
        ...prev,
        [targetUser.id]: updated.max_devices_override ? String(updated.max_devices_override) : "",
      }));
      setSuccess(`${targetUser.email} ${nextActive ? "activated" : "deactivated"}`);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to update member status"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDefaultDevices = async () => {
    if (!currentOrganizationId || !organizationSettings) return;
    const parsed = Number(defaultDevicesInput);
    if (!Number.isInteger(parsed) || parsed < 1) {
      setError("Default device limit must be a whole number greater than 0.");
      return;
    }
    setSavingDefaultDevices(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateOrganizationSettings(currentOrganizationId, {
        ...organizationSettings,
        default_max_devices_per_user: parsed,
      });
      setOrganizationSettings(updated);
      setDefaultDevicesInput(String(updated.default_max_devices_per_user || parsed));
      setUsers((prev) =>
        prev.map((member) =>
          member.max_devices_override
            ? member
            : { ...member, effective_max_devices: updated.default_max_devices_per_user || parsed }
        )
      );
      setSuccess("Default device limit updated.");
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to update default device limit"));
    } finally {
      setSavingDefaultDevices(false);
    }
  };

  const handleSaveUserDeviceLimit = async (targetUser: User) => {
    if (!currentOrganizationId) return false;
    const draft = (deviceLimitDrafts[targetUser.id] || "").trim();
    let payload: { role: string; active: boolean; max_devices_override?: number | null; update_max_devices_override?: boolean } = {
      role: targetUser.role || "user",
      active: !!targetUser.active,
      update_max_devices_override: true,
    };

    if (draft === "") {
      payload = { ...payload, max_devices_override: null };
    } else {
      const parsed = Number(draft);
      if (!Number.isInteger(parsed) || parsed < 1) {
        setError("User device limit must be blank or a whole number greater than 0.");
        return false;
      }
      payload = { ...payload, max_devices_override: parsed };
    }

    setSavingUserId(targetUser.id);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateUserRole(currentOrganizationId, targetUser.id, payload);
      setUsers((prev) => prev.map((u) => (u.id === targetUser.id ? { ...u, ...updated } : u)));
      setDeviceLimitDrafts((prev) => ({
        ...prev,
        [targetUser.id]: updated.max_devices_override ? String(updated.max_devices_override) : "",
      }));
      setDeviceModalUser((current) => (current?.id === targetUser.id ? { ...current, ...updated } : current));
      setSuccess(`Device limit updated for ${targetUser.email}.`);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to update user device limit"));
      return false;
    } finally {
      setSavingUserId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return <Alert severity="error">You don't have permission to manage members.</Alert>;
  }

  const resolvedDefaultLimit = organizationSettings?.default_max_devices_per_user || 1;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon /> Members
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            Invite Member
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)} message={success} />
        )}

        <Card>
          <CardHeader title="Device Policy" subheader="Set the organization default and override it for specific users when needed." />
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
              <TextField
                label="Default devices per user"
                type="number"
                value={defaultDevicesInput}
                onChange={(event) => setDefaultDevicesInput(event.target.value)}
                inputProps={{ min: 1, step: 1 }}
                sx={{ maxWidth: 260 }}
              />
              <Button variant="contained" onClick={handleSaveDefaultDevices} disabled={savingDefaultDevices}>
                {savingDefaultDevices ? <CircularProgress size={20} /> : "Save Default"}
              </Button>
              <Typography color="text.secondary">
                Users without an override inherit <strong>{resolvedDefaultLimit}</strong> device{resolvedDefaultLimit === 1 ? "" : "s"}.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Active Members" />
          <CardContent>
            {users.length === 0 ? (
              <Typography color="textSecondary">No active members</Typography>
            ) : (
              <TableContainer component={Paper} sx={{ backgroundColor: "#0D1C20" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#091518" }}>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Max Devices</TableCell>
                      <TableCell>Last Access</TableCell>
                      <TableCell align="right" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => {
                      const usesDefault = !u.max_devices_override;
                      return (
                        <TableRow key={u.id} hover>
                          <TableCell>{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Chip label={roleLabel(u.role)} color={getRoleColor(u.role)} size="small" />
                          </TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={!!u.active}
                                  disabled={saving || u.id === user?.id}
                                  onChange={(_, checked) => {
                                    void handleToggleUserActive(u, checked);
                                  }}
                                />
                              }
                              label={u.active ? "Active" : "Inactive"}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography>{u.effective_max_devices || resolvedDefaultLimit}</Typography>
                              {usesDefault ? (
                                <Chip size="small" label="Default" variant="outlined" />
                              ) : (
                                <Chip size="small" label="Override" color="primary" variant="outlined" />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>{formatDate(locale, u.last_access_at || u.last_login_at)}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit device limit">
                              <span>
                                <IconButton
                                  color="primary"
                                  disabled={savingUserId === u.id}
                                  onClick={() => {
                                    setDeviceLimitDrafts((prev) => ({
                                      ...prev,
                                      [u.id]: u.max_devices_override ? String(u.max_devices_override) : "",
                                    }));
                                    setDeviceModalUser(u);
                                  }}
                                >
                                  <DevicesIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Pending Invitations" />
          <CardContent>
            {invitations.filter((inv) => !inv.accepted_at).length === 0 ? (
              <Typography color="textSecondary">No pending invitations</Typography>
            ) : (
              <TableContainer component={Paper} sx={{ backgroundColor: "#0D1C20" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#091518" }}>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Invited By</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Expires</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invitations
                      .filter((inv) => !inv.accepted_at)
                      .map((inv) => (
                        <TableRow key={inv.id} hover>
                          <TableCell>
                            <Stack direction="row" alignItems="center" gap={1}>
                              <EmailIcon fontSize="small" />
                              {inv.email}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip label={roleLabel(inv.role)} color={getRoleColor(inv.role)} size="small" />
                          </TableCell>
                          <TableCell>{inv.invited_by_user_id || "-"}</TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" gap={0.5}>
                              <HourglassEmptyIcon fontSize="small" sx={{ color: "#FFA726" }} />
                              <Typography variant="body2">Pending</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                              <Typography variant="body2">{formatDate(locale, inv.expires_at)}</Typography>
                              <Tooltip title="Reenviar">
                                <Badge
                                  badgeContent={
                                    <RefreshIcon
                                      fontSize="small"
                                      sx={{
                                        backgroundColor: "#00C6B8",
                                        borderRadius: "50%",
                                        color: "#0D1C20",
                                        padding: "2px",
                                        fontSize: "12px",
                                      }}
                                    />
                                  }
                                  anchorOriginVertical="bottom"
                                  anchorOriginHorizontal="right"
                                >
                                  <MailIcon
                                    fontSize="small"
                                    sx={{
                                      cursor: "pointer",
                                      color: "#00C6B8",
                                      transition: "opacity 0.2s",
                                      "&:hover": { opacity: 0.7 },
                                    }}
                                    onClick={() => handleResendInvitation(inv.id, inv.email)}
                                  />
                                </Badge>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite Member</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
            />
            <Stack spacing={1}>
              <Typography variant="body2" color="textSecondary">
                Role
              </Typography>
              <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <MenuItem value="user">User (Knowledge, Downloads, Getting Started)</MenuItem>
                <MenuItem value="admin">Admin (Full access to organization)</MenuItem>
              </Select>
            </Stack>
            <Typography variant="caption" color="textSecondary">
              An invitation link will be sent to the email address above.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleInvite} variant="contained" disabled={saving || !formData.email} type="submit">
            {saving ? <CircularProgress size={24} /> : "Send Invitation"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deviceModalUser} onClose={() => setDeviceModalUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {deviceModalUser ? `Device limit for ${deviceModalUser.email}` : "Device limit"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <Typography color="text.secondary">
              Leave the field blank to inherit the organization default of {resolvedDefaultLimit} device{resolvedDefaultLimit === 1 ? "" : "s"}.
            </Typography>
            <TextField
              label="Max devices"
              type="number"
              value={deviceModalUser ? deviceLimitDrafts[deviceModalUser.id] ?? "" : ""}
              onChange={(event) => {
                if (!deviceModalUser) return;
                setDeviceLimitDrafts((prev) => ({
                  ...prev,
                  [deviceModalUser.id]: event.target.value,
                }));
              }}
              inputProps={{ min: 1, step: 1 }}
              placeholder={`Default (${resolvedDefaultLimit})`}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeviceModalUser(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!deviceModalUser || savingUserId === deviceModalUser.id}
            onClick={async () => {
              if (!deviceModalUser) return;
              const saved = await handleSaveUserDeviceLimit(deviceModalUser);
              if (saved) {
                setDeviceModalUser(null);
              }
            }}
          >
            {deviceModalUser && savingUserId === deviceModalUser.id ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MembersPage;
