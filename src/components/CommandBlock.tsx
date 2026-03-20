import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { ContentCopy as CopyIcon, Check as CheckIcon } from "@mui/icons-material";
import { useI18n } from "../i18n";

type CommandBlockProps = {
  lines: string[];
  sx?: Record<string, unknown>;
};

const CommandBlock: React.FC<CommandBlockProps> = ({ lines, sx }) => {
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy command", error);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "action.hover",
        p: 2,
        borderRadius: 1,
        fontFamily: "monospace",
        fontSize: "0.875rem",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 2,
        ...sx,
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {lines.map((line, index) => (
          <Box key={`${line}-${index}`} sx={{ color: "primary.main", mt: index === 0 ? 0 : 1, wordBreak: "break-all" }}>
            {line}
          </Box>
        ))}
      </Box>
      <Tooltip title={copied ? "Copied" : t("common.copy")}>
        <IconButton size="small" onClick={handleCopy} aria-label={t("common.copy")}>
          {copied ? <CheckIcon fontSize="small" /> : <CopyIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default CommandBlock;
