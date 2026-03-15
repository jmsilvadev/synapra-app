import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  CallSplit as CallSplitIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import {
  getOrganizationDependencies,
  searchOrganizationFunctions,
} from "../services/orgService";
import type { RepoDependency, FunctionMatch } from "../services/orgService";

const OrganizationKnowledgePage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [dependencies, setDependencies] = useState<RepoDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<FunctionMatch[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<FunctionMatch | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }
      try {
        const depsData = await getOrganizationDependencies().catch(() => [] as RepoDependency[]);
        setDependencies(depsData || []);
      } catch {
        setError(t("org.load_error"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentOrganizationId, t]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const results = await searchOrganizationFunctions(query, 10);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t("org.title", "Knowledge")}
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          {t("org.help_text", "Search for functions across all your repositories and see how they're connected between projects.")}
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t("org.search_functions", "Search Functions")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("org.search_desc", "Find functions by name across all repositories in your organization.")}
              </Typography>
              
              <Autocomplete
                freeSolo
                options={suggestions}
                getOptionLabel={(option) => {
                  if (typeof option === "string") return option;
                  return option.function.full_name || option.function.name;
                }}
                inputValue={searchQuery}
                onInputChange={(_, value) => {
                  setSearchQuery(value);
                  if (!value) {
                    setSelectedFunction(null);
                  }
                }}
                onChange={(_, value) => {
                  if (value && typeof value !== "string") {
                    setSelectedFunction(value);
                  }
                }}
                loading={loadingSuggestions}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props as any;
                  return (
                    <li key={key} {...otherProps}>
                      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                        <Typography variant="body2" fontFamily="monospace">
                          {option.function.full_name || option.function.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.project_id}/{option.namespace} • {option.function.file_path}:{option.function.line_start}
                        </Typography>
                      </Box>
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={t("org.search_placeholder", "Start typing a function name...")}
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {loadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
              />

              {selectedFunction && (
                <Box sx={{ mt: 3, p: 2, bgcolor: "background.paper", borderRadius: 1, border: 1, borderColor: "divider" }}>
                  <Typography variant="subtitle1" gutterBottom fontFamily="monospace">
                    {selectedFunction.function.full_name || selectedFunction.function.name}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t("org.project", "Project")}
                      </Typography>
                      <Typography variant="body2">
                        {selectedFunction.project_id}/{selectedFunction.namespace}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        {t("org.file", "File")}
                      </Typography>
                      <Typography variant="body2" fontFamily="monospace" fontSize="0.85rem">
                        {selectedFunction.function.file_path}:{selectedFunction.function.line_start}
                      </Typography>
                    </Grid>
                    {selectedFunction.function.parameters && selectedFunction.function.parameters.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          {t("org.parameters", "Parameters")}
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace" fontSize="0.85rem">
                          {selectedFunction.function.parameters.map((p: any) => `${p.name} ${p.type}`).join(", ")}
                        </Typography>
                      </Grid>
                    )}
                    {selectedFunction.function.return_types && selectedFunction.function.return_types.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          {t("org.returns", "Returns")}
                        </Typography>
                        <Typography variant="body2" fontFamily="monospace" fontSize="0.85rem">
                          {selectedFunction.function.return_types.join(", ")}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CallSplitIcon color="warning" />
                <Box>
                  <Typography variant="subtitle1">
                    {t("org.dependencies", "Cross-Repository Dependencies")} ({dependencies.length})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("org.dependencies_desc", "Functions called from one repository to another")}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t("org.dependencies_help", "These are function calls that cross repository boundaries. Changes to these functions may affect multiple projects.")}
              </Typography>
              {dependencies.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                  <List dense>
                    {dependencies.map((dep, idx) => (
                      <React.Fragment key={idx}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="body2">
                                  {dep.source_project}/{dep.source_namespace}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  →
                                </Typography>
                                <Typography variant="body2">
                                  {dep.target_project}/{dep.target_namespace}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography 
                                  variant="caption" 
                                  fontFamily="monospace"
                                  sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                                  onClick={() => {
                                    setSearchQuery(dep.function_name);
                                    setSelectedFunction(null);
                                  }}
                                >
                                  {dep.function_name}
                                </Typography>
                                <Chip label={`${dep.call_count} ${t("org.calls", "calls")}`} size="small" variant="outlined" />
                              </Box>
                            }
                          />
                        </ListItem>
                        {idx < dependencies.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              ) : (
                <Alert severity="info">
                  {t("org.no_dependencies", "No cross-repo dependencies found. Each repository is independent.")}
                </Alert>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrganizationKnowledgePage;