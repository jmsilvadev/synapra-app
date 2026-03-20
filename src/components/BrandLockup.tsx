import React from "react";
import { Box, Stack, Typography } from "@mui/material";

type BrandLockupProps = {
  align?: "left" | "center";
  layout?: "row" | "column";
  iconSize?: number;
  framedIcon?: boolean;
  titleVariant?: "h4" | "h5" | "h6";
  titleSize?: string | number | Record<string, string>;
  subtitleSize?: string | number | Record<string, string>;
  titleColor?: string;
  subtitleColor?: string;
  maxWidth?: number | string;
};

const BrandLockup: React.FC<BrandLockupProps> = ({
  align = "center",
  layout = "column",
  iconSize = 52,
  framedIcon = false,
  titleVariant = "h5",
  titleSize,
  subtitleSize = "0.95rem",
  titleColor = "#F5FFFE",
  subtitleColor = "text.secondary",
  maxWidth,
}) => {
  const textAlign = align;
  const resolvedIconSize = layout === "column" ? iconSize * 3 : iconSize;

  return (
    <Stack
      direction={layout}
      spacing={layout === "column" ? -0.6 : 1.5}
      alignItems="center"
      justifyContent={align === "left" ? "flex-start" : "center"}
      sx={{ width: "100%", maxWidth }}
    >
      <Box
        sx={{
          width: resolvedIconSize,
          height: resolvedIconSize,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: framedIcon ? "18px" : 0,
          backgroundColor: framedIcon ? "rgba(226, 232, 240, 0.12)" : "transparent",
          border: framedIcon ? "1px solid rgba(226, 232, 240, 0.16)" : "none",
          boxShadow: framedIcon ? "inset 0 1px 0 rgba(255, 255, 255, 0.04)" : "none",
          p: framedIcon ? 0.55 : 0,
        }}
      >
        <Box
          component="img"
          src={`${process.env.PUBLIC_URL || ""}/logo_only.svg`}
          alt="Elastra AI"
          sx={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "cover",
            transform:
              layout === "column"
                ? "scale(1.55)"
                : framedIcon
                  ? "scale(1.34, 1.6) translateY(6%)"
                  : "scale(1.35)",
            transformOrigin: "center",
          }}
        />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant={titleVariant}
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            letterSpacing: "0.08em",
            lineHeight: 1,
            mt: layout === "column" ? -2.8 : 0,
            color: titleColor,
            fontSize: titleSize,
            textAlign,
            transform: layout === "column" ? "scaleY(0.9)" : "none",
            transformOrigin: "top center",
          }}
        >
          Elastra AI
        </Typography>
        <Typography
          sx={{
            mt: layout === "column" ? 0.1 : 0.45,
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            lineHeight: 1.2,
            color: subtitleColor,
            fontSize: subtitleSize,
            textAlign,
            whiteSpace: layout === "row" ? "nowrap" : "normal",
          }}
        >
          The control plane for AI agents.
        </Typography>
      </Box>
    </Stack>
  );
};

export default BrandLockup;
