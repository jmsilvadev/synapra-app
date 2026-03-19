import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Link,
  Alert,
} from "@mui/material";
import {
  Terminal as TerminalIcon,
  SmartToy as McpIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { useI18n } from "../i18n";
import CommandBlock from "../components/CommandBlock";
import { apiBaseURL } from "../services/apiClient";

const GettingStartedPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t("getting_started.title")}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t("getting_started.subtitle")}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <TerminalIcon color="primary" />
            <Typography variant="h6">
              {t("getting_started.install.title")}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("getting_started.install.desc")}
          </Typography>

          <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 1, mb: 2 }}>
            <Link href="/downloads" sx={{ textDecoration: "none" }}>
              <Chip label={t("getting_started.install.go_downloads")} color="primary" clickable />
            </Link>
          </Box>
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: "medium" }}>
            Verify installation
          </Typography>

          <CommandBlock lines={["elastra version", "elastra-mcp version"]} sx={{ mb: 3 }} />

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 2, fontWeight: "medium" }}>
            {t("getting_started.cli.usage")}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("getting_started.cli.auth_desc")}
          </Typography>

          <CommandBlock lines={["elastra auth login"]} sx={{ mb: 3 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("getting_started.cli.init_desc")}
          </Typography>

          <CommandBlock lines={["elastra init"]} sx={{ mb: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t("getting_started.cli.init_creates")}
          </Typography>

          <Box component="ul" sx={{ mt: 1, pl: 3, mb: 2 }}>
            <li><Typography variant="body2" sx={{ fontFamily: "monospace" }}>ELASTRA.md</Typography> - {t("getting_started.cli.project_md_desc")}</li>
            <li><Typography variant="body2" sx={{ fontFamily: "monospace" }}>AGENTS.md</Typography> - {t("getting_started.cli.arch_md_desc")}</li>
            <li><Typography variant="body2" sx={{ fontFamily: "monospace" }}>.elastra/config.yaml</Typography> - project and namespace configuration</li>
            <li><Typography variant="body2" sx={{ fontFamily: "monospace" }}>.elastra/watch.yaml</Typography> - local watch and sync settings</li>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <McpIcon color="primary" />
            <Typography variant="h6">
              {t("getting_started.mcp.title")}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("getting_started.mcp.desc")}
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: "medium" }}>
            {t("getting_started.mcp.how_works")}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("getting_started.mcp.how_works_desc")}
          </Typography>

          <Box component="ol" sx={{ mt: 1, pl: 2, mb: 2 }}>
            <li><Typography variant="body2" sx={{ mb: 1 }}>{t("getting_started.mcp.step1")}</Typography></li>
            <li><Typography variant="body2" sx={{ mb: 1 }}>{t("getting_started.mcp.step2")}</Typography></li>
            <li><Typography variant="body2" sx={{ mb: 1 }}>{t("getting_started.mcp.step3")}</Typography></li>
          </Box>

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: "medium" }}>
            {t("getting_started.mcp.install_title")}
          </Typography>

          <CommandBlock lines={["elastra mcp install"]} sx={{ mb: 2 }} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("getting_started.mcp.install_detects")}
          </Typography>

          <Box component="ul" sx={{ mt: 1, pl: 3, mb: 2 }}>
            <li><Typography variant="body2">Claude Desktop</Typography></li>
            <li><Typography variant="body2">Cursor</Typography></li>
            <li><Typography variant="body2">Windsurf</Typography></li>
            <li><Typography variant="body2">VS Code Copilot</Typography></li>
            <li><Typography variant="body2">OpenCode</Typography></li>
            <li><Typography variant="body2">Codex</Typography></li>
          </Box>

          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: "medium" }}>
            {t("getting_started.mcp.manual_config")}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t("getting_started.mcp.manual_config_desc")}
          </Typography>

          <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 1, fontFamily: "monospace", fontSize: "0.875rem", overflow: "auto" }}>
            <pre style={{ margin: 0 }}>{`{
  "mcpServers": {
    "elastra": {
      "type": "stdio",
      "command": "elastra",
      "args": ["mcp", "serve"],
      "env": {
        "ELASTRA_API_URL": "${apiBaseURL}"
      }
    }
  }
}`}</pre>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <TerminalIcon color="primary" />
            <Typography variant="h6">
              Cleanup
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use these commands to remove Elastra files generated inside the current repository.
          </Typography>

          <CommandBlock lines={["elastra mcp remove", "elastra rules remove", "elastra remove generated"]} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <CheckIcon color="success" />
            <Typography variant="h6">
              {t("getting_started.summary.title")}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("getting_started.summary.desc")}
          </Typography>

          <Box component="ul" sx={{ pl: 3 }}>
            <li><Typography variant="body2" sx={{ mb: 1 }}>{t("getting_started.summary.step1")}</Typography></li>
            <li><Typography variant="body2" sx={{ mb: 1 }}>{t("getting_started.summary.step2")}</Typography></li>
            <li><Typography variant="body2" sx={{ mb: 1 }}>{t("getting_started.summary.step3")}</Typography></li>
            <li><Typography variant="body2" sx={{ mb: 1 }}>{t("getting_started.summary.step4")}</Typography></li>
          </Box>

          <Alert severity="success" sx={{ mt: 2 }}>
            {t("getting_started.summary.ready")}
          </Alert>
        </CardContent>
      </Card>
    </Container>
  );
};

export default GettingStartedPage;
