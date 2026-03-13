import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ClientsPage from "./pages/ClientsPage";
import ClientCreatePage from "./pages/ClientCreatePage";
import PlansPage from "./pages/PlansPage";
import RulesPoliciesPage from "./pages/RulesPoliciesPage";
import ApiIntegrationsPage from "./pages/ApiIntegrationsPage";
import UsersPage from "./pages/UsersPage";
import LogsPage from "./pages/LogsPage";
import SettingsPage from "./pages/SettingsPage";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#234E57" },
    background: {
      default: "#130f10",
      paper: "#1a1617",
    },
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
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/new" element={<ClientCreatePage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="rules-policies" element={<RulesPoliciesPage />} />
        <Route path="api-integrations" element={<ApiIntegrationsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
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
