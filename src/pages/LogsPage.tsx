import React, { useEffect, useState } from "react";
import { Alert, Card, CardContent, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";
import { getAuditLogs } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { AuditLogRecord } from "../types/admin";

const LogsPage: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const { t } = useI18n();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentOrganizationId) {
      setLoading(false);
      return;
    }
    getAuditLogs(currentOrganizationId)
      .then(setLogs)
      .catch((err) => setError(extractErrorMessage(err, t("logs.load_error"))))
      .finally(() => setLoading(false));
  }, [currentOrganizationId]);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>{t("logs.title")}</Typography>
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
