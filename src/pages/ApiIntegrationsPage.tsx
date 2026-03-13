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
import { extractErrorMessage } from "../services/apiClient";
import type { ApiKey, ApiKeyCreateResponse } from "../types/admin";

const ApiIntegrationsPage: React.FC = () => {
  const { currentClientId } = useAuth();
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
    if (!currentClientId) {
      setKeys([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setKeys(await getClientApiKeys(currentClientId));
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao carregar API keys"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadKeys();
  }, [currentClientId]);

  const handleCreate = async () => {
    if (!currentClientId || !label.trim()) {
      setError("Informe um nome para a API key.");
      return;
    }

    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      const key = await createClientApiKey(currentClientId, label.trim());
      setCreatedKey(key);
      setOpenCreate(false);
      setLabel("agent");
      setSuccess("API key criada com sucesso. Guarde o segredo agora, ele só é exibido uma vez.");
      await loadKeys();
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao criar API key"));
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!currentClientId) {
      return;
    }
    setRevokingKeyId(keyId);
    setError(null);
    setSuccess(null);
    try {
      await revokeClientApiKey(currentClientId, keyId);
      setSuccess("API key revogada com sucesso.");
      await loadKeys();
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao revogar API key"));
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
      setSuccess("Segredo copiado para a área de transferência.");
    } catch {
      setError("Não foi possível copiar o segredo automaticamente.");
    }
  };

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2 }}>
        <div>
          <Typography variant="h4">API</Typography>
          <Typography color="text.secondary">
            Gere as API keys que a sua organização vai usar para autenticar agentes no Synapra.
          </Typography>
        </div>
        <Button variant="contained" onClick={() => setOpenCreate(true)} disabled={!currentClientId}>
          Gerar API key
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
              <Typography variant="h6">Nova API key gerada</Typography>
              <Typography color="text.secondary">
                Este segredo só aparece agora. Depois disso, apenas o preview continua visível.
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
              Copiar segredo
            </Button>
            <Button onClick={() => setCreatedKey(null)}>
              Fechar
            </Button>
          </CardActions>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h6">Como usar</Typography>
            <Typography color="text.secondary">
              Use esta chave no header `X-API-Key` quando os agentes consultarem ou sincronizarem contexto no Synapra.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <CircularProgress />
      ) : !currentClientId ? (
        <Alert severity="info">Selecione um cliente para gerir as API keys da organização.</Alert>
      ) : (
        <Stack spacing={2}>
          {keys.length === 0 ? (
            <Card>
              <CardContent>
                <Typography variant="h6">Nenhuma API key criada</Typography>
                <Typography color="text.secondary">
                  Gere a primeira API key da organização para permitir acesso dos agentes ao Synapra.
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
                      Preview: {key.preview || "Sem preview"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Criada em: {key.created_at || "-"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Estado: {key.revoked_at ? `Revogada em ${key.revoked_at}` : "Ativa"}
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
                    {revokingKeyId === key.id ? "A revogar..." : "Revogar"}
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
        </Stack>
      )}

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm">
        <DialogTitle>Gerar API key</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography color="text.secondary">
              Dê um nome claro para identificar onde esta chave será usada.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Nome da API key"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="ex: cursor-prod"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>
            {creating ? "A gerar..." : "Gerar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ApiIntegrationsPage;
