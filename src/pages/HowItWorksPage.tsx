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
import SmartToyIcon from "@mui/icons-material/SmartToy";
import HubIcon from "@mui/icons-material/Hub";
import RuleIcon from "@mui/icons-material/Rule";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import DescriptionIcon from "@mui/icons-material/Description";
import BlurOnIcon from "@mui/icons-material/BlurOn";
import GitHubIcon from "@mui/icons-material/GitHub";
import MemoryIcon from "@mui/icons-material/Memory";
import TerminalIcon from "@mui/icons-material/Terminal";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import LanIcon from "@mui/icons-material/Lan";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import BrandLockup from "../components/BrandLockup";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { usePageSeo } from "../hooks/usePageSeo";

const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  usePageSeo({
    title: "How Elastra AI Works | AI Agent Control Plane, Rules, Skills, Commands, Retrieval and MCP",
    description:
      "Understand the Elastra AI control plane: GitHub-aware sync, shared context retrieval across text vectors graph and memory, layered rules and policies, skills and commands, MCP connectivity, observability and enterprise control for AI engineering teams, with average savings of 40% in tokens and 40% in time.",
    keywords:
      "how Elastra AI works, AI agent control plane, AI agent runtime, hybrid retrieval architecture, GitHub webhook sync, MCP server architecture, code graph analysis, engineering rules for AI agents, agent skills and commands, AI developer platform architecture, enterprise AI operations, reduce agent token usage, reduce AI execution time",
    path: "/how-it-works",
    imagePath: "/elastra_og_image.svg",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "How Elastra AI Works",
        description:
          "Technical explanation of Elastra AI as the control plane for AI agents, including sync, indexing, retrieval, rules, policies, skills, commands, graph analysis, GitHub integration and MCP-based agent connectivity, with average savings of 40% in tokens and 40% in time.",
        url: `${window.location.origin}/how-it-works`,
        isPartOf: {
          "@type": "WebSite",
          name: "Elastra AI",
          url: window.location.origin,
        },
        about: [
          "AI agent architecture",
          "GitHub sync pipeline",
          "Hybrid retrieval system",
          "Engineering rules",
          "MCP integrations",
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: "How Elastra AI Works",
        description:
          "Technical breakdown of Elastra AI as the operating control plane for AI software delivery, covering ingestion, graph, memory, rules, policies, skills, commands, GitHub sync and MCP execution.",
        author: {
          "@type": "Organization",
          name: "Elastra AI",
        },
        publisher: {
          "@type": "Organization",
          name: "Elastra AI",
        },
        mainEntityOfPage: `${window.location.origin}/how-it-works`,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How does Elastra AI keep repository knowledge up to date?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Elastra AI uses sync workflows, watch settings, GitHub repository connections, GitHub App installation tokens and webhook-driven updates on pull requests and default-branch pushes to keep knowledge current.",
            },
          },
          {
            "@type": "Question",
            name: "What does Elastra AI control for AI agents?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Elastra AI controls how agents operate by combining shared context, code graph analysis, durable memory, layered rules and policies, reusable skills and commands, and consistent MCP-based execution flows.",
            },
          },
          {
            "@type": "Question",
            name: "How do agents operate through Elastra AI?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Agents connect through MCP tools, CLI-generated configuration and materialized instruction files so teams can enforce consistent behavior, operational rules and reusable workflows across local and hosted environments.",
            },
          },
        ],
      },
    ],
  });

  const agentSurfaces = [
    "Cursor",
    "Claude",
    "VS Code Copilot",
    "Windsurf",
    "OpenCode",
    "Codex",
    "Custom MCP Client",
  ];

  const contextSignals = [
    {
      icon: <BlurOnIcon color="primary" />,
      title: "Vector retrieval",
      copy: "Semantic similarity over indexed chunks for broad relevance discovery.",
    },
    {
      icon: <DescriptionIcon color="primary" />,
      title: "Text retrieval",
      copy: "Deterministic access to code, docs, manifests and explicit project documents.",
    },
    {
      icon: <AccountTreeIcon color="primary" />,
      title: "Graph context",
      copy: "Callers, callees, modules, dependencies and impact paths for architectural grounding.",
    },
    {
      icon: <MemoryIcon color="primary" />,
      title: "Operational memory",
      copy: "Durable engineering decisions, explanations and bug knowledge across sessions.",
    },
    {
      icon: <RuleIcon color="primary" />,
      title: "Layered rules",
      copy: "Organization, project, namespace, repository and user instructions merged into one effective ruleset.",
    },
    {
      icon: <HubIcon color="primary" />,
      title: "Repository topology",
      copy: "Project, namespace and repository relationships preserved so agents can reason across the same delivery surface.",
    },
  ];

  const stages = [
    {
      icon: <GitHubIcon color="primary" />,
      title: "1. Code enters the system",
      description:
        "Repositories are connected manually or via GitHub integration. Sync can be triggered by CLI, watch settings, pull requests, merges or default-branch webhooks.",
      bullets: [
        "GitHub OAuth and GitHub App support",
        "webhook events for PRs and pushes",
        "per-repository watch and sync controls",
      ],
    },
    {
      icon: <HubIcon color="primary" />,
      title: "2. Elastra AI normalizes project structure",
      description:
        "Projects, namespaces and repositories are mapped into a consistent internal model so knowledge stays scoped, queryable and operationally manageable.",
      bullets: [
        "project and namespace isolation",
        "repository-aware metadata",
        "cross-repository project topology manifests",
      ],
    },
    {
      icon: <TravelExploreIcon color="primary" />,
      title: "3. Knowledge is indexed for retrieval",
      description:
        "Files are chunked, stored and enriched so the platform can serve the right execution context without replaying entire repositories into prompts.",
      bullets: [
        "text and semantic indexing",
        "knowledge status and sync visibility",
        "cost-aware context delivery",
      ],
    },
    {
      icon: <AccountTreeIcon color="primary" />,
      title: "4. Structural analysis adds code intelligence",
      description:
        "Graph and analysis layers provide relationships that plain chunk retrieval misses: callers, callees, modules, impact chains, recent changes and summaries.",
      bullets: [
        "graph endpoints and impact analysis",
        "change tracking and summaries",
        "organization-level graph search",
      ],
    },
    {
      icon: <RuleIcon color="primary" />,
      title: "5. Rules are resolved into one effective contract",
      description:
        "Elastra AI merges rules and policies from shared and personal scopes so each agent receives the same engineering contract without manual copy-paste.",
      bullets: [
        "organization to user precedence",
        "effective rules materialization",
        "agent-specific instruction injection",
      ],
    },
    {
      icon: <SmartToyIcon color="primary" />,
      title: "6. Agents execute through MCP and CLI flows",
      description:
        "Agents do not need raw repository dumps or one-off prompting. They operate through Elastra AI for context, graph, memory, rules, skills, commands and execution support when they need them.",
      bullets: [
        "MCP integrations across many clients",
        "CLI init, update and mcp install",
        "skills and commands for repeatable workflows",
      ],
    },
    {
      icon: <QueryStatsIcon color="primary" />,
      title: "7. Operations stay observable and controlled",
      description:
        "Audit logs, sync events, quotas, rate limits, usage reporting and billing controls make AI activity monitorable in production.",
      bullets: [
        "audit logs and sync lifecycle events",
        "usage, quotas and SCU controls",
        "tenant-aware operational governance",
      ],
    },
  ];

  const technicalClaims = [
    "Elastra AI is not only retrieval. It is the control plane for AI software delivery.",
    "The platform narrows context at execution time while keeping agent behavior governed.",
    "GitHub, rules, policies, skills, commands, graph and auditability are part of the same operating surface.",
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
              border: "1px solid rgba(0, 198, 184, 0.28)",
              background:
                "linear-gradient(135deg, rgba(0,198,184,0.14) 0%, rgba(0,224,255,0.06) 45%, rgba(13,28,32,0.45) 100%)",
            }}
          >
            <Stack spacing={2.5}>
              <Chip label="Technical Product Architecture" color="primary" variant="outlined" sx={{ width: "fit-content" }} />
              <Typography variant="h2" sx={{ fontWeight: 900, maxWidth: 1080, lineHeight: 1.05 }}>
                Elastra AI sits between your repositories and your agents so agent behavior becomes controllable, enforceable and operational.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 980 }}>
                Instead of replaying massive prompt history, Elastra AI keeps code, graph structure, memory, rules, policies, skills, commands and GitHub events inside one runtime layer. Agents query that layer through MCP and CLI workflows while organizations control how those agents behave.
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
                  In practice, this operating model saves an average of <Box component="span" sx={{ color: "primary.main" }}>40% in agent token usage</Box> and <Box component="span" sx={{ color: "primary.main" }}>40% in end-to-end execution time</Box>.
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button variant="contained" size="large" onClick={() => navigate("/plans")}>
                  See Plans
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate("/features")}>
                  Explore Features
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3.5,
              border: "1px solid rgba(0,224,255,0.2)",
              backgroundColor: "rgba(7,20,23,0.72)",
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 850, mb: 1.5 }}>
                  Runtime model
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 1080 }}>
                  Repository events and local sync workflows feed Elastra AI. Elastra AI indexes knowledge, resolves graph, rules, policies, skills and commands, then agents execute through that operational state with MCP and CLI-assisted materialization. The result is narrower prompts, stronger consistency and better organizational control.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "1.05fr 1.3fr 1.05fr" },
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Stack spacing={1.5}>
                    <LanIcon color="primary" />
                    <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 1.2 }}>
                      AGENT ENTRY POINTS
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {agentSurfaces.map((agent) => (
                        <Chip
                          key={agent}
                          label={agent}
                          sx={{
                            bgcolor: "rgba(0,224,255,0.06)",
                            border: "1px solid rgba(0,224,255,0.18)",
                          }}
                        />
                      ))}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Agents operate through MCP, CLI and materialized instruction files so organizations can standardize behavior instead of relying on raw prompt replay.
                    </Typography>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    p: 2.75,
                    borderRadius: 3,
                    border: "1px solid rgba(0,224,255,0.26)",
                    background:
                      "linear-gradient(180deg, rgba(0,224,255,0.08) 0%, rgba(0,198,184,0.12) 36%, rgba(10,24,27,0.88) 100%)",
                    boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
                  }}
                >
                  <Stack spacing={1.75}>
                    <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 1.2 }}>
                      SYNAPRA RUNTIME
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 850 }}>
                      The control plane between code and agent execution
                    </Typography>
                    <Grid container spacing={1.25}>
                      {[
                        "Sync + webhooks",
                        "Project + namespace model",
                        "Knowledge + vectors",
                        "Graph + impact",
                        "Memory + audit logs",
                        "Rules + skills + commands",
                      ].map((capability) => (
                        <Grid item xs={12} sm={6} key={capability}>
                          <Box
                            sx={{
                              px: 1.4,
                              py: 1.1,
                              borderRadius: 2,
                              border: "1px solid rgba(255,255,255,0.08)",
                              backgroundColor: "rgba(7,20,23,0.5)",
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {capability}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    <Box
                      sx={{
                        px: 1.6,
                        py: 1.25,
                        borderRadius: 2,
                        border: "1px solid rgba(0,224,255,0.22)",
                        backgroundColor: "rgba(0,0,0,0.14)",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        Average outcome: 40% lower token usage and 40% faster delivery by reducing repeated context reconstruction.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: "1px solid rgba(255,255,255,0.08)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <Stack spacing={1.5}>
                    <GitHubIcon color="primary" />
                    <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800, letterSpacing: 1.2 }}>
                      CODEBASE INPUTS
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      {["GitHub repos", "Pull requests", "Push events", "Docs + rules", "Cross-repo topology"].map((item) => (
                        <Chip
                          key={item}
                          label={item}
                          sx={{
                            bgcolor: "rgba(0,198,184,0.06)",
                            border: "1px solid rgba(0,198,184,0.18)",
                          }}
                        />
                      ))}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      GitHub App installs, sync jobs, watch settings and repository metadata keep the runtime aligned with what changed.
                    </Typography>
                  </Stack>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                  gap: 1.5,
                }}
              >
                {[
                  "Repositories emit changes through sync jobs, PRs and default-branch pushes.",
                  "Elastra AI assembles one operational state from knowledge, graph, memory, rules, policies, skills and commands.",
                  "Agents execute with only the context they need, with observability and control attached.",
                ].map((label) => (
                  <Box
                    key={label}
                    sx={{
                      px: 1.6,
                      py: 1.35,
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,0.08)",
                      backgroundColor: "rgba(13,28,32,0.45)",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3.5,
              border: "1px solid rgba(0,198,184,0.15)",
              backgroundColor: "rgba(9,21,24,0.62)",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 850, mb: 1.5 }}>
              Control signals Elastra AI can combine
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 980, mb: 3 }}>
              Agent behavior is not governed by one prompt or one retrieval method. Elastra AI combines several signals so execution stays narrower, better grounded and easier to control.
            </Typography>
            <Grid container spacing={2.5}>
              {contextSignals.map((signal) => (
                <Grid item xs={12} md={6} xl={4} key={signal.title}>
                  <Box
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 2.5,
                      border: "1px solid rgba(0,198,184,0.15)",
                      backgroundColor: "rgba(10,24,27,0.75)",
                    }}
                  >
                    <Stack spacing={1.25}>
                      {signal.icon}
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {signal.title}
                      </Typography>
                      <Typography color="text.secondary">{signal.copy}</Typography>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
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
            <Typography variant="h4" sx={{ fontWeight: 850, mb: 1.5 }}>
              End-to-end pipeline
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 1000, mb: 3 }}>
              This is the actual product logic at a high level, not a marketing simplification. Each stage reduces ambiguity or operational risk for the next one.
            </Typography>
            <Stack spacing={2}>
              {stages.map((stage) => (
                <Box
                  key={stage.title}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid rgba(0,198,184,0.16)",
                    backgroundColor: "rgba(8, 18, 21, 0.82)",
                  }}
                >
                  <Grid container spacing={2.5} alignItems="flex-start">
                    <Grid item xs={12} md={3}>
                      <Stack spacing={1.25}>
                        {stage.icon}
                        <Typography variant="h6" sx={{ fontWeight: 850 }}>
                          {stage.title}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <Typography color="text.secondary">{stage.description}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Stack spacing={0.75}>
                        {stage.bullets.map((bullet) => (
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
              Technical takeaways
            </Typography>
            <Grid container spacing={2.5}>
              {technicalClaims.map((claim) => (
                <Grid item xs={12} md={4} key={claim}>
                  <Box
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 2.5,
                      border: "1px solid rgba(0,198,184,0.14)",
                      backgroundColor: "rgba(13,28,32,0.52)",
                    }}
                  >
                    <Typography color="text.secondary">{claim}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
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
                Want the system view, not just the feature list?
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 900 }}>
                Elastra AI exists to turn AI tooling into an operational control plane: connected to GitHub, grounded in code structure, governed by rules and policies, extended by skills and commands, and visible through logs, usage and billing controls.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button variant="contained" size="large" onClick={() => navigate("/plans")}>
                  See Plans
                </Button>
                <Button variant="outlined" size="large" onClick={() => navigate("/features")}>
                  Explore Features
                </Button>
                <Button variant="text" size="large" onClick={() => navigate("/signup")}>
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

export default HowItWorksPage;
