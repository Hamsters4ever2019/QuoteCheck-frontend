"use client";

import { Suspense, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container, Typography, Paper, TextField, Button, Stack, Alert, CircularProgress, Box,
  List, ListItem, ListItemText, IconButton, MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { 
  logActuals, ActualResponse, listExpenseTypes, ExpenseType, 
  getExpenses, addExpense, deleteExpense, QuoteExpense 
} from "../../../lib/api";

function ActualsContent() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [hours, setHours] = useState("");
  const [materials, setMaterials] = useState("");
  const [travel, setTravel] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ActualResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Expense Tracking State ---
  const [actualId, setActualId] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<QuoteExpense[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState<number | "">("");
  const [expenseError, setExpenseError] = useState<string | null>(null);

  // --- Fetch expense types on load ---
  useEffect(() => {
    listExpenseTypes().then(setExpenseTypes).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await logActuals(Number(id), {
        actual_hours: parseFloat(hours),
        actual_materials: parseFloat(materials),
        actual_travel: parseFloat(travel),
      });
      setResult(res);
      
      // Capture the actual_id and fetch any existing expenses
      if (res.actual_id) {
        setActualId(res.actual_id);
        getExpenses(res.actual_id).then(setExpenses).catch(console.error);
      } else {
        setExpenseError("Backend did not return an actual_id. Check log_actuals in main.py.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // --- Helper: rebuild engine_note from fresh numbers ---
  const rebuildNote = (margin: number, quotedMargin: number) => {
    const delta = margin - quotedMargin;
    const direction = delta < 0 ? "worse" : "better";
    return `Your actual margin is ${margin.toFixed(2)}%, ${direction} than the ${quotedMargin.toFixed(2)}% you quoted. Adjusting future quotes.`;
  };

  // --- Expense Handlers ---
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setExpenseError(null);

    if (!actualId) {
      setExpenseError("Actual ID is missing. Please log the actuals above first.");
      return;
    }
    if (!expDesc || !expAmount || selectedTypeId === "") {
      setExpenseError("Please fill in all expense fields.");
      return;
    }
    
    try {
      const res = await addExpense(actualId, {
        expense_type_id: Number(selectedTypeId),
        description: expDesc,
        amount: parseFloat(expAmount),
      });
      
      setExpDesc("");
      setExpAmount("");
      setSelectedTypeId("");
      getExpenses(actualId).then(setExpenses).catch(console.error);

      // --- Update result state with recalculated true figures from backend ---
      if (result && res.actual_cost !== undefined) {
        const newMargin = res.actual_margin ?? result.actual_margin;
        const newDelta = newMargin - result.quoted_margin;
        setResult({
          ...result,
          actual_cost: res.actual_cost,
          actual_profit: res.actual_profit ?? result.actual_profit,
          actual_margin: newMargin,
          delta: newDelta,
          engine_note: rebuildNote(newMargin, result.quoted_margin),
        });
      }
    } catch (err: any) {
      console.error("Add Expense Error:", err);
      setExpenseError(err?.response?.data?.detail ?? err?.message ?? "Failed to add expense. Check backend terminal.");
    }
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!actualId) return;
    try {
      const res = await deleteExpense(expenseId);
      getExpenses(actualId).then(setExpenses);

      // --- Update result state after deletion (cost goes back down) ---
      if (result && res.actual_cost !== undefined) {
        const newMargin = res.actual_margin ?? result.actual_margin;
        const newDelta = newMargin - result.quoted_margin;
        setResult({
          ...result,
          actual_cost: res.actual_cost,
          actual_profit: res.actual_profit ?? result.actual_profit,
          actual_margin: newMargin,
          delta: newDelta,
          engine_note: rebuildNote(newMargin, result.quoted_margin),
        });
      }
    } catch (err: any) {
      console.error("Delete Expense Error:", err);
      setExpenseError(err?.response?.data?.detail ?? "Failed to delete expense.");
    }
  };

  if (result) {
    const deltaPositive = result.delta >= 0;
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
      <>
        <Paper sx={{ p: 3, mb: 2 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Actuals Logged</Typography>
          <Stack spacing={1}>
            <Row label="Actual cost (incl. expenses)" value={`£${result.actual_cost.toFixed(2)}`} />
            <Row label="Actual profit" value={`£${result.actual_profit.toFixed(2)}`} negative={result.actual_profit < 0} />
            <Row label="Actual margin" value={`${result.actual_margin.toFixed(2)}%`} negative={result.actual_margin < 0} />
            <Row label="Quoted margin" value={`${result.quoted_margin.toFixed(2)}%`} />
            <Row label="Delta" value={`${result.delta.toFixed(2)}%`} negative={!deltaPositive} />
          </Stack>
        </Paper>
        
        <Alert severity="info" sx={{ mb: 3 }}>{result.engine_note}</Alert>

        {/* Itemised Expenses Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Itemised Expenses</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Log the real costs to see where the money actually went.
          </Typography>

          {expenseError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setExpenseError(null)}>
              {expenseError}
            </Alert>
          )}

          <form onSubmit={handleAddExpense} style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="expense-type-label">Category</InputLabel>
              <Select
                labelId="expense-type-label"
                id="expense-type"
                value={selectedTypeId}
                label="Category"
                onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                required
              >
                {expenseTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Description" size="small" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} required />
            <TextField
              label="Amount (£)"
              type="number"
              size="small"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
              required
            />
            <Button type="submit" variant="contained" color="primary">Add</Button>
          </form>

          <List>
            {expenses.map((exp) => (
              <ListItem key={exp.id} secondaryAction={
                <IconButton edge="end" onClick={() => handleDeleteExpense(exp.id)}>
                  <DeleteIcon />
                </IconButton>
              }>
                <ListItemText primary={`${exp.description} (${exp.category})`} secondary={`£${exp.amount.toFixed(2)}`} />
              </ListItem>
            ))}
          </List>

          <Typography variant="subtitle1" align="right" sx={{ mt: 2, fontWeight: 'bold' }}>
            Total Itemised Expenses: £{totalExpenses.toFixed(2)}
          </Typography>
        </Paper>

        <Button variant="contained" fullWidth size="large" onClick={() => router.push("/quotes")} sx={{ py: 1.5 }}>
          Back to Quotes
        </Button>
      </>
    );
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Log Actuals
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth required type="number" label="Actual hours"
              value={hours} onChange={(e) => setHours(e.target.value)}
              slotProps={{ htmlInput: { step: "0.5", min: 0 } }}
            />
            <TextField
              fullWidth required type="number" label="Actual materials (£)"
              value={materials} onChange={(e) => setMaterials(e.target.value)}
              slotProps={{ htmlInput: { step: "1", min: 0 } }}
            />
            <TextField
              fullWidth required type="number" label="Actual travel (miles)"
              value={travel} onChange={(e) => setTravel(e.target.value)}
              slotProps={{ htmlInput: { step: "1", min: 0 } }}
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading}>
              {loading ? "Calculating…" : "Log Actuals"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </>
  );
}

export default function ActualsPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 12 }}>
      <Suspense fallback={<CircularProgress />}>
        <ActualsContent />
      </Suspense>
    </Container>
  );
}

function Row({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: negative ? "error.main" : "text.primary" }}>
        {value}
      </Typography>
    </Box>
  );
}