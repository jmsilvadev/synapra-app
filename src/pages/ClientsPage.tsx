import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const ClientsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Clientes</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/clients/new")}
        >
          Novo Cliente
        </Button>
      </Box>
      <Typography variant="body1">
        Lista de clientes será implementada aqui.
      </Typography>
    </Container>
  );
};

export default ClientsPage;