import React, { useEffect, useState } from "react";
import { Alert, Card, CardContent, CircularProgress, Container, Grid, Typography } from "@mui/material";
import { getPlans } from "../services/adminService";
import { extractErrorMessage } from "../services/apiClient";
import type { Plan } from "../types/admin";

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch((err) => setError(extractErrorMessage(err, "Falha ao carregar planos")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container>
      <Typography variant="h4" sx={{ mb: 3 }}>Planos</Typography>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {loading ? <CircularProgress /> : (
        <Grid container spacing={2}>
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.code}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{plan.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{plan.description}</Typography>
                  <Typography variant="h5" sx={{ mt: 2 }}>
                    {new Intl.NumberFormat("pt-PT", { style: "currency", currency: plan.currency_code }).format(plan.price_cents / 100)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Trial de {plan.trial_days} dias • {plan.billing_cycle}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default PlansPage;
