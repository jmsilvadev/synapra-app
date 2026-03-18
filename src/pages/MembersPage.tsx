import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  Snackbar,
  Tooltip,
  Badge,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Add as AddIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Mail as MailIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import {
  listInvitations,
  listUsers,
  createInvitation,
  resendInvitation,
  updateUserRole,
} from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { Invitation, User } from "../types/admin";

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

const MembersPage: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const { t, locale } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({ email: "", role: "user" });

  const isAdmin =
    user?.role === "admin" || user?.role === "owner";

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      try {
        const [usersData, invitationsData] = await Promise.all([
          listUsers(currentOrganizationId).catch(() => []),
          listInvitations(currentOrganizationId).catch(() => []),
        ]);
        setUsers(usersData);
        setInvitations(invitationsData);
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
      setError(
        extractErrorMessage(
          err,
          "Failed to send invitation"
        )
      );
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
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === invitationId ? updatedInvitation : inv))
      );
      setSuccess(`Invitation resent to ${email}`);
    } catch (err) {
      setError(
        extractErrorMessage(
          err,
          "Failed to resend invitation"
        )
      );
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
      setSuccess(`${targetUser.email} ${nextActive ? "activated" : "deactivated"}`);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to update member status"));
    } finally {
      setSaving(false);
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
    return (
      <Alert severity="error">
        You don't have permission to manage members.
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon /> Members
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Invite Member
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Snackbar
            open={!!success}
            autoHideDuration={6000}
            onClose={() => setSuccess(null)}
            message={success}
          />
        )}

        {/* Active Users */}
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
                      <TableCell>Joined</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={roleLabel(u.role)}
                            color={getRoleColor(u.role)}
                            size="small"
                          />
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
                        <TableCell>{formatDate(locale, u.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
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
                            <Chip
                              label={roleLabel(inv.role)}
                              color={getRoleColor(inv.role)}
                              size="small"
                            />
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

      {/* Invite Dialog */}
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
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
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
          <Button
            onClick={handleInvite}
            variant="contained"
            disabled={saving || !formData.email}
            type="submit"
          >
            {saving ? <CircularProgress size={24} /> : "Send Invitation"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MembersPage;
