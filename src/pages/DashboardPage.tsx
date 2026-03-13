import React, { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { getDashboard } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { DashboardResponse } from "../services/adminService";

const DashboardPage: React.FC = () => {
  const { currentClientId } = useAuth();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentClientId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        setData(await getDashboard(currentClientId));
      } catch (err) {
        setError(extractErrorMessage(err, "Falha ao carregar dashboard"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentClientId]);

  if (!currentClientId) {
    return <Container><Alert severity="info">Selecione um cliente para visualizar o dashboard.</Alert></Container>;
  }

  if (loading) {
    return <Container sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Container>;
  }

  return (
    <Container>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {data && (
        <Stack spacing={3}>
          <Typography variant="h4">{data.client.name}</Typography>
          <Grid container spacing={2}>
            {[
              { label: "Usuários", value: data.summary.users_total },
              { label: "API keys", value: data.summary.api_keys_total },
              { label: "Namespaces", value: data.summary.namespaces_total },
              { label: "Documentos", value: data.summary.documents_total },
              { label: "Buscas 24h", value: data.summary.search_requests_24h },
              { label: "Chunks", value: data.usage.stored_chunks },
            ].map((metric) => (
              <Grid item xs={12} md={4} key={metric.label}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{metric.label}</Typography>
                    <Typography variant="h4">{metric.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {data.subscription && (
            <Card>
              <CardContent>
                <Typography variant="h6">Subscrição</Typography>
                <Typography variant="body2" color="text.secondary">
                  Plano {data.subscription.plan_code} • Status {data.subscription.status}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
    </Container>
  );
};

export default DashboardPage;
