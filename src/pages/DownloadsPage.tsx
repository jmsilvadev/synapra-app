import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Link,
  Grid,
  Alert,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Apple as AppleIcon,
  Computer as WindowsIcon,
  Terminal as LinuxIcon,
} from "@mui/icons-material";
import { useI18n } from "../i18n";
import { apiBaseURL } from "../services/apiClient";
import CommandBlock from "../components/CommandBlock";

const DOWNLOADS = [
  {
    os: "macOS",
    icon: <AppleIcon />,
    architectures: [
      { arch: "arm64 (Apple Silicon)", os: "darwin", archCode: "arm64" },
      { arch: "amd64 (Intel)", os: "darwin", archCode: "amd64" },
    ],
  },
  {
    os: "Linux",
    icon: <LinuxIcon />,
    architectures: [
      { arch: "amd64", os: "linux", archCode: "amd64" },
      { arch: "arm64", os: "linux", archCode: "arm64" },
    ],
  },
  {
    os: "Windows",
    icon: <WindowsIcon />,
    architectures: [
      { arch: "amd64", os: "windows", archCode: "amd64" },
      { arch: "arm64", os: "windows", archCode: "arm64" },
    ],
  },
];

const DownloadsPage: React.FC = () => {
  const { t } = useI18n();

  const handleDownload = (type: "cli" | "mcp", os: string, arch: string) => {
    const token = localStorage.getItem("console_token");
    const url = `${apiBaseURL}/v1/downloads/${type}?os=${os}&arch=${arch}`;

    if (token) {
      window.open(`${url}&token=${token}`, "_blank");
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t("downloads.title")}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {t("downloads.subtitle")}
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("downloads.quick_install")}
          </Typography>
          <CommandBlock lines={[`curl -fsSL ${apiBaseURL}/v1/downloads/install.sh | bash`]} />
          <Alert severity="info" sx={{ mt: 2 }}>
            Requires authentication. Run <code>elastra auth login</code> first.
          </Alert>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        {t("downloads.manual_download")}
      </Typography>

      <Grid container spacing={3}>
        {DOWNLOADS.map((download) => (
          <Grid item xs={12} md={4} key={download.os}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  {download.icon}
                  <Typography variant="h6">{download.os}</Typography>
                </Box>
                {download.architectures.map((arch) => (
                  <Box
                    key={arch.arch}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip label={arch.arch} size="small" variant="outlined" />
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleDownload("cli", arch.os, arch.archCode)}
                    >
                      {t("downloads.download")}
                    </Button>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("downloads.verify")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t("downloads.verify_desc")}
          </Typography>
          <CommandBlock lines={["elastra --version", "elastra-mcp --version"]} />
        </CardContent>
      </Card>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          {t("downloads.older_versions")}{" "}
          <Link href="https://github.com/jmsilvadev/elastra/releases" target="_blank" rel="noopener">
            GitHub Releases
          </Link>
        </Typography>
      </Box>
    </Container>
  );
};

export default DownloadsPage;
