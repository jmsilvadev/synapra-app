import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import ClientsPage from "./pages/ClientsPage";
import ClientCreatePage from "./pages/ClientCreatePage";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1976d2" },
  },
});

const AppRoutes: React.FC = () => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<div>Dashboard Page</div>} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/new" element={<ClientCreatePage />} />
        <Route path="plans" element={<div>Planos Page</div>} />
        <Route path="rules-policies" element={<div>Regras & Políticas Page</div>} />
        <Route path="api-integrations" element={<div>API/Integrações Page</div>} />
        <Route path="users" element={<div>Usuários Page</div>} />
        <Route path="logs" element={<div>Logs Page</div>} />
        <Route path="settings" element={<div>Configurações Page</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
