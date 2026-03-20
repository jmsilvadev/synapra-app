import React from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SavingsIcon from "@mui/icons-material/Savings";
import HubIcon from "@mui/icons-material/Hub";
import GitHubIcon from "@mui/icons-material/GitHub";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import RuleIcon from "@mui/icons-material/Rule";
import TerminalIcon from "@mui/icons-material/Terminal";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import KeyIcon from "@mui/icons-material/Key";
import MemoryIcon from "@mui/icons-material/Memory";
import LanIcon from "@mui/icons-material/Lan";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import SyncIcon from "@mui/icons-material/Sync";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import BrandLockup from "../components/BrandLockup";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { usePageSeo } from "../hooks/usePageSeo";

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  usePageSeo({
    title: "Elastra AI Features | AI Agent Control Plane, Rules, Skills, Commands, MCP and Governance",
    description:
      "Explore Elastra AI as the control plane for AI agents: rules and policies, skills and commands, GitHub-aware sync, shared context retrieval, graph and impact analysis, audit logs, billing controls and enterprise governance, with average savings of 40% in agent token usage and 40% in execution time.",
    keywords:
      "Elastra AI features, AI agent control plane, AI agent platform, agent governance, agent rules and policies, AI skills and commands, GitHub App sync, MCP server, code graph analysis, impact analysis, audit logs for AI agents, repository sync, enterprise AI platform, reduce agent tokens, reduce AI execution time",
    path: "/features",
    imagePath: "/elastra_og_image.svg",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "Elastra AI Features",
        description:
          "Commercial overview of Elastra AI as the AI agent control plane for engineering teams, including rules, policies, skills, commands, GitHub sync, shared context retrieval, observability, CLI flows and enterprise governance, with average savings of 40% in tokens and 40% in time.",
        url: `${window.location.origin}/features`,
        isPartOf: {
          "@type": "WebSite",
          name: "Elastra AI",
          url: window.location.origin,
        },
        about: [
          "AI agent platform",
          "GitHub repository sync",
          "MCP integrations",
          "Engineering rules and governance",
          "Graph and impact analysis",
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Elastra AI",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web, CLI",
        description:
          "Elastra AI is the control plane for AI agents in software teams, giving organizations shared context, GitHub-aware sync, rules, policies, skills, commands, graph analysis, auditability and multi-agent MCP connectivity while reducing average token usage and execution time by 40%.",
        featureList: [
          "Rules, policies, skills and commands managed from one platform",
          "GitHub App and webhook repository sync",
          "Multi-agent MCP connectivity",
          "Shared context retrieval with text, vector, graph and rules",
          "Organization, project, namespace, repository and user rules",
          "Code graph, callers, callees and impact analysis",
          "Audit logs and operational observability",
          "CLI init, update, rules materialization and MCP install",
          "Billing, quotas, usage and SCU controls",
        ],
        url: window.location.origin,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Does Elastra AI support GitHub repository sync?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Elastra AI supports GitHub integration, repository connection, GitHub App installation, webhook-driven sync and automatic repository updates on pull requests and merges.",
            },
          },
          {
            "@type": "Question",
            name: "Can Elastra AI apply rules to different scopes?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Elastra AI supports rules for organizations, projects, namespaces, repositories and individual users, and materializes effective rules into agent-specific instruction files.",
            },
          },
          {
            "@type": "Question",
            name: "Which AI agents can connect to Elastra AI?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Elastra AI supports MCP-based integrations for tools such as Cursor, Claude, VS Code Copilot, Windsurf, OpenCode, Codex and custom MCP-compatible clients.",
            },
          },
        ],
      },
    ],
  });

  const heroStats = [
    { value: "40%", label: "lower token usage", detail: "average reduction in agent token consumption" },
    { value: "40%", label: "faster delivery", detail: "average reduction in execution time" },
    { value: "5", label: "rule scopes", detail: "organization, project, namespace, repository and user" },
    { value: "10+", label: "agent surfaces", detail: "MCP clients, CLI flows, console and API endpoints" },
  ];

  const foundation = [
    {
      icon: <HubIcon color="primary" />,
      title: "Shared Knowledge Layer",
      description:
        "Index code, docs, runbooks and synthetic project manifests once, then reuse that knowledge across every agent and workflow.",
      bullets: [
        "knowledge sync and incremental updates",
        "project and namespace isolation",
        "cross-repository project context when relevant",
      ],
    },
    {
      icon: <TravelExploreIcon color="primary" />,
      title: "Hybrid Context Retrieval",
      description:
        "Combine retrieval over text, vectors, graph signals, memory and rules instead of forcing every agent to work from raw prompt history.",
      bullets: [
        "adaptive context strategies",
        "memory-aware retrieval",
        "lower token repetition across sessions",
      ],
    },
    {
      icon: <AccountTreeIcon color="primary" />,
      title: "Graph, Callers and Impact Analysis",
      description:
        "Understand what calls what, what breaks when code changes, and how architecture evolves across files, functions and repositories.",
      bullets: [
        "graph, callers and callees",
        "impact analysis",
        "change history and summaries",
      ],
    },
    {
      icon: <MemoryIcon color="primary" />,
      title: "Operational Memory",
      description:
        "Capture durable engineering decisions, explanations and bug knowledge so agents stop rediscovering the same context over and over.",
      bullets: [
        "memory write, list and search",
        "decision preservation",
        "repeatable execution context",
      ],
    },
  ];

  const operations = [
    {
      icon: <GitHubIcon color="primary" />,
      title: "GitHub Integration and Auto-Sync",
      description:
        "Connect repositories, use GitHub App installs and webhooks, and keep project knowledge current on pull requests, merges and default-branch pushes.",
      bullets: [
        "GitHub login and repo connection",
        "GitHub App installation token support",
        "webhook-driven PR and merge sync",
      ],
    },
    {
      icon: <RuleIcon color="primary" />,
      title: "Rules at Every Useful Scope",
      description:
        "Keep agents aligned with how your teams actually build software using layered rules that can be materialized into local agent instruction files.",
      bullets: [
        "organization, project, namespace and repository rules",
        "user-specific personal rules",
        "effective rule materialization for agents",
      ],
    },
    {
      icon: <AutoAwesomeIcon color="primary" />,
      title: "Skills and Commands",
      description:
        "Create reusable organizational skills and slash-like command entry points so agent workflows become repeatable instead of ad hoc.",
      bullets: [
        "organization skills",
        "command routing",
        "deterministic execution patterns",
      ],
    },
    {
      icon: <TerminalIcon color="primary" />,
      title: "CLI, Init and MCP Setup",
      description:
        "Bootstrap new workspaces, refresh effective rules, install MCP integrations and materialize agent files from the CLI in minutes.",
      bullets: [
        "elastra init and update",
        "rules materialize",
        "MCP install for supported clients",
      ],
    },
    {
      icon: <ReceiptLongIcon color="primary" />,
      title: "Audit Logs and Observability",
      description:
        "Monitor sync operations, rule changes, system events and operational activity through audit logs and product metrics instead of guessing what happened.",
      bullets: [
        "audit logs in the console",
        "GitHub and knowledge sync lifecycle events",
        "operational traceability for teams",
      ],
    },
    {
      icon: <KeyIcon color="primary" />,
      title: "Enterprise Access and Billing Controls",
      description:
        "Run AI usage with tenant isolation, API keys, quotas, usage reporting, plans, billing and SCU metering built into the platform.",
      bullets: [
        "API keys and user-bound auth",
        "usage, quotas and rate limiting",
        "plans, subscriptions and SCU controls",
      ],
    },
  ];

  const proofPoints = [
    {
      icon: <LanIcon color="primary" />,
      title: "Multi-agent by design",
      copy: "Cursor, Claude, VS Code Copilot, Windsurf, OpenCode, Codex and custom MCP clients can share the same source of truth.",
    },
    {
      icon: <SyncIcon color="primary" />,
      title: "Repository-aware operations",
      copy: "Projects, namespaces, repositories and watch settings map the product to how engineering teams really organize code.",
    },
    {
      icon: <QueryStatsIcon color="primary" />,
      title: "Built for production control",
      copy: "From logs and quotas to billing and auditability, Elastra AI is not just retrieval. It is an operating layer for AI software delivery.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#071417",
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

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
          <BrandLockup
            iconSize={64}
            titleVariant="h4"
            titleSize={{ xs: "2rem", md: "2.4rem" }}
            subtitleSize={{ xs: "0.92rem", md: "1rem" }}
            maxWidth={460}
          />
        </Box>

        <Stack spacing={5}>
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              border: "1px solid rgba(0, 198, 184, 0.3)",
              background:
                "linear-gradient(135deg, rgba(0,198,184,0.15) 0%, rgba(0,224,255,0.08) 35%, rgba(13,28,32,0.45) 100%)",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.24)",
            }}
          >
            <Stack spacing={3}>
              <Chip label="Complete Product Capability Map" color="primary" variant="outlined" sx={{ width: "fit-content" }} />
              <Typography variant="h2" sx={{ fontWeight: 900, maxWidth: 980, lineHeight: 1.05 }}>
                Elastra AI gives organizations one control plane for AI agents across rules, skills, commands, context and operational control.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 980 }}>
                This is not just prompt context. Elastra AI lets teams govern agent behavior, update rules and policies, create reusable skills and commands, connect GitHub and keep every workflow observable, consistent and cost-aware.
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid rgba(0,224,255,0.24)",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  maxWidth: 860,
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  Teams using Elastra AI save an average of <Box component="span" sx={{ color: "primary.main" }}>40% of agent tokens</Box> and <Box component="span" sx={{ color: "primary.main" }}>40% of execution time</Box> by cutting repeated context setup and re-discovery work.
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} useFlexGap flexWrap="wrap">
                {[
                  "GitHub App + webhooks",
                  "MCP for many agents",
                  "Skills + commands from the platform",
                  "Rules by user, repo, namespace and project",
                  "Graph + impact + changes",
                  "Audit logs + usage + billing",
                  "CLI init + materialization",
                ].map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(0,198,184,0.18)",
                    }}
                  />
                ))}
              </Stack>
              <Grid container spacing={1.5}>
                {heroStats.map((item) => (
                  <Grid item xs={12} md={6} lg={3} key={item.label}>
                    <Box
                      sx={{
                        px: 2,
                        py: 1.8,
                        height: "100%",
                        borderRadius: 2.5,
                        border: "1px solid rgba(0,198,184,0.18)",
                        backgroundColor: "rgba(10, 24, 27, 0.4)",
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 900, mb: 0.5 }}>
                        {item.value}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>
                        {item.label}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {item.detail}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button size="large" variant="contained" onClick={() => navigate("/signup")}>
                  Start Free
                </Button>
                <Button size="large" variant="outlined" onClick={() => navigate("/plans")}>
                  See Plans
                </Button>
                <Button size="large" variant="text" onClick={() => navigate("/how-it-works")}>
                  See How It Works
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3.5,
              border: "1px solid rgba(0,198,184,0.16)",
              backgroundColor: "rgba(9,21,24,0.62)",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 850, mb: 1.5 }}>
              Core platform foundations
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 980, mb: 3.5 }}>
              Elastra AI centralizes the control surfaces organizations actually need in real software delivery: shared context, code structure, memory, enforceable rules, reusable workflows and policy-aware execution.
            </Typography>
            <Stack spacing={2}>
              {foundation.map((item) => (
                <Box key={item.title}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid rgba(0,198,184,0.16)",
                    backgroundColor: "rgba(9,21,24,0.68)",
                  }}
                >
                  <Grid container spacing={2.5} alignItems="flex-start">
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1.25}>
                        {item.icon}
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {item.title}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Typography color="text.secondary">{item.description}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Stack spacing={0.75}>
                        {item.bullets.map((bullet) => (
                          <Typography key={bullet} variant="body2" color="text.secondary">
                            • {bullet}
                          </Typography>
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3.5,
              border: "1px solid rgba(0,224,255,0.22)",
              background:
                "linear-gradient(135deg, rgba(0,224,255,0.07) 0%, rgba(0,198,184,0.1) 38%, rgba(11,25,28,0.75) 100%)",
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h4" sx={{ fontWeight: 850 }}>
                What makes Elastra AI operational, not just intelligent
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 980 }}>
                The product already includes the control surfaces teams need after the first demo: GitHub-aware sync, layered rules and policies, platform-managed skills and commands, CLI setup, auditability, billing controls and reusable agent workflows.
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3.5,
              border: "1px solid rgba(0,198,184,0.15)",
              backgroundColor: "rgba(8, 18, 21, 0.62)",
            }}
          >
            <Stack spacing={2}>
              {operations.map((item) => (
                <Box
                  key={item.title}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid rgba(0,198,184,0.15)",
                    backgroundColor: "rgba(8, 18, 21, 0.82)",
                  }}
                >
                  <Grid container spacing={2.5} alignItems="flex-start">
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1.25}>
                        {item.icon}
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {item.title}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Typography color="text.secondary">{item.description}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Stack spacing={0.75}>
                        {item.bullets.map((bullet) => (
                          <Typography key={bullet} variant="body2" color="text.secondary">
                            • {bullet}
                          </Typography>
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3.5,
              border: "1px solid rgba(0,198,184,0.14)",
              backgroundColor: "rgba(13,28,32,0.36)",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 850, mb: 1.5 }}>
              Why teams buy this instead of building around raw prompts
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 960, mb: 3 }}>
              Because the hard part is not getting one agent to answer one question. The hard part is controlling many agents, many repositories and many engineers over time with rules, repeatability, traceability and cost discipline.
            </Typography>
            <Stack spacing={2}>
              {proofPoints.map((item) => (
                <Box
                  key={item.title}
                  sx={{
                    p: 3,
                    borderRadius: 2.5,
                    border: "1px solid rgba(0,198,184,0.14)",
                    backgroundColor: "rgba(13,28,32,0.52)",
                  }}
                >
                  <Grid container spacing={2.5} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        {item.icon}
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {item.title}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={9}>
                      <Typography color="text.secondary">{item.copy}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: "1px solid rgba(0,224,255,0.28)",
              backgroundColor: "rgba(0, 198, 184, 0.08)",
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h4" sx={{ fontWeight: 850 }}>
                Ready to operate AI development as a system instead of a collection of chats?
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 900 }}>
                Centralize control, wire GitHub into the loop, give every agent the right rules, policies, skills and commands, and keep execution visible from onboarding to production.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button variant="contained" size="large" onClick={() => navigate("/plans")}>
                  See Plans
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate("/signup")}>
                  Start Free
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default FeaturesPage;
