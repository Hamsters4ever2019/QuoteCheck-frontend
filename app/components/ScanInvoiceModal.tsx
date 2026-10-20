"use client";

import React, { useState, useRef } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, IconButton, TextField, Stack, Alert, CircularProgress, Divider
} from "@mui/material";
import { CameraAlt, Delete, CheckCircle, Add } from "@mui/icons-material";

// Updated with your new tunnel URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface ScanInvoiceModalProps {
  quoteId: number;
  onConfirm: (newMaterialsTotal: number) => void;
}

export default function ScanInvoiceModal({ quoteId, onConfirm }: ScanInvoiceModalProps) {
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [invoiceId, setInvoiceId] = useState<number | null>(null);
  const [supplierName, setSupplierName] = useState("");
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [lines, setLines] = useState<{ description: string; quantity: number; unit_price: number }[]>([]);
  const [priceWarnings, setPriceWarnings] = useState<any[]>([]); // NEW: Price Creep State
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);
    setPriceWarnings([]); // Reset warnings on new scan
    
    const token = localStorage.getItem("qc_token");
    console.log(`Attempting to upload to: ${API_BASE}/invoices/scan?quote_id=${quoteId}`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE}/invoices/scan?quote_id=${quoteId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}` 
        },
        body: formData,
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errData = await response.json();
        console.error("Backend error:", errData);
        throw new Error(errData.detail || "Failed to read invoice");
      }

      const data = await response.json();
      console.log("OCR Data received:", data);
      
      setInvoiceId(data.invoice_id);
      setSupplierName(data.supplier_matched);
      setInvoiceTotal(data.total_extracted || 0);
      
      if (data.line_items && data.line_items.length > 0) {
        setLines(data.line_items);
      } else {
        setLines([{ 
          description: data.supplier_matched + " Materials", 
          quantity: 1, 
          unit_price: data.total_extracted || 0 
        }]);
      }
      
      setOpen(true);
      
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const addLine = () => setLines([...lines, { description: "", quantity: 1, unit_price: 0 }]);
  const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));

  const calculatedTotal = lines.reduce((sum, line) => sum + (line.quantity * line.unit_price), 0);

  const handleSaveLines = async () => {
    if (!invoiceId) return;
    setIsScanning(true);
    
    const token = localStorage.getItem("qc_token");
    console.log(`Saving lines to: ${API_BASE}/invoices/${invoiceId}/lines`);

    try {
      const response = await fetch(`${API_BASE}/invoices/${invoiceId}/lines`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(lines),
      });

      if (!response.ok) throw new Error("Failed to save lines");

      const data = await response.json();
      console.log("Save response:", data);

      // 1. Update the parent component immediately so the background dashboard refreshes
      onConfirm(calculatedTotal);

      // 2. Check for price creep
      if (data.price_warnings && data.price_warnings.length > 0) {
        setPriceWarnings(data.price_warnings);
        // Do NOT close the modal yet. Let Pete read the warning.
      } else {
        // No warnings? Close as normal.
        setOpen(false);
      }
      
    } catch (err: any) {
      console.error("Save error:", err);
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPriceWarnings([]); // Ensure state is clean for next time
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      
      <Button
        variant="outlined"
        color="secondary"
        startIcon={isScanning ? <CircularProgress size={20} /> : <CameraAlt />}
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        sx={{ whiteSpace: "nowrap" }}
      >
        {isScanning ? "Scanning..." : "Scan Receipt"}
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {priceWarnings.length > 0 ? "Price Creep Warning" : "Confirm Receipt Lines"}
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {/* --- PRICE CREEP WARNING --- */}
          {priceWarnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                ⚠️ Price Creep Detected!
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {priceWarnings.map((w, i) => (
                  <li key={i}>
                    <strong>{w.item}</strong> is up {w.pct_increase}% (was £{w.old_price}, now £{w.new_price})
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Only show the form if there are NO warnings pending acknowledgement */}
          {priceWarnings.length === 0 ? (
            <>
              <Box sx={{ mb: 3, p: 2, bgcolor: "#f8fafc", borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">SUPPLIER</Typography>
                <Typography variant="body1" fontWeight="bold">{supplierName}</Typography>
              </Box>

              <Stack spacing={2}>
                {lines.map((line, index) => (
                  <Box key={index} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <TextField
                      label="Item Description"
                      size="small"
                      fullWidth
                      value={line.description}
                      onChange={(e) => handleLineChange(index, "description", e.target.value)}
                    />
                    <TextField
                      label="Qty"
                      type="number"
                      size="small"
                      sx={{ width: 80 }}
                      value={line.quantity}
                      onChange={(e) => handleLineChange(index, "quantity", parseFloat(e.target.value) || 0)}
                    />
                    <TextField
                      label="Price (£)"
                      type="number"
                      size="small"
                      sx={{ width: 100 }}
                      value={line.unit_price}
                      onChange={(e) => handleLineChange(index, "unit_price", parseFloat(e.target.value) || 0)}
                    />
                    <IconButton color="error" onClick={() => removeLine(index)} disabled={lines.length === 1}>
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
              </Stack>

              <Button startIcon={<Add />} onClick={addLine} sx={{ mt: 2 }}>
                Add Missing Item
              </Button>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6" color="primary.main">
                  £{calculatedTotal.toFixed(2)}
                </Typography>
              </Box>
            </>
          ) : (
             <Typography variant="body1" color="text.secondary" sx={{ py: 2 }}>
               The receipt has been saved and your job costs have been updated to reflect these new prices.
             </Typography>
          )}

        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {priceWarnings.length > 0 ? (
            <Button 
              onClick={handleClose} 
              variant="contained" 
              color="warning"
              fullWidth
            >
              Acknowledge & Close
            </Button>
          ) : (
            <>
              <Button onClick={handleClose} disabled={isScanning}>Cancel</Button>
              <Button 
                onClick={handleSaveLines} 
                variant="contained" 
                color="primary"
                startIcon={<CheckCircle />}
                disabled={isScanning || calculatedTotal === 0}
              >
                Confirm & Update Cost
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}