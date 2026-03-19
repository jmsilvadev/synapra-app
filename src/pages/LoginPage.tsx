import React from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import {
  GitHub as GitHubIcon,
  Google as GoogleIcon,
  PsychologyAlt as PsychologyIcon,
  AttachMoney as MoneyIcon,
  Hub as HubIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BrandLockup from "../components/BrandLockup";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useI18n } from "../i18n";
import { usePageSeo } from "../hooks/usePageSeo";

const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithGithub, loginError } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  usePageSeo({
    title: "Elastra | The control plane for AI agents",
    description:
      "Elastra e o control plane para agentes de IA em empresas: regras e policies, skills e commands, contexto compartilhado, memoria organizacional e reducao de custo operacional.",
    keywords:
      "agentes de IA, AI agent control plane, IA para empresas, AI agents platform, enterprise AI, developer tools AI, regras e policies para agentes, skills e commands, contexto para LLM, engenharia de software com IA",
    path: "/",
    imagePath: "/elastra_og_image.svg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Elastra",
      description:
        "Plataforma de controle para agentes de IA em empresas e times de engenharia.",
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
        background: "#071417",
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
        <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
          <BrandLockup
            iconSize={58}
            titleVariant="h4"
            titleSize={{ xs: "2rem", sm: "2.25rem" }}
            subtitleSize={{ xs: "0.92rem", sm: "1rem" }}
            maxWidth={420}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.25 }}>
              Organizations do not buy context alone.
            </Typography>
            <Typography color="text.secondary">
              They buy control, consistency and cost reduction. Context is part of how you deliver that.
            </Typography>
          </Box>
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
            How Elastra works
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
          <Button
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={loginWithGithub}
            sx={{ py: 1.5 }}
          >
            {t("login.github", { defaultValue: "Continue with GitHub" })}
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
