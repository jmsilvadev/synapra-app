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
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../i18n";

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
  const menuItems = [
    { text: t("sidebar.dashboard"), icon: <Dashboard />, path: "/dashboard" },
    { text: t("sidebar.rules"), icon: <Policy />, path: "/rules-policies" },
    { text: t("sidebar.api"), icon: <Api />, path: "/api" },
    { text: t("sidebar.logs"), icon: <Receipt />, path: "/logs" },
    { text: t("sidebar.settings"), icon: <Settings />, path: "/settings" },
  ];

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
        {menuItems.map((item) => (
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
