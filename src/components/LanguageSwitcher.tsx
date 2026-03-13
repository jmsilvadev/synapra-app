import React from "react";
import { MenuItem, TextField } from "@mui/material";
import { AppLanguage, getLanguageOptions, useI18n } from "../i18n";

type LanguageSwitcherProps = {
  compact?: boolean;
};

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { language, setLanguage } = useI18n();

  return (
    <TextField
      select
      size="small"
      value={language}
      onChange={(event) => setLanguage(event.target.value as AppLanguage)}
      sx={{
        minWidth: compact ? 82 : 110,
        "& .MuiOutlinedInput-input": {
          py: compact ? 0.75 : 1,
          fontSize: compact ? 13 : 14,
          fontWeight: 700,
          letterSpacing: "0.08em",
        },
      }}
    >
      {getLanguageOptions().map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default LanguageSwitcher;
