import React from "react";
import { Box, Button, Chip, Container, IconButton, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import HubIcon from "@mui/icons-material/Hub";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import RuleIcon from "@mui/icons-material/Rule";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import DescriptionIcon from "@mui/icons-material/Description";
import BlurOnIcon from "@mui/icons-material/BlurOn";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { usePageSeo } from "../hooks/usePageSeo";

const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  usePageSeo({
    title: "How Synapra Works | AI Agents + Vectors, Text, Graphs, Rules",
    description:
      "Veja como o Synapra conecta varios agentes de IA e devolve contexto hibrido com vetores, texto, grafos e regras/policies para times de engenharia.",
    keywords:
      "como funciona agente de IA, arquitetura AI agents, vetores texto grafos IA, contexto hibrido LLM, rules and policies AI, enterprise developer AI",
    path: "/how-it-works",
    imagePath: "/synapra_final_logo.svg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "How Synapra Works",
      description:
        "Fluxo de conexao entre varios agentes de IA e Synapra com contexto hibrido de vetores, texto, grafos e policies.",
      url: `${window.location.origin}/how-it-works`,
      about: ["AI agent architecture", "Vector retrieval", "Knowledge graph", "Policies"],
    },
  });

  const agents = ["Cursor", "Claude", "Copilot", "Devin", "Custom Agent"];

  const contextSignals = [
    { icon: <BlurOnIcon color="primary" />, label: "Vector retrieval" },
    { icon: <DescriptionIcon color="primary" />, label: "Text understanding" },
    { icon: <AccountTreeIcon color="primary" />, label: "Graph relationships" },
    { icon: <RuleIcon color="primary" />, label: "Rules & policies" },
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
        sx={{ display: "block", width: "100%", maxWidth: 520, mx: "auto", mb: 4 }}
      />

      <Stack spacing={4}>
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: "1px solid rgba(0, 198, 184, 0.28)",
            background:
              "linear-gradient(135deg, rgba(0,198,184,0.14) 0%, rgba(0,224,255,0.06) 45%, rgba(13,28,32,0.45) 100%)",
          }}
        >
          <Stack spacing={1.5}>
            <Chip label="Como funciona" color="primary" variant="outlined" sx={{ width: "fit-content" }} />
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              Varios agentes conectados, um contexto compartilhado
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 900 }}>
              Os agentes se conectam ao Synapra, compartilham contexto e recebem respostas unificadas com vetores, texto, grafos, regras e policies.
            </Typography>
          </Stack>
        </Box>

        <Box
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2.5,
            border: "1px solid rgba(0,198,184,0.2)",
            backgroundColor: "rgba(9,21,24,0.6)",
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", lg: "center" }}
            justifyContent="space-between"
          >
            <Stack spacing={1.25} sx={{ width: { xs: "100%", lg: "32%" } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Agentes de IA</Typography>
              {agents.map((agent) => (
                <Box key={agent} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.25, borderRadius: 1.5, border: "1px solid rgba(0,198,184,0.18)", backgroundColor: "rgba(13,28,32,0.55)" }}>
                  <SmartToyIcon color="primary" fontSize="small" />
                  <Typography>{agent}</Typography>
                </Box>
              ))}
            </Stack>

            <Stack direction={{ xs: "row", lg: "column" }} alignItems="center" justifyContent="center" sx={{ width: { xs: "100%", lg: "8%" } }}>
              <ArrowForwardIcon color="primary" />
              <ArrowForwardIcon color="primary" sx={{ opacity: 0.65 }} />
            </Stack>

            <Box sx={{ width: { xs: "100%", lg: "24%" }, p: 2.5, borderRadius: 2, textAlign: "center", border: "1px solid rgba(0,224,255,0.28)", backgroundColor: "rgba(0,198,184,0.08)" }}>
              <HubIcon color="primary" sx={{ fontSize: 36 }} />
              <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>Synapra</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Camada central de contexto compartilhado
              </Typography>
            </Box>

            <Stack direction={{ xs: "row", lg: "column" }} alignItems="center" justifyContent="center" sx={{ width: { xs: "100%", lg: "8%" } }}>
              <ArrowForwardIcon color="primary" />
              <ArrowForwardIcon color="primary" sx={{ opacity: 0.65 }} />
            </Stack>

            <Stack spacing={1.25} sx={{ width: { xs: "100%", lg: "32%" } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Contexto devolvido pelo Synapra</Typography>
              {contextSignals.map((signal) => (
                <Box key={signal.label} sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.25, borderRadius: 1.5, border: "1px solid rgba(0,198,184,0.18)", backgroundColor: "rgba(13,28,32,0.55)" }}>
                  {signal.icon}
                  <Typography>
                    {signal.label === "Vector retrieval" && "Vetores (semantic retrieval)"}
                    {signal.label === "Text understanding" && "Texto (documentos e codigo)"}
                    {signal.label === "Graph relationships" && "Grafos (relacoes e dependencias)"}
                    {signal.label === "Rules & policies" && "Regras e policies"}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Box
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: 2.5,
            border: "1px solid rgba(0,198,184,0.2)",
            backgroundColor: "rgba(13,28,32,0.55)",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Fluxo resumido
          </Typography>
          <Stack spacing={1.5}>
            <Typography color="text.secondary"><strong>1.</strong> Agentes conectam no Synapra via MCP.</Typography>
            <Typography color="text.secondary"><strong>2.</strong> Synapra agrega sinais de vetores, texto, grafos e regras/policies da organizacao.</Typography>
            <Typography color="text.secondary"><strong>3.</strong> O agente recebe contexto unico, consistente e pronto para execucao.</Typography>
          </Stack>
        </Box>

        <Button variant="contained" onClick={() => navigate("/plans")}>VEJA NOSSOS PLANOS</Button>
      </Stack>
      </Container>
    </Box>
  );
};

export default HowItWorksPage;
