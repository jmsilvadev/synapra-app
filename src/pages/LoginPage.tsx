import React from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { Google as GoogleIcon, PsychologyAlt as PsychologyIcon, AttachMoney as MoneyIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useI18n } from "../i18n";

const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginError } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

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
            maxWidth: 420,
            mx: "auto",
            mb: 3,
            borderRadius: 3,
          }}
        />
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          {t("login.subtitle")}
        </Typography>

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
