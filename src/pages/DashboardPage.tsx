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
  ToggleButton,
  ToggleButtonGroup,
  Box,
} from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { getDashboard, getAuditActionStats, getSynapraMetrics } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { DashboardResponse, AuditActionStats, SynapraMetrics } from "../services/adminService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#82caed"];

const DashboardPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [stats, setStats] = useState<AuditActionStats[]>([]);
  const [metrics, setMetrics] = useState<SynapraMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"24h" | "48h" | "7d">("24h");

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [dashboardData, statsData, metricsData] = await Promise.all([
          getDashboard(currentOrganizationId),
          getAuditActionStats(currentOrganizationId),
          getSynapraMetrics(currentOrganizationId),
        ]);
        setData(dashboardData);
        setStats(statsData);
        setMetrics(metricsData);
      } catch (err) {
        setError(extractErrorMessage(err, t("dashboard.load_error")));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentOrganizationId]);

  const getChartData = () => {
    const key = timeRange === "24h" ? "count_24h" : timeRange === "48h" ? "count_48h" : "count_7d";
    return stats
      .filter((s) => !s.action.startsWith("console.") && s[key] > 0)
      .map((s) => ({
        name: s.action,
        value: s[key],
      }));
  };

  if (!currentOrganizationId) {
    return <Container><Alert severity="info">{t("dashboard.no_org")}</Alert></Container>;
  }

  if (loading) {
    return <Container sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Container>;
  }

  const chartData = getChartData();

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

          {metrics && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Synapra Context Economy</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Total Queries</Typography>
                    <Typography variant="h5">{metrics.total_queries}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Chunks Retrieved</Typography>
                    <Typography variant="h5">{metrics.total_chunks}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Est. Tokens Saved</Typography>
                    <Typography variant="h5" color="success.main">{metrics.est_tokens_saved.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Last 24h</Typography>
                    <Typography variant="h5" color="success.main">+{metrics.est_tokens_last_24h.toLocaleString()}</Typography>
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Estimated savings: (queries × 800) - (chunks × 200) tokens
                </Typography>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Audit Events by Action</Typography>
                <ToggleButtonGroup
                  value={timeRange}
                  exclusive
                  onChange={(_, v) => v && setTimeRange(v)}
                  size="small"
                >
                  <ToggleButton value="24h">24h</ToggleButton>
                  <ToggleButton value="48h">48h</ToggleButton>
                  <ToggleButton value="7d">7 days</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              {chartData.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Typography color="text.secondary">No data available</Typography>
              )}
            </CardContent>
          </Card>

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
