import React, { useState } from "react";
import { Alert, Container, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ClientForm, { ClientFormData } from "../components/ClientForm";
import { createClient } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import { useAuth } from "../context/AuthContext";

const ClientCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentClientId } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ClientFormData) => {
    setSubmitting(true);
    setError(null);
    try {
      const client = await createClient(data);
      setCurrentClientId(client.id);
      navigate("/clients");
    } catch (err) {
      setError(extractErrorMessage(err, "Falha ao criar cliente"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <ClientForm onSubmit={handleSubmit} submitting={submitting} />
      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ClientCreatePage;
