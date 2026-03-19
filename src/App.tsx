import React, { useEffect, useMemo } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { AuthProvider, hasSeenGettingStarted, markGettingStartedSeen, useAuth } from "./context/AuthContext";
import { I18nProvider, useI18n } from "./i18n";
import LoginPage from "./pages/LoginPage";
import PlansPage from "./pages/PlansPage";
import FeaturesPage from "./pages/FeaturesPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import RulesPoliciesPage from "./pages/RulesPoliciesPage";
import LogsPage from "./pages/LogsPage";
import SettingsPage from "./pages/SettingsPage";
import RepositoriesPage from "./pages/RepositoriesPage";
import ProjectsPage from "./pages/ProjectsPage";
import NamespacesPage from "./pages/NamespacesPage";
import ApiIntegrationsPage from "./pages/ApiIntegrationsPage";
import SignupPage from "./pages/SignupPage";
import SignupVerifyPage from "./pages/SignupVerifyPage";
import InviteAcceptPage from "./pages/InviteAcceptPage";
import AuthCliPage from "./pages/AuthCliPage";
import GettingStartedPage from "./pages/GettingStartedPage";
import DownloadsPage from "./pages/DownloadsPage";
import OrganizationKnowledgePage from "./pages/OrganizationKnowledgePage";
import MembersPage from "./pages/MembersPage";
import SkillsPage from "./pages/SkillsPage";
import CommandsPage from "./pages/CommandsPage";

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
          background: "#071417",
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
          backgroundColor: "#0033B3",
          color: "#FFFFFF",
          fontWeight: 700,
          boxShadow: "0 10px 24px rgba(0, 51, 179, 0.28)",
          "&:hover": {
            backgroundColor: "#002A94",
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
  const { user, currentOrganizationId, initializing } = useAuth();
  const { t } = useI18n();

  if (initializing) {
    return <div>{t("app.loading")}</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/verify" element={<SignupVerifyPage />} />
        <Route path="/auth/invite" element={<InviteAcceptPage />} />
        <Route path="/auth/cli" element={<AuthCliPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  const organizationId = currentOrganizationId || user.organization_id;
  const isViewer = String(user.role || "").toLowerCase() === "viewer";
  const defaultAuthenticatedRoute = useMemo(
    () => {
      if (isViewer) {
        return "/knowledge";
      }
      return hasSeenGettingStarted(user.id, organizationId) ? "/knowledge" : "/getting-started";
    },
    [isViewer, organizationId, user.id]
  );

  useEffect(() => {
    if (defaultAuthenticatedRoute === "/getting-started") {
      markGettingStartedSeen(user.id, organizationId);
    }
  }, [defaultAuthenticatedRoute, organizationId, user.id]);

  return (
    <Routes>
      <Route path="/auth/invite" element={<InviteAcceptPage />} />
      <Route path="/auth/cli" element={<AuthCliPage />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to={defaultAuthenticatedRoute} replace />} />
        {!isViewer && <Route path="dashboard" element={<DashboardPage />} />}
        {!isViewer && <Route path="projects" element={<ProjectsPage />} />}
        {!isViewer && <Route path="namespaces" element={<NamespacesPage />} />}
        <Route path="rules-policies" element={<RulesPoliciesPage />} />
        <Route path="api" element={<ApiIntegrationsPage />} />
        {!isViewer && <Route path="logs" element={<LogsPage />} />}
        {!isViewer && <Route path="settings" element={<SettingsPage />} />}
        {!isViewer && <Route path="repositories" element={<RepositoriesPage />} />}
        {!isViewer && <Route path="skills" element={<SkillsPage />} />}
        {!isViewer && <Route path="commands" element={<CommandsPage />} />}
        <Route path="knowledge" element={<OrganizationKnowledgePage />} />
        <Route path="getting-started" element={<GettingStartedPage />} />
        <Route path="downloads" element={<DownloadsPage />} />
        {!isViewer && <Route path="members" element={<MembersPage />} />}
        {!isViewer && <Route path="plans" element={<PlansPage />} />}
        {!isViewer && <Route path="features" element={<FeaturesPage />} />}
        {!isViewer && <Route path="how-it-works" element={<HowItWorksPage />} />}
        {isViewer && <Route path="*" element={<Navigate to="/knowledge" replace />} />}
      </Route>
      <Route path="plans" element={<PlansPage />} />
      <Route path="features" element={<FeaturesPage />} />
      <Route path="how-it-works" element={<HowItWorksPage />} />
      <Route path="signup" element={<Navigate to={defaultAuthenticatedRoute} replace />} />
      <Route path="signup/verify" element={<Navigate to={defaultAuthenticatedRoute} replace />} />
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
