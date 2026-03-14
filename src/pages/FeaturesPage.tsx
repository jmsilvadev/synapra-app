import React from "react";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import HubIcon from "@mui/icons-material/Hub";
import RuleIcon from "@mui/icons-material/Rule";
import SavingsIcon from "@mui/icons-material/Savings";
import SyncIcon from "@mui/icons-material/Sync";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/")} sx={{ mb: 4 }}>
        Back to Login
      </Button>
      
      <Stack spacing={4}>
        <Box>
          <Typography variant="h3" gutterBottom>
            AI Agents Knowledge Layer
          </Typography>
          <Typography variant="h6" color="text.secondary">
            The shared knowledge layer for all AI agents in your organization
          </Typography>
        </Box>

        <Box sx={{ 
          p: 4, 
          borderRadius: 2, 
          backgroundColor: "rgba(0, 198, 184, 0.1)",
          border: "1px solid rgba(0, 198, 184, 0.3)"
        }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <HubIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" gutterBottom>
                One Knowledge Source, Multiple Agents
              </Typography>
              <Typography color="text.secondary">
                Synapra acts as a central knowledge hub that all your AI agents connect to. 
                Instead of each agent carrying the same context, they all query Synapra for shared knowledge, 
                rules, and patterns. This eliminates redundant context consumption across your organization.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SavingsIcon color="primary" />
                <Typography variant="h6">Token Savings</Typography>
              </Stack>
              <Typography color="text.secondary">
                Reduce LLM costs by up to 80%. Each query pulls only the relevant context 
                instead of repeating the same information across all agent sessions.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <RuleIcon color="primary" />
                <Typography variant="h6">Standardized Patterns</Typography>
              </Stack>
              <Typography color="text.secondary">
                Define coding standards, architectural patterns, and best practices once. 
                All developers and AI agents follow the same rules across the organization.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SyncIcon color="primary" />
                <Typography variant="h6">Shared Context</Typography>
              </Stack>
              <Typography color="text.secondary">
                Knowledge is indexed once and shared across all agents. 
                No more duplicated context in every conversation.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PsychologyAltIcon color="primary" />
                <Typography variant="h6">Context-Aware</Typography>
              </Stack>
              <Typography color="text.secondary">
                Agents understand your codebase, patterns, and rules. 
                Get relevant answers without explaining your context every time.
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            How It Works
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: "50%", 
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>1</Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Define Your Knowledge</Typography>
                <Typography color="text.secondary">
                  Add repositories, docs, and define coding rules and patterns for your organization.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: "50%", 
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>2</Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Agents Connect to Synapra</Typography>
                <Typography color="text.secondary">
                  All AI agents (Devin, Cursor, Claude, custom agents) query Synapra for context instead of carrying all context themselves.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: "50%", 
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}>3</Box>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Save Tokens & Maintain Standards</Typography>
                <Typography color="text.secondary">
                  Agents get the right context when they need it, following your organization's patterns. 
                  Massive token savings, consistent code quality.
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
};

export default FeaturesPage;
