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

type LogTypeOption = {
  value: string;
  label: string;
};

const DEFAULT_ACTION_OPTION: ActionOption = { value: "", label: "All actions" };
const DEFAULT_TYPE_OPTION: LogTypeOption = { value: "", label: "All types" };

function formatActionLabel(action: string) {
  return action
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

function getLogType(action: string) {
  const [type = ""] = action.split(".");
  return type;
}

function formatLogTypeLabel(type: string) {
  if (!type) {
    return DEFAULT_TYPE_OPTION.label;
  }
  return type.charAt(0).toUpperCase() + type.slice(1);
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
  const [typeFilter, setTypeFilter] = useState("");
  const [memberOptions, setMemberOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [memberFilter, setMemberFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);

  const typeOptions: LogTypeOption[] = [
    DEFAULT_TYPE_OPTION,
    ...Array.from(
      new Set(
        actionOptions
          .map((option) => option.value)
          .filter(Boolean)
          .map((action) => getLogType(action))
          .filter(Boolean)
      )
    )
      .sort((left, right) => left.localeCompare(right))
      .map((type) => ({
        value: type,
        label: formatLogTypeLabel(type),
      })),
  ];

  const filteredActionOptions = [
    DEFAULT_ACTION_OPTION,
    ...actionOptions.filter((option) => option.value && (!typeFilter || getLogType(option.value) === typeFilter)),
  ];

  const selectedTypeOption =
    typeOptions.find((option) => option.value === typeFilter) ?? DEFAULT_TYPE_OPTION;

  const selectedActionOption =
    filteredActionOptions.find((option) => option.value === actionFilter) ??
    (actionFilter ? { value: actionFilter, label: formatActionLabel(actionFilter) } : DEFAULT_ACTION_OPTION);

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
      
      <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: "flex-start" }} flexWrap="wrap" useFlexGap>
        <Autocomplete
          options={typeOptions}
          value={selectedTypeOption}
          onChange={(_, value) => {
            const nextType = value?.value ?? "";
            setTypeFilter(nextType);
            if (actionFilter && nextType && getLogType(actionFilter) !== nextType) {
              setActionFilter("");
            }
          }}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{ minWidth: 220, flex: "0 1 220px" }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Type"
              placeholder="Select a type"
            />
          )}
        />

        <Autocomplete
          options={filteredActionOptions}
          value={selectedActionOption}
          onChange={(_, value) => setActionFilter(value?.value ?? "")}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          sx={{ minWidth: 420, flex: "1 1 420px" }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Action"
              placeholder="Select an action"
            />
          )}
        />

        <Autocomplete
          freeSolo
          options={memberOptions}
          value={memberFilter}
          onInputChange={(_, value) => setMemberFilter(value)}
          onChange={(_, value) => setMemberFilter(value || "")}
          sx={{ minWidth: 320, flex: "1 1 320px" }}
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
          sx={{ minWidth: 180 }}
        />
        
        <TextField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
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
