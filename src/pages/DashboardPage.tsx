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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Folder as FolderIcon,
  Storage as StorageIcon,
  GitHub as GitHubIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Api as ApiIcon,
  Description as DescriptionIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { getDashboard, getAuditActionStats, getSynapraMetrics, getProjects, getStats } from "../services/adminService";
import { getNamespaces } from "../services/adminService";
import { getRepositories } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { DashboardResponse, AuditActionStats, SynapraMetrics, Project, ProjectStats, NamespaceStats, RepositoryStats } from "../services/adminService";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#82caed"];

const DashboardPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [stats, setStats] = useState<AuditActionStats[]>([]);
  const [metrics, setMetrics] = useState<SynapraMetrics | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [namespaceStats, setNamespaceStats] = useState<NamespaceStats[]>([]);
  const [repositoryStats, setRepositoryStats] = useState<RepositoryStats[]>([]);
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
        const [dashboardData, statsData, metricsData, projectsData, statsResponse] = await Promise.all([
          getDashboard(currentOrganizationId),
          getAuditActionStats(currentOrganizationId),
          getSynapraMetrics(currentOrganizationId),
          getProjects(currentOrganizationId),
          getStats(currentOrganizationId),
        ]);
        setData(dashboardData);
        setStats(statsData);
        setMetrics(metricsData);
        setProjects(projectsData);
        setProjectStats(statsResponse.projects || []);
        setNamespaceStats(statsResponse.namespaces || []);
        setRepositoryStats(statsResponse.repositories || []);
      } catch (err) {
        setError(extractErrorMessage(err, t("dashboard.load_error")));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentOrganizationId, t]);

  const getChartData = () => {
    const key = timeRange === "24h" ? "count_24h" : timeRange === "48h" ? "count_48h" : "count_7d";
    return stats
      .filter((s) => !s.action.startsWith("console.") && s[key] > 0)
      .map((s) => ({
        name: s.action,
        value: s[key],
      }));
  };

  const getProjectsChartData = () => {
    return projectStats.map((p, index) => ({
      name: p.project_name,
      namespaces: p.namespaces_count,
      repositories: p.repositories_count,
      documents: p.documents_count,
      fill: COLORS[index % COLORS.length],
    }));
  };

  const getNamespacesChartData = () => {
    return namespaceStats.slice(0, 10).map((n, index) => ({
      name: n.namespace_name,
      value: n.documents_count,
      fill: COLORS[index % COLORS.length],
    }));
  };

  if (!currentOrganizationId) {
    return <Container><Alert severity="info">{t("dashboard.no_org")}</Alert></Container>;
  }

  if (loading) {
    return <Container sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Container>;
  }

  const chartData = getChartData();
  const projectsChartData = getProjectsChartData();
  const namespacesChartData = getNamespacesChartData();

  return (
    <Container>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {data && (
        <Stack spacing={3}>
          {/* Organization Overview */}
          <Typography variant="h6" sx={{ mt: 2 }}>{t("dashboard.organization_overview")}</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <BusinessIcon color="primary" fontSize="large" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">{t("dashboard.organization")}</Typography>
                      <Typography variant="h5">{data.client.name}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <FolderIcon color="primary" fontSize="large" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">{t("dashboard.projects")}</Typography>
                      <Typography variant="h5">{projects.length}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <StorageIcon color="primary" fontSize="large" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">{t("dashboard.namespaces")}</Typography>
                      <Typography variant="h5">{namespaceStats.length}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <GitHubIcon color="primary" fontSize="large" />
                    <Box>
                      <Typography variant="body2" color="text.secondary">{t("dashboard.repositories")}</Typography>
                      <Typography variant="h5">{repositoryStats.length}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Usage Stats */}
          <Grid container spacing={2}>
            {[
              { label: t("dashboard.users"), value: data.summary.users_total, icon: <BusinessIcon /> },
              { label: t("dashboard.api_keys"), value: data.summary.api_keys_total, icon: <ApiIcon /> },
              { label: t("dashboard.documents"), value: projectStats.reduce((sum, p) => sum + p.documents_count, 0), icon: <DescriptionIcon /> },
              { label: t("dashboard.chunks"), value: projectStats.reduce((sum, p) => sum + p.chunks_count, 0), icon: <CodeIcon /> },
            ].map((metric) => (
              <Grid item xs={12} sm={6} md={3} key={metric.label}>
                <Card>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">{metric.label}</Typography>
                    <Typography variant="h4">{metric.value.toLocaleString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Projects Stats Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t("dashboard.projects_summary")}</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("dashboard.project_name")}</TableCell>
                      <TableCell align="center">{t("dashboard.project_namespaces")}</TableCell>
                      <TableCell align="center">{t("dashboard.project_repositories")}</TableCell>
                      <TableCell align="center">{t("dashboard.documents")}</TableCell>
                      <TableCell align="center">{t("dashboard.chunks")}</TableCell>
                      <TableCell align="center">{t("dashboard.embeddings")}</TableCell>
                      <TableCell align="center">{t("dashboard.graph")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projectStats.map((project) => (
                      <TableRow key={project.project_id}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <FolderIcon fontSize="small" color="action" />
                            <Typography>{project.project_name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={project.namespaces_count} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={project.repositories_count} size="small" color="secondary" variant="outlined" />
                        </TableCell>
                        <TableCell align="center">
                          <Typography>{project.documents_count.toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography>{project.chunks_count.toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography>{(project.embeddings_count || 0).toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Chip label={`F: ${(project.functions_count || 0).toLocaleString()}`} size="small" variant="outlined" />
                            <Chip label={`M: ${(project.modules_count || 0).toLocaleString()}`} size="small" variant="outlined" />
                            <Chip label={`E: ${(project.endpoints_count || 0).toLocaleString()}`} size="small" variant="outlined" />
                            <Chip label={`T: ${(project.entities_count || 0).toLocaleString()}`} size="small" variant="outlined" />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {projectStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary">{t("dashboard.no_projects")}</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Namespaces Stats Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t("dashboard.namespaces_summary")}</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("dashboard.namespace_name")}</TableCell>
                      <TableCell>{t("dashboard.project_name")}</TableCell>
                      <TableCell align="center">{t("dashboard.documents")}</TableCell>
                      <TableCell align="center">{t("dashboard.chunks")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {namespaceStats.slice(0, 20).map((ns) => (
                      <TableRow key={ns.namespace_id}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <StorageIcon fontSize="small" color="action" />
                            <Typography>{ns.namespace_name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{ns.project_name}</TableCell>
                        <TableCell align="center">{ns.documents_count.toLocaleString()}</TableCell>
                        <TableCell align="center">{ns.chunks_count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    {namespaceStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary">{t("dashboard.no_namespaces")}</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Charts */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t("dashboard.projects_distribution")}</Typography>
                  {projectsChartData.length > 0 ? (
                    <Box sx={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectsChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="namespaces" fill="#0088FE" name={t("dashboard.namespaces")} />
                          <Bar dataKey="repositories" fill="#00C49F" name={t("dashboard.repositories")} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">{t("dashboard.no_data")}</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{t("dashboard.namespaces_distribution")}</Typography>
                  {namespacesChartData.length > 0 ? (
                    <Box sx={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={namespacesChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            dataKey="value"
                          >
                            {namespacesChartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Typography color="text.secondary">{t("dashboard.no_data")}</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Audit Events */}
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{t("dashboard.audit_events")}</Typography>
                <ToggleButtonGroup
                  value={timeRange}
                  exclusive
                  onChange={(_, v) => v && setTimeRange(v)}
                  size="small"
                >
                  <ToggleButton value="24h">24h</ToggleButton>
                  <ToggleButton value="48h">48h</ToggleButton>
                  <ToggleButton value="7d">7d</ToggleButton>
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
                <Typography color="text.secondary">{t("dashboard.no_data")}</Typography>
              )}
            </CardContent>
          </Card>

          {/* Chunks Usage */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{t("dashboard.chunks_usage")}</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">{t("dashboard.stored_chunks")}</Typography>
                  <Typography variant="h5">{projectStats.reduce((sum, p) => sum + p.chunks_count, 0).toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="body2" color="text.secondary">{t("dashboard.vectors_stored")}</Typography>
                  <Typography variant="h5">{projectStats.reduce((sum, p) => sum + p.vectors_count, 0).toLocaleString()}</Typography>
                </Grid>
                {metrics && (
                  <>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">{t("dashboard.queries_total")}</Typography>
                      <Typography variant="h5">{metrics.total_queries}</Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography variant="body2" color="text.secondary">{t("dashboard.tokens_saved")}</Typography>
                      <Typography variant="h5" color="success.main">{metrics.est_tokens_saved.toLocaleString()}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Subscription */}
          {data.subscription && (
            <Card>
              <CardContent>
                <Typography variant="h6">{t("dashboard.subscription")}</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label={data.subscription.plan_code} color="primary" />
                  <Chip label={data.subscription.status} color={data.subscription.status === "active" ? "success" : "default"} />
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
    </Container>
  );
};

export default DashboardPage;