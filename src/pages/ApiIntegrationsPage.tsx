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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { createClientApiKey, getClientApiKeys } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { ApiKey, ApiKeyCreateResponse } from "../types/admin";

const ApiIntegrationsPage: React.FC = () => {
  const { currentClientId } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [createdKey, setCreatedKey] = useState<ApiKeyCreateResponse | null>(null);
  const [label, setLabel] = useState("webapp");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKeys = async () => {
    if (!currentClientId) {
      setKeys([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setKeys(await getClientApiKeys(currentClientId));
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao carregar API keys"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, [currentClientId]);

  const handleCreate = async () => {
    if (!currentClientId) return;
    try {
      const key = await createClientApiKey(currentClientId, label);
      setCreatedKey(key);
      setOpen(false);
      setLabel("webapp");
      await loadKeys();
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao criar API key"));
    }
  };

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">API/Integrações</Typography>
        <Button variant="contained" onClick={() => setOpen(true)} disabled={!currentClientId}>
          Nova API key
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {createdKey && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setCreatedKey(null)}>
          Chave criada: <strong>{createdKey.secret}</strong>
        </Alert>
      )}
      {loading ? <CircularProgress /> : (
        <Stack spacing={2}>
          {keys.map((key) => (
            <Card key={key.id}>
              <CardContent>
                <Typography variant="h6">{key.label}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {key.preview || "Sem preview"} • criada em {key.created_at || "-"}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Criar API key</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Label" value={label} onChange={(e) => setLabel(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained">Criar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApiIntegrationsPage;
