import React from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { Google as GoogleIcon, PsychologyAlt as PsychologyIcon, AttachMoney as MoneyIcon, Hub as HubIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useI18n } from "../i18n";
import { usePageSeo } from "../hooks/usePageSeo";

const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginError } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  usePageSeo({
    title: "Synapra | AI Agents Knowledge Layer for Enterprise Dev Teams",
    description:
      "Synapra centraliza contexto para agentes de IA em empresas: engenharia com IA, regras e policies, memoria organizacional e produtividade para developers.",
    keywords:
      "agentes de IA, IA para empresas, AI agents platform, enterprise AI, developer tools AI, contexto para LLM, engenharia de software com IA, copilots para devs",
    path: "/",
    imagePath: "/synapra_final_logo.svg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Synapra",
      description:
        "Plataforma para contexto compartilhado de agentes de IA para empresas e times de engenharia.",
      url: `${window.location.origin}/`,
      about: ["AI agents", "Enterprise AI", "Developer productivity"],
    },
  });

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(0, 224, 255, 0.14), transparent 28%), #071417",
        px: 2,
      }}
    >
      <Box sx={{ position: "absolute", top: 20, right: 20 }}>
        <LanguageSwitcher compact />
      </Box>
      <Box
        sx={{
          p: { xs: 3, sm: 2 },
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
        }}
      >
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
            borderRadius: 3,
          }}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<PsychologyIcon />}
            onClick={() => navigate("/features")}
            sx={{ py: 1.5 }}
          >
            {t("login.btn_what_we_solve")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<HubIcon />}
            onClick={() => navigate("/how-it-works")}
            sx={{ py: 1.5 }}
          >
            How Synapra works
          </Button>
          <Button
            variant="outlined"
            startIcon={<MoneyIcon />}
            onClick={() => navigate("/plans")}
            sx={{ py: 1.5 }}
          >
            {t("login.btn_pricing")}
          </Button>
          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={loginWithGoogle}
            sx={{ py: 1.5 }}
          >
            {t("login.google")}
          </Button>
        </Box>

        {loginError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {loginError}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default LoginPage;
