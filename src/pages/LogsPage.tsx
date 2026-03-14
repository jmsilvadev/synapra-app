import React, { useEffect, useState } from "react";
import { Alert, Card, CardContent, CircularProgress, Container, Stack, Typography, TextField, MenuItem, Box, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { getAuditLogs } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { AuditLogRecord } from "../types/admin";

const ACTION_OPTIONS = [
  { value: "", label: "All actions" },
  { value: "console.api_keys.create", label: "API Key Created" },
  { value: "console.api_keys.delete", label: "API Key Deleted" },
  { value: "knowledge.search", label: "Knowledge Search" },
  { value: "knowledge.add", label: "Knowledge Added" },
  { value: "knowledge.delete", label: "Knowledge Deleted" },
  { value: "memory.add", label: "Memory Added" },
];

const LogsPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const fetchLogs = (newOffset = 0) => {
    if (!currentOrganizationId) return;
    setLoading(true);
    setError(null);
    getAuditLogs(currentOrganizationId, actionFilter || undefined, startDate || undefined, endDate || undefined, limit, newOffset)
      .then(setLogs)
      .catch((err) => setError(extractErrorMessage(err, t("logs.load_error"))))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (currentOrganizationId) {
      fetchLogs(0);
    }
  }, [currentOrganizationId]);

  const handlePrev = () => {
    const newOffset = Math.max(0, offset - limit);
    setOffset(newOffset);
    fetchLogs(newOffset);
  };

  const handleNext = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    fetchLogs(newOffset);
  };

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>{t("logs.title")}</Typography>
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <TextField
          select
          label="Action"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {ACTION_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        
        <TextField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        
        <TextField
          select
          label="Limit"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          sx={{ minWidth: 100 }}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
          <MenuItem value={50}>50</MenuItem>
          <MenuItem value={100}>100</MenuItem>
        </TextField>

        <Button 
          variant="contained" 
          onClick={() => { setOffset(0); fetchLogs(0); }}
          startIcon={<SearchIcon />}
        >
          {t("logs.search")}
        </Button>
      </Stack>

      <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
        <Button onClick={handlePrev} disabled={offset === 0}>Previous</Button>
        <Button onClick={handleNext} disabled={logs.length < limit}>Next</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <Stack spacing={2}>
          {logs.length === 0 && <Alert severity="info">{t("logs.empty")}</Alert>}
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent>
                <Typography variant="h6">{log.action}</Typography>
                <Typography variant="body2" color="text.secondary">{log.created_at}</Typography>
                <Typography component="pre" sx={{ whiteSpace: "pre-wrap", mt: 1, mb: 0 }}>
                  {log.metadata}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default LogsPage;
