import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Re-use your existing styles, but add a few for the expenses and totals
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: "#0f3d3e" },
  businessName: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#0f3d3e", marginBottom: 2 },
  businessTagline: { fontSize: 9, color: "#666", marginBottom: 6, fontStyle: "italic" },
  businessLine: { fontSize: 8, color: "#444", marginBottom: 1 },
  invoiceLabel: { fontSize: 8, color: "#666", textAlign: "right", letterSpacing: 1 },
  invoiceNumber: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right", color: "#c0392b", marginBottom: 4 }, // Red for Invoice
  invoiceDate: { fontSize: 9, textAlign: "right", color: "#444", marginBottom: 1 },
  clientBlock: { backgroundColor: "#f8fafc", padding: 12, borderRadius: 4, marginBottom: 20 },
  clientName: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  clientLine: { fontSize: 9, color: "#444", marginBottom: 1 },
  table: { marginBottom: 16 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#0f3d3e", paddingBottom: 4, marginBottom: 6 },
  tableHeaderText: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#0f3d3e", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
  tableRowTotal: { flexDirection: "row", paddingVertical: 8, borderTopWidth: 2, borderTopColor: "#0f3d3e", marginTop: 4 },
  tableLabel: { flex: 3, fontSize: 10 },
  tableValue: { flex: 1, fontSize: 10, textAlign: "right" },
  tableValueBold: { flex: 1, fontSize: 14, textAlign: "right", fontFamily: "Helvetica-Bold", color: "#0f3d3e" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#999", paddingTop: 8, borderTopWidth: 0.5, borderTopColor: "#e5e7eb" },
});

interface InvoicePDFProps {
  quote: any;
  customer: any;
  business: any;
  actuals: any; // The actuals object from your DB
  expenses: any[]; // The itemized expenses list
}

export function InvoicePDF({ quote, customer, business, actuals, expenses }: InvoicePDFProps) {
  const invoiceNumber = `INV-${String(quote.id).padStart(4, "0")}`;
  const invoiceDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const fmt = (n: number) => `£${(n ?? 0).toFixed(2)}`;

  // Calculate actuals for display
  const labourTotal = actuals.actual_hours * quote.hourly_rate;
  const travelTotal = actuals.actual_travel * quote.vehicle_cost_per_mile;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const subtotal = labourTotal + actuals.actual_materials + travelTotal + totalExpenses;
  const overhead = subtotal * (quote.overhead_pct / 100);
  const totalCost = subtotal + overhead;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.businessName}>{business.business_name || "Your Business"}</Text>
            {business.business_address && <Text style={styles.businessLine}>{business.business_address}</Text>}
            {business.business_phone && <Text style={styles.businessLine}>Tel: {business.business_phone}</Text>}
            {business.business_email && <Text style={styles.businessLine}>{business.business_email}</Text>}
            {business.business_vat && <Text style={styles.businessLine}>VAT: {business.business_vat}</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.invoiceLabel}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>Date: {invoiceDate}</Text>
            <Text style={styles.invoiceDate}>Quote Ref: Q-{String(quote.id).padStart(4, "0")}</Text>
          </View>
        </View>

        {/* Client */}
        <View style={styles.clientBlock}>
          <Text style={styles.sectionTitle}>BILLED TO</Text>
          <Text style={styles.clientName}>{customer?.name || "—"}</Text>
          {customer?.address && <Text style={styles.clientLine}>{customer.address}</Text>}
          {customer?.postcode && <Text style={styles.clientLine}>{customer.postcode}</Text>}
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableLabel]}>DESCRIPTION</Text>
            <Text style={[styles.tableHeaderText, styles.tableValue]}>AMOUNT</Text>
          </View>

          {/* Labour */}
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>
              Labour ({actuals.actual_hours} hrs @ {fmt(quote.hourly_rate)}/hr)
            </Text>
            <Text style={styles.tableValue}>{fmt(labourTotal)}</Text>
          </View>

          {/* Materials */}
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Materials (Actual Cost)</Text>
            <Text style={styles.tableValue}>{fmt(actuals.actual_materials)}</Text>
          </View>

          {/* Travel */}
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>
              Travel ({actuals.actual_travel} miles @ {fmt(quote.vehicle_cost_per_mile)}/mi)
            </Text>
            <Text style={styles.tableValue}>{fmt(travelTotal)}</Text>
          </View>

          {/* Itemized Expenses */}
          {expenses.map((exp) => (
            <View key={exp.id} style={styles.tableRow}>
              <Text style={styles.tableLabel}>
                {exp.category || "Expense"}: {exp.description}
              </Text>
              <Text style={styles.tableValue}>{fmt(exp.amount)}</Text>
            </View>
          ))}

          {/* Overhead */}
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Overhead ({quote.overhead_pct}%)</Text>
            <Text style={styles.tableValue}>{fmt(overhead)}</Text>
          </View>

          {/* Total Due */}
          <View style={styles.tableRowTotal}>
            <Text style={[styles.tableLabel, { fontFamily: "Helvetica-Bold" }]}>TOTAL DUE</Text>
            {/* We bill the agreed quote_price, not the cost + profit */}
            <Text style={styles.tableValueBold}>{fmt(quote.quote_price)}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Please pay within 14 days. Thank you for your business!
        </Text>
      </Page>
    </Document>
  );
}