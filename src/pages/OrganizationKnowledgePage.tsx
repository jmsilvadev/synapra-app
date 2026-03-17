import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Collapse,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Description as DescriptionIcon,
  Memory as MemoryIcon,
  Code as CodeIcon,
  AccountTree as AccountTreeIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import {
  getContext,
  getProjects,
  getNamespaces,
} from "../services/adminService";
import type { Project, Namespace } from "../types/admin";
import type {
  ContextFunction,
  ContextType,
  ContextInterface,
  ContextCall,
} from "../types/admin";

const OrganizationKnowledgePage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<KnowledgeSearchChunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(0);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string>("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingNamespaces, setLoadingNamespaces] = useState(false);

  const [contextData, setContextData] = useState<{
    functions: ContextFunction[];
    types: ContextType[];
    interfaces: ContextInterface[];
    calls: ContextCall[];
    graphSummary: string;
  } | null>(null);
  const [loadingContext, setLoadingContext] = useState(false);

  useEffect(() => {
    if (currentOrganizationId) {
      loadProjects();
    }
  }, [currentOrganizationId]);

  useEffect(() => {
    if (selectedProject) {
      loadNamespaces(selectedProject);
    } else {
      setNamespaces([]);
      setSelectedNamespace("");
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    if (!currentOrganizationId) return;
    setLoadingProjects(true);
    try {
      const projectList = await getProjects(currentOrganizationId);
      setProjects(projectList || []);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadNamespaces = async (projectId: string) => {
    if (!currentOrganizationId) return;
    setLoadingNamespaces(true);
    try {
      const nsList = await getNamespaces(currentOrganizationId, projectId);
      setNamespaces(nsList || []);
      setSelectedNamespace("");
    } catch (err) {
      console.error("Failed to load namespaces:", err);
      setNamespaces([]);
    } finally {
      setLoadingNamespaces(false);
    }
  };

const handleSearch = async () => {
    if (!selectedProject) {
      setError(t("org.project_required") || "Please select a project");
      return;
    }
    if (!searchQuery.trim()) {
      setError(t("org.search_query_required"));
      return;
    }
    setLoading(true);
    setLoadingContext(true);
    setError(null);
    setHasSearched(true);
    setExpandedResults(new Set());
    setContextData(null);

    const projectId = selectedProject;
    const namespaceId = selectedNamespace || undefined;

    try {
      // Context API returns everything: files (chunks), functions, types, interfaces, calls, etc.
      // Backend fetches from ALL namespaces when namespace is not specified
      const contextResponse = await getContext(projectId, searchQuery, namespaceId, undefined, 30);

      // Map files to KnowledgeSearchChunk format for display
      const chunks: KnowledgeSearchChunk[] = (contextResponse.files || []).map((f: any) => ({
        chunk_id: `${f.path}-${f.line_start || 0}`,
        document_id: f.path,
        content: f.content || "",
        score: f.score || 0,
        source: f.source || "files",
        source_path: f.path,
        title: f.path.split("/").pop() || f.path,
        source_type: f.source_type || "files",
        section_anchor: f.relevance || "",
        symbol: "",
        chunk_index: 0,
        line_start: f.line_start || 0,
        line_end: f.line_end || 0,
      }));

      setResults(chunks);
      setContextData({
        functions: contextResponse.functions || [],
        types: contextResponse.types || [],
        interfaces: contextResponse.interfaces || [],
        calls: contextResponse.calls || [],
        graphSummary: contextResponse.graph_summary || "",
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || t("org.search_error"));
      setResults([]);
      setContextData(null);
    } finally {
      setLoading(false);
      setLoadingContext(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setHasSearched(false);
    setError(null);
    setExpandedResults(new Set());
    setContextData(null);
  };

  const toggleExpand = (chunkId: string) => {
    setExpandedResults((prev) => {
      const next = new Set(prev);
      if (next.has(chunkId)) {
        next.delete(chunkId);
      } else {
        next.add(chunkId);
      }
      return next;
    });
  };

  const isEmbedResult = (item: KnowledgeSearchChunk) => {
    const sourceType = (item.source_type || "").toLowerCase();
    const source = (item.source || "").toLowerCase();

    return (
      sourceType.includes("embed") ||
      sourceType === "file" ||
      sourceType === "files" ||
      source.includes("embed") ||
      source === "file" ||
      source === "files"
    );
  };

  const embedResults = results.filter(isEmbedResult);
  const documentResults = results.filter((item) => !isEmbedResult(item));

  const uniqueDocumentResults = Array.from(
    new Map(documentResults.map((r) => [r.chunk_id, r])).values()
  );
  const uniqueEmbedResults = Array.from(
    new Map(embedResults.map((r) => [r.chunk_id, r])).values()
  );

  const renderResults = (items: KnowledgeSearchChunk[]) => {
    if (items.length === 0) {
      return <Alert severity="info">{t("org.no_results")}</Alert>;
    }

    return (
      <List>
        {items.map((result, idx) => (
          <React.Fragment key={result.chunk_id}>
            <ListItem
              alignItems="flex-start"
              sx={{ cursor: "pointer" }}
              onClick={() => toggleExpand(result.chunk_id)}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography variant="body1" fontWeight="medium" sx={{ flex: "1 1 auto" }}>
                      {result.title || result.source_path}
                    </Typography>
                    <Chip label={result.source_type} size="small" variant="outlined" />
                    {result.line_start > 0 && (
                      <Chip label={`L${result.line_start}`} size="small" variant="outlined" />
                    )}
                    {expandedResults.has(result.chunk_id) ? (
                      <ExpandLessIcon fontSize="small" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {result.source_path}
                    </Typography>
                    <Chip
                      label={`${t("org.score")}: ${(result.score * 100).toFixed(0)}%`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                }
              />
            </ListItem>
            <Collapse in={expandedResults.has(result.chunk_id)} timeout="auto">
              <Box sx={{ px: 2, pb: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    maxHeight: 400,
                    overflow: "auto",
                  }}
                >
                  {result.content}
                </Box>
                {result.section_anchor && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    {t("org.section")}: {result.section_anchor}
                  </Typography>
                )}
                {result.symbol && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    {t("org.symbol")}: {result.symbol}
                  </Typography>
                )}
              </Box>
            </Collapse>
            {idx < items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderFunctions = (functions: ContextFunction[]) => {
    if (functions.length === 0) {
      return <Alert severity="info">{t("org.no_functions")}</Alert>;
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("org.function_name")}</TableCell>
              <TableCell>{t("org.function_file")}</TableCell>
              <TableCell>{t("org.function_lines")}</TableCell>
              <TableCell>{t("org.function_score")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {functions.map((fn, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {fn.name}
                  </Typography>
                  {fn.receiver && (
                    <Typography variant="caption" color="text.secondary">
                      ({fn.receiver})
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {fn.file_path}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {fn.line_start}-{fn.line_end}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${(fn.score * 100).toFixed(0)}%`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderTypes = (types: ContextType[]) => {
    if (types.length === 0) {
      return <Alert severity="info">{t("org.no_types")}</Alert>;
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("org.type_name")}</TableCell>
              <TableCell>{t("org.type_kind")}</TableCell>
              <TableCell>{t("org.type_file")}</TableCell>
              <TableCell>{t("org.type_lines")}</TableCell>
              <TableCell>{t("org.type_score")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {types.map((type, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {type.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={type.type_kind} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {type.file_path}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {type.line_start}-{type.line_end}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${(type.score * 100).toFixed(0)}%`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderInterfaces = (interfaces: ContextInterface[]) => {
    if (interfaces.length === 0) {
      return <Alert severity="info">{t("org.no_interfaces")}</Alert>;
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("org.interface_name")}</TableCell>
              <TableCell>{t("org.interface_file")}</TableCell>
              <TableCell>{t("org.interface_lines")}</TableCell>
              <TableCell>{t("org.interface_methods")}</TableCell>
              <TableCell>{t("org.interface_score")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {interfaces.map((iface, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {iface.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {iface.file_path}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {iface.line_start}-{iface.line_end}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {iface.methods?.length || 0}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${(iface.score * 100).toFixed(0)}%`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderCalls = (calls: ContextCall[]) => {
    if (calls.length === 0) {
      return <Alert severity="info">{t("org.no_calls")}</Alert>;
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("org.call_caller")}</TableCell>
              <TableCell>{t("org.call_callee")}</TableCell>
              <TableCell>{t("org.call_type")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {calls.map((call, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {call.caller_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {call.callee_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={call.call_type} size="small" variant="outlined" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const showGraphTabs = selectedProject && contextData;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t("org.title")}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t("org.search_all_desc")}
      </Typography>

      <Card sx={{ mb:3 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>{t("org.project")}</InputLabel>
                <Select
                  value={selectedProject}
                  label={t("org.project")}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  disabled={loadingProjects}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">
                    <em>{t("org.all_projects") || "All Projects"}</em>
                  </MenuItem>
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small" disabled={!selectedProject || loadingNamespaces}>
                <InputLabel>{t("org.namespace")}</InputLabel>
                <Select
                  value={selectedNamespace}
                  label={t("org.namespace")}
                  onChange={(e) => setSelectedNamespace(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="">
                    <em>{t("org.all_namespaces")}</em>
                  </MenuItem>
                  {namespaces.map((ns) => (
                    <MenuItem key={ns.id} value={ns.name}>
                      {ns.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            fullWidth
            size="medium"
            placeholder={t("org.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {searchQuery && (
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
                    {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {hasSearched && (
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
              <Tab
                icon={<DescriptionIcon />}
                iconPosition="start"
                label={`${t("org.documents_tab")} (${uniqueDocumentResults.length})`}
              />
              <Tab
                icon={<MemoryIcon />}
                iconPosition="start"
                label={`${t("org.embeds_tab")} (${uniqueEmbedResults.length})`}
              />
              {showGraphTabs && (
                <Tab
                  icon={<CodeIcon />}
                  iconPosition="start"
                  label={`${t("org.functions_tab")} (${contextData?.functions?.length || 0})`}
                />
              )}
              {showGraphTabs && (
                <Tab
                  icon={<AccountTreeIcon />}
                  iconPosition="start"
                  label={`${t("org.graph_tab")} (${(contextData?.types?.length || 0) + (contextData?.interfaces?.length || 0) + (contextData?.calls?.length || 0)})`}
                />
              )}
            </Tabs>
          </Box>
          <CardContent>
            {activeTab === 0 && renderResults(uniqueDocumentResults)}
            {activeTab === 1 && renderResults(uniqueEmbedResults)}
            {showGraphTabs && activeTab === 2 && (
              <>
                {loadingContext ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  renderFunctions(contextData?.functions || [])
                )}
              </>
            )}
            {showGraphTabs && activeTab === 3 && (
              <>
                {loadingContext ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {t("org.types")}
                    </Typography>
                    {renderTypes(contextData?.types || [])}

                    <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>
                      {t("org.interfaces")}
                    </Typography>
                    {renderInterfaces(contextData?.interfaces || [])}

                    <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>
                      {t("org.calls")}
                    </Typography>
                    {renderCalls(contextData?.calls || [])}

                    {contextData?.graphSummary && (
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                          {t("org.graph_summary")}
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: "action.hover" }}>
                          <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                            {contextData.graphSummary}
                          </Typography>
                        </Paper>
                      </Box>
                    )}
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default OrganizationKnowledgePage;