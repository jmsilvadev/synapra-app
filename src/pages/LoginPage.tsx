import React from "react";
import { Alert, Box, Button, Typography, Paper } from "@mui/material";
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
        backgroundColor: "#ece9e2",
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 720,
          width: "100%",
          borderRadius: 4,
          border: "1px solid rgba(35, 78, 87, 0.12)",
          backgroundColor: "#F7F6F2",
        }}
      >
        <Box
          component="img"
          src={`${process.env.PUBLIC_URL || ""}/synapra_final_logo.svg`}
          alt="Synapra"
          sx={{
            display: "block",
            width: "100%",
            maxWidth: 560,
            mx: "auto",
            mb: 2,
            borderRadius: 2,
          }}
        />
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Faça login para acessar o painel administrativo
        </Typography>
        {loginError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {loginError}
          </Alert>
        )}
        <Button
          fullWidth
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={loginWithGoogle}
          sx={{
            py: 1.5,
            backgroundColor: "#234E57",
            "&:hover": { backgroundColor: "#1d424a" },
          }}
        >
          Entrar com Google
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
