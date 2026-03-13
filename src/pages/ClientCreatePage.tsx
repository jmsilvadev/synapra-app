import React from "react";
import { Container } from "@mui/material";
import ClientForm from "../components/ClientForm";

const ClientCreatePage: React.FC = () => {
  const handleSubmit = (data: any) => {
    console.log("Criando cliente:", data);
    // TODO: Implementar API call
  };

  return (
    <Container>
      <ClientForm onSubmit={handleSubmit} />
    </Container>
  );
};

export default ClientCreatePage;