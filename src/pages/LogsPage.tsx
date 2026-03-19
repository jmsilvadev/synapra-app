import React, { useEffect, useState } from "react";
import { Alert, Autocomplete, Card, CardContent, CircularProgress, Container, Stack, Typography, TextField, MenuItem, Box, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { getAuditActionStats, getAuditLogs, listUsers } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { AuditActionStats, AuditLogMetadata, AuditLogRecord, User } from "../types/admin";

type ActionOption = {
  value: string;
  label: string;
};

const DEFAULT_ACTION_OPTION: ActionOption = { value: "", label: "All actions" };

function formatActionLabel(action: string) {
  return action
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

function parseMetadata(metadata: string): AuditLogMetadata {
  try {
    return JSON.parse(metadata) as AuditLogMetadata;
  } catch {
    return {};
  }
}

const LogsPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [actionOptions, setActionOptions] = useState<ActionOption[]>([DEFAULT_ACTION_OPTION]);
  const [memberOptions, setMemberOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const fetchLogs = (newOffset = 0) => {
    if (!currentOrganizationId) return;
    setLoading(true);
    setError(null);
    getAuditLogs(
      currentOrganizationId,
      actionFilter || undefined,
      memberFilter || undefined,
      startDate || undefined,
      endDate || undefined,
      limit,
      newOffset
    )
      .then(setLogs)
      .catch((err) => setError(extractErrorMessage(err, t("logs.load_error"))))
      .finally(() => setLoading(false));
  };

  const fetchActionOptions = () => {
    if (!currentOrganizationId) return;
    getAuditActionStats(currentOrganizationId)
      .then((stats: AuditActionStats[]) => {
        const dynamicOptions = stats.map((stat) => ({
          value: stat.action,
          label: formatActionLabel(stat.action),
        }));
        setActionOptions([DEFAULT_ACTION_OPTION, ...dynamicOptions]);
      })
      .catch(() => setActionOptions([DEFAULT_ACTION_OPTION]));
  };

  const fetchMemberOptions = () => {
    if (!currentOrganizationId) return;
    listUsers(currentOrganizationId)
      .then((users: User[]) => {
        const options = users.flatMap((user) => {
          const values = [user.name, user.email]
            .map((value) => value?.trim())
            .filter((value): value is string => Boolean(value));
          return values;
        });
        setMemberOptions(Array.from(new Set(options)).sort((left, right) => left.localeCompare(right)));
      })
      .catch(() => setMemberOptions([]));
  };

  useEffect(() => {
    if (currentOrganizationId) {
      fetchActionOptions();
      fetchMemberOptions();
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
          {actionOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>

        <Autocomplete
          freeSolo
          options={memberOptions}
          value={memberFilter}
          onInputChange={(_, value) => setMemberFilter(value)}
          onChange={(_, value) => setMemberFilter(value || "")}
          sx={{ minWidth: 260 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Member"
              placeholder="Name or email"
            />
          )}
        />
        
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
                {(() => {
                  const metadata = parseMetadata(log.metadata);
                  const actor = metadata.actor_name || metadata.actor_email;
                  return (
                    <>
                <Typography variant="h6">{log.action}</Typography>
                <Typography variant="body2" color="text.secondary">{log.created_at}</Typography>
                {actor ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {`Member: ${String(actor)}`}
                  </Typography>
                ) : null}
                <Typography component="pre" sx={{ whiteSpace: "pre-wrap", mt: 1, mb: 0 }}>
                  {log.metadata}
                </Typography>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default LogsPage;
