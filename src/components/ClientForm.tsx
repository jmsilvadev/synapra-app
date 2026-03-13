import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  MenuItem,
} from "@mui/material";

const schema = yup.object({
  name: yup.string().required("Nome é obrigatório"),
  plan: yup.string().oneOf(["starter", "pro", "enterprise"]).required("Plano é obrigatório"),
});

export interface ClientFormData {
  name: string;
  plan: string;
}

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => Promise<void> | void;
  initialData?: Partial<ClientFormData>;
  isEditing?: boolean;
  submitting?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
  onSubmit,
  initialData = {},
  isEditing = false,
  submitting = false,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: initialData.name || "",
      plan: initialData.plan || "starter",
    },
  });

  return (
    <Paper sx={{ p: 3, maxWidth: 640, mx: "auto", backgroundColor: "background.paper" }}>
      <Typography variant="h5" gutterBottom>
        {isEditing ? "Editar Cliente" : "Novo Cliente"}
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nome do cliente"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="plan"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Plano inicial"
                  error={!!errors.plan}
                  helperText={errors.plan?.message}
                >
                  <MenuItem value="starter">Starter</MenuItem>
                  <MenuItem value="pro">Pro</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" fullWidth disabled={submitting}>
              {submitting ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ClientForm;
