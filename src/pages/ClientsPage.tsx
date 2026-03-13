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
  Stack,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getClients } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";
import type { Client } from "../types/admin";

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentClientId, setCurrentClientId } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const nextClients = await getClients();
        setClients(nextClients);
        if (!currentClientId && nextClients[0]) {
          setCurrentClientId(nextClients[0].id);
        }
      } catch (err) {
        setError(extractErrorMessage(err, "Falha ao carregar clientes"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentClientId, setCurrentClientId]);

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Clientes</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/clients/new")}>
          Novo Cliente
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {clients.map((client) => (
            <Card
              key={client.id}
              sx={{
                border:
                  currentClientId === client.id
                    ? "1px solid rgba(35, 78, 87, 0.45)"
                    : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <CardContent
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
              >
                <Box>
                  <Typography variant="h6">{client.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {client.user_count} usuários ativos • {client.api_key_count} chaves de API
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={client.plan.toUpperCase()} color="primary" variant="outlined" />
                  <Button variant={currentClientId === client.id ? "contained" : "outlined"} onClick={() => setCurrentClientId(client.id)}>
                    {currentClientId === client.id ? "Cliente ativo" : "Selecionar"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default ClientsPage;
