import React, { useState } from "react";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Description as DescriptionIcon,
  Memory as MemoryIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { searchKnowledge } from "../services/adminService";
import type { KnowledgeSearchChunk } from "../services/adminService";

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError(t("org.search_query_required"));
      return;
    }
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setExpandedResults(new Set());
    try {
      const response = await searchKnowledge(
        "",
        searchQuery,
        undefined,
        30
      );
      setResults(response.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || t("org.search_error"));
      setResults([]);
    } finally {
      setLoading(false);
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

  const documentResults = results.filter(
    (r) => r.source === "text" || r.source === "text,vector" || r.source === "vector,text" || !r.source
  );
  const embedResults = results.filter(
    (r) => r.source === "vector"|| r.source === "text,vector" || r.source === "vector,text"
  );

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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t("org.title")}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t("org.search_all_desc")}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
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
            </Tabs>
          </Box>
          <CardContent>
            {activeTab === 0 && renderResults(uniqueDocumentResults)}
            {activeTab === 1 && renderResults(uniqueEmbedResults)}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default OrganizationKnowledgePage;