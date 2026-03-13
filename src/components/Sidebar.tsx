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
  People,
  Settings,
  AccountBalance,
  History,
  Policy,
  Api,
  Group,
  Receipt,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 280;
const MINI_DRAWER_WIDTH = 80;

interface SidebarProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
}

const menuItems = [
  { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
  { text: "Clientes", icon: <People />, path: "/clients" },
  { text: "Planos", icon: <AccountBalance />, path: "/plans" },
  { text: "Regras & Políticas", icon: <Policy />, path: "/rules-policies" },
  { text: "API/Integrações", icon: <Api />, path: "/api-integrations" },
  { text: "Usuários", icon: <Group />, path: "/users" },
  { text: "Logs", icon: <Receipt />, path: "/logs" },
  { text: "Configurações", icon: <Settings />, path: "/settings" },
];

const Sidebar: React.FC<SidebarProps> = ({ expanded, setExpanded }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

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
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => isMobile && setExpanded(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              {expanded && <ListItemText primary={item.text} />}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
