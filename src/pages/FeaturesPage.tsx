import React from "react";
import { Box, Button, Chip, Container, Grid, IconButton, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SavingsIcon from "@mui/icons-material/Savings";
import SyncIcon from "@mui/icons-material/Sync";
import EngineeringIcon from "@mui/icons-material/Engineering";
import GppGoodIcon from "@mui/icons-material/GppGood";
import HubIcon from "@mui/icons-material/Hub";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import KeyIcon from "@mui/icons-material/Key";
import StorageIcon from "@mui/icons-material/Storage";
import RuleIcon from "@mui/icons-material/Rule";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { usePageSeo } from "../hooks/usePageSeo";

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  usePageSeo({
    title: "Synapra Features | AI Agents, Context, Rules and Governance",
    description:
      "Explore os recursos do Synapra para devs e empresas: contexto compartilhado para agentes de IA, MCP multi-agente, regras e policies, sync e governanca.",
    keywords:
      "recursos agentes de IA, AI agent features, contexto para IA, MCP server, regras de engenharia, governanca IA empresa, developer productivity AI",
    path: "/features",
    imagePath: "/synapra_final_logo.svg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Synapra Features",
      description:
        "Recursos para agentes de IA em empresas: contexto compartilhado, regras/policies, governanca e integracao MCP.",
      url: `${window.location.origin}/features`,
      about: ["AI agents", "MCP integration", "Rules and policies", "Enterprise engineering"],
    },
  });

  const valueProps = [
    {
      icon: <SavingsIcon color="primary" />,
      title: "Lower LLM spend without losing quality",
      description:
        "Stop repeating project context in every chat. Agents pull exactly what they need, when they need it.",
    },
    {
      icon: <EngineeringIcon color="primary" />,
      title: "Ship with consistent engineering standards",
      description:
        "Turn architecture patterns and coding rules into shared operating context for all teams and agents.",
    },
    {
      icon: <GppGoodIcon color="primary" />,
      title: "Scale with governance and control",
      description:
        "Use API keys, tenant isolation, quotas, and usage visibility to run AI adoption safely in production.",
    },
    {
      icon: <SyncIcon color="primary" />,
      title: "Deploy fast with operational onboarding",
      description:
        "Authenticate once, initialize workspaces, connect MCP clients, and start syncing in minutes.",
    },
  ];

  const capabilities = [
    {
      icon: <HubIcon color="primary" />,
      title: "Unified Knowledge Layer",
      description: "Index code, docs, and decisions once. Reuse across all AI workflows.",
    },
    {
      icon: <IntegrationInstructionsIcon color="primary" />,
      title: "Multi-Agent MCP Integration",
      description: "Connect Cursor, Claude, VS Code Copilot, Windsurf, OpenCode, Codex, and custom MCP clients.",
    },
    {
      icon: <SyncIcon color="primary" />,
      title: "Sync + Live Watch",
      description: "Keep knowledge current automatically with sync tools and local watch lifecycle controls.",
    },
    {
      icon: <RuleIcon color="primary" />,
      title: "Rules & Policy Enforcement",
      description: "Apply organization and workspace rules consistently across repositories and teams.",
    },
    {
      icon: <AccountTreeIcon color="primary" />,
      title: "Repository-Aware Configuration",
      description: "Use project, namespace, and repository mapping with per-repository watch settings.",
    },
    {
      icon: <StorageIcon color="primary" />,
      title: "Knowledge + Memory Operations",
      description: "Support structured context, sync status, and long-term memory capture for repeatable execution.",
    },
    {
      icon: <KeyIcon color="primary" />,
      title: "API Key and Access Management",
      description: "Create, rotate, and revoke keys per tenant with auditable operational controls.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(0, 224, 255, 0.14), transparent 28%), #071417",
        px: 2,
        py: 4,
        position: "relative",
      }}
    >
      <Box sx={{ position: "absolute", top: 20, right: 20, zIndex: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton
          aria-label="Go to home"
          onClick={() => navigate("/")}
          sx={{
            color: "common.white",
            border: "1px solid rgba(255,255,255,0.2)",
            bgcolor: "rgba(7,20,23,0.5)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
          }}
        >
          <HomeIcon fontSize="small" />
        </IconButton>
        <LanguageSwitcher compact />
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>

      <Box
        component="img"
        src={`${process.env.PUBLIC_URL || ""}/synapra_final_logo.svg`}
        alt="Synapra"
        sx={{
          display: "block",
          width: "100%",
          maxWidth: 520,
          mx: "auto",
          mb: 4,
        }}
      />

      <Stack spacing={5}>
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            background:
              "linear-gradient(135deg, rgba(0,198,184,0.15) 0%, rgba(0,224,255,0.08) 45%, rgba(13,28,32,0.4) 100%)",
            border: "1px solid rgba(0, 198, 184, 0.3)",
          }}
        >
          <Stack spacing={2.5}>
            <Chip label="Built for AI Engineering Teams" color="primary" variant="outlined" sx={{ width: "fit-content" }} />
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              Synapra turns isolated AI chats into a shared engineering system.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 860 }}>
              Deploy once, connect every agent, and keep context, rules, and architecture decisions consistent across your organization.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button variant="contained" onClick={() => navigate("/signup")}>Start Free</Button>
              <Button variant="outlined" onClick={() => navigate("/plans")}>See Plans</Button>
            </Stack>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          }}
        >
          {valueProps.map((item) => (
            <Box key={item.title} sx={{ p: 3, borderRadius: 2, width: "100%", height: { xs: "100%", md: 220 }, border: "1px solid rgba(0,198,184,0.2)", backgroundColor: "rgba(13,28,32,0.5)" }}>
              <Stack spacing={1.5}>
                {item.icon}
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                <Typography
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.description}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>

        <Box>
          <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 800 }}>
            What Synapra does in production
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Beyond context retrieval, Synapra provides onboarding, governance, repository intelligence, and operational control for enterprise AI development.
          </Typography>
          <Grid container spacing={2.5}>
            {capabilities.map((item) => (
              <Grid item xs={12} md={6} key={item.title}>
                <Box sx={{ p: 2.5, borderRadius: 2, height: "100%", border: "1px solid rgba(0,198,184,0.16)", backgroundColor: "rgba(9,21,24,0.65)" }}>
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <Box sx={{ mt: 0.25 }}>{item.icon}</Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                      <Typography color="text.secondary">{item.description}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ p: 3, borderRadius: 2.5, border: "1px solid rgba(0,224,255,0.3)", backgroundColor: "rgba(0, 198, 184, 0.08)" }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Ready to scale AI development without scaling chaos?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Centralize engineering context, reduce duplicated token usage, and keep every agent aligned with how your teams actually build software.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/plans")}>VEJA NOSSOS PLANOS</Button>
        </Box>
      </Stack>
      </Container>
    </Box>
  );
};

export default FeaturesPage;
