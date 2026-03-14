import React from "react";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/")} sx={{ mb: 4 }}>
        Back to Login
      </Button>
      
      <Stack spacing={4}>
        <Box>
          <Typography variant="h3" gutterBottom>
            How It Works
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Get started with Synapra in three simple steps
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: "50%", 
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Typography variant="h5">1</Typography>
              </Box>
              <Typography variant="h5">Add Your Code</Typography>
              <Typography color="text.secondary">
                Sync your repositories to Synapra. We'll index your code, documentation, 
                and knowledge bases automatically.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: "50%", 
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Typography variant="h5">2</Typography>
              </Box>
              <Typography variant="h5">Ask Questions</Typography>
              <Typography color="text.secondary">
                Ask questions in natural language. Synapra understands your codebase 
                and provides context-aware answers.
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: "50%", 
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Typography variant="h5">3</Typography>
              </Box>
              <Typography variant="h5">Save Time & Tokens</Typography>
              <Typography color="text.secondary">
                Get instant answers without reading through dozens of files. 
                Reduce LLM costs by up to 80% with smart context retrieval.
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Bootstrap Your Project
          </Typography>
          <Typography color="text.secondary">
            Once logged in, generate a bootstrap script for your project. 
            The script will set up AGENTS.md with project-specific context that AI agents can use.
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
};

export default HowItWorksPage;
