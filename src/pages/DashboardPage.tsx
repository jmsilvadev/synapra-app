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
import { useI18n } from "../i18n";
import { getDashboard } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { DashboardResponse } from "../services/adminService";

const DashboardPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        setData(await getDashboard(currentOrganizationId));
      } catch (err) {
        setError(extractErrorMessage(err, t("dashboard.load_error")));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentOrganizationId]);

  if (!currentOrganizationId) {
    return <Container><Alert severity="info">{t("dashboard.no_org")}</Alert></Container>;
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
              { label: t("dashboard.users"), value: data.summary.users_total },
              { label: t("dashboard.api_keys"), value: data.summary.api_keys_total },
              { label: t("dashboard.namespaces"), value: data.summary.namespaces_total },
              { label: t("dashboard.documents"), value: data.summary.documents_total },
              { label: t("dashboard.searches_24h"), value: data.summary.search_requests_24h },
              { label: t("dashboard.chunks"), value: data.usage.stored_chunks },
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
                <Typography variant="h6">{t("dashboard.subscription")}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("dashboard.plan_status", {
                    plan: data.subscription.plan_code,
                    status: data.subscription.status,
                  })}
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
