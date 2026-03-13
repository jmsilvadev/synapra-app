import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Menu, Logout } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../i18n";

interface HeaderProps {
  onToggleMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleMenu }) => {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const logoWidth = isMobile ? 140 : 180;

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "background.default", color: "text.primary" }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggleMenu}
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <Box
            component="img"
            src={`${process.env.PUBLIC_URL || ""}/synapra_final_logo.svg`}
            alt="Synapra"
            sx={{
              width: logoWidth,
              height: "auto",
              maxHeight: 48,
              borderRadius: 1,
              display: "block",
            }}
          />
        </Box>
        {user && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box sx={{ mr: 2 }}>
              <LanguageSwitcher compact />
            </Box>
            <Box component="span" sx={{ mr: 2, fontSize: 16, fontWeight: 600 }}>
              {user.name}
            </Box>
            <IconButton color="inherit" onClick={logout} aria-label={t("header.logout")}>
              <Logout />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
