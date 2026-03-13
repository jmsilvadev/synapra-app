import React from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginError } = useAuth();

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
          Faça login para aceder ao painel da sua organização
        </Typography>
        {loginError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {loginError}
          </Alert>
        )}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, width: "100%" }}>
            <Button
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={loginWithGoogle}
              sx={{
                py: 1.5,
                px: 4,
                minWidth: 280,
                maxWidth: "100%",
                backgroundColor: "#00C6B8",
                color: "#031012",
                "&:hover": {
                  backgroundColor: "#00B7AB",
                },
              }}
            >
              Entrar com Google
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
