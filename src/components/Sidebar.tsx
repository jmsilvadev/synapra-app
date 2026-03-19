import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Dashboard,
  Settings,
  Policy,
  Api,
  Receipt,
  GitHub,
  Hub,
  Folder,
  Storage,
  PlayArrow,
  Download as DownloadIcon,
  People as PeopleIcon,
  AutoAwesome,
  Terminal,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = 280;
const MINI_DRAWER_WIDTH = 80;

interface SidebarProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, setExpanded }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const { t } = useI18n();
  const { user } = useAuth();
  const isViewer = String(user?.role || "").toLowerCase() === "viewer";
  const menuItems = [
    { text: t("sidebar.knowledge", { defaultValue: "Knowledge" }), icon: <Hub />, path: "/knowledge" },
    { text: t("sidebar.getting_started", { defaultValue: "Getting Started" }), icon: <PlayArrow />, path: "/getting-started" },
    { text: t("sidebar.downloads", { defaultValue: "Downloads" }), icon: <DownloadIcon />, path: "/downloads" },
    { text: t("sidebar.dashboard"), icon: <Dashboard />, path: "/dashboard" },
    { text: t("sidebar.projects", { defaultValue: "Projects" }), icon: <Folder />, path: "/projects" },
    { text: t("sidebar.namespaces", { defaultValue: "Namespaces" }), icon: <Storage />, path: "/namespaces" },
    { text: t("sidebar.repositories"), icon: <GitHub />, path: "/repositories" },
    { text: t("sidebar.skills", { defaultValue: "Skills" }), icon: <AutoAwesome />, path: "/skills" },
    { text: t("sidebar.commands", { defaultValue: "Commands" }), icon: <Terminal />, path: "/commands" },
    { text: t("sidebar.rules"), icon: <Policy />, path: "/rules-policies" },
    { text: t("sidebar.members", { defaultValue: "Members" }), icon: <PeopleIcon />, path: "/members" },
    { text: t("sidebar.api"), icon: <Api />, path: "/api" },
    { text: t("sidebar.logs"), icon: <Receipt />, path: "/logs" },
    { text: t("sidebar.settings"), icon: <Settings />, path: "/settings" },
  ];

  const visibleMenuItems = isViewer
    ? menuItems.filter((item) => ["/knowledge", "/getting-started", "/downloads", "/api", "/rules-policies"].includes(item.path))
    : menuItems;

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? expanded : true}
      onClose={() => setExpanded(false)}
      sx={{
        width: expanded ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: expanded ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "#0A171A",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        },
      }}
    >
      <List sx={{ pt: 2 }}>
        {visibleMenuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => isMobile && setExpanded(false)}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? "#00E0FF" : "rgba(230, 247, 247, 0.72)" }}>
                {item.icon}
              </ListItemIcon>
              {expanded && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
