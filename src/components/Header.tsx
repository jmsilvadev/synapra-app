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
import BrandLockup from "./BrandLockup";
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

  return (
    <AppBar
      position="static"
      sx={{ backgroundColor: "background.default", color: "text.primary" }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onToggleMenu}
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>
        <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", height: "100%" }}>
          <Box sx={{ my: "auto" }}>
            <BrandLockup
              align="left"
              layout="row"
              iconSize={isMobile ? 36 : 40}
              framedIcon
              titleVariant="h6"
              titleSize={isMobile ? "1.35rem" : "1.5rem"}
              subtitleSize={isMobile ? "0.68rem" : "0.78rem"}
              titleColor="text.primary"
              maxWidth={isMobile ? 250 : 320}
            />
          </Box>
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
