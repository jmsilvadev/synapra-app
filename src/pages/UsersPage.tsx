import React, { useEffect, useState } from "react";
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
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { createClientInvitation, getClientInvitations, getClientUsers } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";

const UsersPage: React.FC = () => {
  const { currentClientId } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!currentClientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [nextUsers, nextInvitations] = await Promise.all([
        getClientUsers(currentClientId),
        getClientInvitations(currentClientId),
      ]);
      setUsers(nextUsers);
      setInvitations(nextInvitations);
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao carregar usuários"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [currentClientId]);

  const handleInvite = async () => {
    if (!currentClientId) return;
    try {
      await createClientInvitation(currentClientId, email, role);
      setOpen(false);
      setEmail("");
      setRole("viewer");
      await load();
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao criar convite"));
    }
  };

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Usuários</Typography>
        <Button variant="contained" onClick={() => setOpen(true)} disabled={!currentClientId}>
          Convidar
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <Stack spacing={2}>
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent>
                <Typography variant="h6">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email} • {user.membership.role}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {invitations.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Convites</Typography>
                <Stack spacing={1}>
                  {invitations.map((invitation) => (
                    <Typography key={invitation.id} variant="body2" color="text.secondary">
                      {invitation.email} • {invitation.role} • expira em {invitation.expires_at}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Convidar usuário</DialogTitle>
        <DialogContent sx={{ minWidth: 360 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
              <MenuItem value="viewer">viewer</MenuItem>
              <MenuItem value="operator">operator</MenuItem>
              <MenuItem value="billing">billing</MenuItem>
              <MenuItem value="admin">admin</MenuItem>
              <MenuItem value="owner">owner</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleInvite}>Enviar convite</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage;
