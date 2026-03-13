import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { I18nProvider, useI18n } from "./i18n";
import LoginPage from "./pages/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import RulesPoliciesPage from "./pages/RulesPoliciesPage";
import LogsPage from "./pages/LogsPage";
import SettingsPage from "./pages/SettingsPage";
import ApiIntegrationsPage from "./pages/ApiIntegrationsPage";
import SignupPage from "./pages/SignupPage";
import SignupVerifyPage from "./pages/SignupVerifyPage";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00C6B8" },
    secondary: { main: "#00E0FF" },
    text: {
      primary: "#E6F7F7",
      secondary: "rgba(230, 247, 247, 0.72)",
    },
    background: {
      default: "#071417",
      paper: "#0D1C20",
    },
    divider: "rgba(0, 198, 184, 0.18)",
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(circle at top left, rgba(0, 224, 255, 0.08), transparent 28%), #071417",
          color: "#E6F7F7",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#071417",
          color: "#E6F7F7",
          borderBottom: "1px solid rgba(0, 198, 184, 0.16)",
          boxShadow: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#0A171A",
          color: "#E6F7F7",
          borderRight: "1px solid rgba(0, 198, 184, 0.12)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(0, 198, 184, 0.10)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#0D1C20",
          border: "1px solid rgba(0, 198, 184, 0.10)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: "#00C6B8",
          color: "#031012",
          fontWeight: 700,
          boxShadow: "0 10px 24px rgba(0, 198, 184, 0.20)",
          "&:hover": {
            backgroundColor: "#00B7AB",
          },
        },
        outlined: {
          borderColor: "rgba(0, 198, 184, 0.35)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlinedPrimary: {
          borderColor: "rgba(0, 224, 255, 0.55)",
          color: "#8EF5FF",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#091518",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 198, 184, 0.18)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0, 224, 255, 0.36)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#00C6B8",
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: "4px 10px",
          "&.Mui-selected": {
            backgroundColor: "rgba(0, 198, 184, 0.16)",
            border: "1px solid rgba(0, 224, 255, 0.22)",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "rgba(0, 198, 184, 0.22)",
          },
        },
      },
    },
  },
});

const AppRoutes: React.FC = () => {
  const { user, initializing } = useAuth();
  const { t } = useI18n();

  if (initializing) {
    return <div>{t("app.loading")}</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/verify" element={<SignupVerifyPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="rules-policies" element={<RulesPoliciesPage />} />
        <Route path="api" element={<ApiIntegrationsPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="signup" element={<Navigate to="/dashboard" replace />} />
      <Route path="signup/verify" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <I18nProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
