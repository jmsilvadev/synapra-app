import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  FormControl,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Menu, Logout } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onToggleMenu: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleMenu }) => {
  const { user, logout, session, currentClientId, setCurrentClientId } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const iconSize = isMobile ? 40 : 44;

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#F7F6F2",
        color: "#234E57",
        boxShadow: "0 1px 0 rgba(35, 78, 87, 0.12)",
      }}
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
            src={`${process.env.PUBLIC_URL || ""}/synapra_icone_vazado.svg`}
            alt="Synapra"
            sx={{
              width: iconSize,
              height: iconSize,
              borderRadius: 1.5,
              display: "block",
            }}
          />
          {session && session.memberships.length > 0 && (
            <FormControl size="small" sx={{ ml: 2, minWidth: 220 }}>
              <Select
                value={currentClientId || ""}
                onChange={(event) => setCurrentClientId(event.target.value || null)}
              >
                {session.memberships
                  .filter((membership) => membership.active)
                  .map((membership) => (
                    <MenuItem key={membership.organization_id} value={membership.organization_id}>
                      {membership.organization_name || membership.organization_id}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
        </Box>
        {user && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box component="span" sx={{ mr: 2, fontSize: 16, fontWeight: 600 }}>
              {user.name}
            </Box>
            <IconButton color="inherit" onClick={logout}>
              <Logout />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
