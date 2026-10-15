import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#0f3d3e",
  },
  businessName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#0f3d3e",
    marginBottom: 2,
  },
  businessTagline: {
    fontSize: 9,
    color: "#666",
    marginBottom: 6,
    fontStyle: "italic",
  },
  businessLine: {
    fontSize: 8,
    color: "#444",
    marginBottom: 1,
  },
  quoteLabel: {
    fontSize: 8,
    color: "#666",
    textAlign: "right",
    letterSpacing: 1,
  },
  quoteNumber: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    color: "#0f3d3e",
    marginBottom: 4,
  },
  quoteDate: {
    fontSize: 9,
    textAlign: "right",
    color: "#444",
    marginBottom: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 8,
    color: "#666",
    letterSpacing: 1,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  clientBlock: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  clientName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  clientLine: {
    fontSize: 9,
    color: "#444",
    marginBottom: 1,
  },
  jobTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#0f3d3e",
  },
  table: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#0f3d3e",
    paddingBottom: 4,
    marginBottom: 6,
  },
  tableHeaderText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f3d3e",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  tableRowTotal: {
    flexDirection: "row",
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: "#0f3d3e",
    marginTop: 4,
  },
  tableLabel: {
    flex: 3,
    fontSize: 10,
  },
  tableValue: {
    flex: 1,
    fontSize: 10,
    textAlign: "right",
  },
  tableValueBold: {
    flex: 1,
    fontSize: 12,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    color: "#0f3d3e",
  },
  terms: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
  },
  termsTitle: {
    fontSize: 8,
    color: "#666",
    letterSpacing: 1,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  termsLine: {
    fontSize: 8,
    color: "#444",
    marginBottom: 3,
  },
  signatureBlock: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatureLine: {
    width: "45%",
    borderTopWidth: 0.5,
    borderTopColor: "#1a1a1a",
    paddingTop: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#666",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#999",
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
  },
});

interface QuotePDFProps {
  quote: any;
  customer: any;
  business: any;
}

export function QuotePDF({ quote, customer, business }: QuotePDFProps) {
  const quoteNumber = `Q-${String(quote.id).padStart(4, "0")}`;
  const quoteDate = new Date(quote.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const validUntil = new Date(
    new Date(quote.created_at).getTime() + 30 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const fmt = (n: number) => `£${(n ?? 0).toFixed(2)}`;
  const fmtPct = (n: number) => `${(n ?? 0).toFixed(1)}%`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ---------- Header ---------- */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.businessName}>
              {business.business_name || "Your Business"}
            </Text>
            {business.business_tagline ? (
              <Text style={styles.businessTagline}>
                {business.business_tagline}
              </Text>
            ) : null}
            {business.business_address ? (
              <Text style={styles.businessLine}>{business.business_address}</Text>
            ) : null}
            {business.business_phone ? (
              <Text style={styles.businessLine}>Tel: {business.business_phone}</Text>
            ) : null}
            {business.business_email ? (
              <Text style={styles.businessLine}>{business.business_email}</Text>
            ) : null}
            {business.business_website ? (
              <Text style={styles.businessLine}>{business.business_website}</Text>
            ) : null}
            {business.business_vat ? (
              <Text style={styles.businessLine}>VAT: {business.business_vat}</Text>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quoteLabel}>QUOTATION</Text>
            <Text style={styles.quoteNumber}>{quoteNumber}</Text>
            <Text style={styles.quoteDate}>Date: {quoteDate}</Text>
            <Text style={styles.quoteDate}>Valid until: {validUntil}</Text>
          </View>
        </View>

        {/* ---------- Client ---------- */}
        <View style={styles.clientBlock}>
          <Text style={styles.sectionTitle}>QUOTED TO</Text>
          <Text style={styles.clientName}>
            {customer?.name || quote.customer_name || "—"}
          </Text>
          {customer?.address ? (
            <Text style={styles.clientLine}>{customer.address}</Text>
          ) : null}
          {customer?.postcode ? (
            <Text style={styles.clientLine}>{customer.postcode}</Text>
          ) : null}
          {customer?.phone ? (
            <Text style={styles.clientLine}>Tel: {customer.phone}</Text>
          ) : null}
          {customer?.email ? (
            <Text style={styles.clientLine}>{customer.email}</Text>
          ) : null}
        </View>

        {/* ---------- Job ---------- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SCOPE OF WORK</Text>
          <Text style={styles.jobTitle}>
            {quote.job_type_name || "General Work"}
          </Text>
        </View>

        {/* ---------- Cost table ---------- */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableLabel]}>ITEM</Text>
            <Text style={[styles.tableHeaderText, styles.tableValue]}>AMOUNT</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>
              Labour ({quote.estimated_hours} hrs @ {fmt(quote.hourly_rate)}/hr)
            </Text>
            <Text style={styles.tableValue}>{fmt(quote.labour_cost)}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Materials</Text>
            <Text style={styles.tableValue}>{fmt(quote.materials_cost)}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>
              Travel ({quote.travel_distance} miles @{" "}
              {fmt(quote.vehicle_cost_per_mile)}/mi)
            </Text>
            <Text style={styles.tableValue}>{fmt(quote.travel_cost)}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>
              Overhead ({fmtPct(quote.overhead_pct)})
            </Text>
            <Text style={styles.tableValue}>{fmt(quote.overhead)}</Text>
          </View>

          <View style={styles.tableRowTotal}>
            <Text style={[styles.tableLabel, { fontFamily: "Helvetica-Bold" }]}>
              TOTAL QUOTE
            </Text>
            <Text style={styles.tableValueBold}>{fmt(quote.quote_price)}</Text>
          </View>
        </View>

        {/* ---------- Terms ---------- */}
        <View style={styles.terms}>
          <Text style={styles.termsTitle}>TERMS & CONDITIONS</Text>
          {business.business_terms ? (
            business.business_terms
              .split("\n")
              .map((line: string, i: number) =>
                line.trim() ? (
                  <Text key={i} style={styles.termsLine}>
                    • {line.trim()}
                  </Text>
                ) : null
              )
          ) : (
            <>
              <Text style={styles.termsLine}>
                • This quote is valid for 30 days from the date above.
              </Text>
              <Text style={styles.termsLine}>
                • A 50% deposit is required on acceptance.
              </Text>
              <Text style={styles.termsLine}>
                • Final payment due on completion.
              </Text>
            </>
          )}
        </View>

        {/* ---------- Signature ---------- */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>Client signature</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureLabel}>Date</Text>
          </View>
        </View>

        {/* ---------- Footer ---------- */}
        <Text style={styles.footer}>
          Thank you for considering {business.business_name || "us"}. Quote{" "}
          {quoteNumber} — valid until {validUntil}.
        </Text>
      </Page>
    </Document>
  );
}