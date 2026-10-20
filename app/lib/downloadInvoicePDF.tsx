import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "./InvoicePDF";

export async function downloadInvoicePDF(
  quote: any,
  customer: any,
  business: any,
  actuals: any,
  expenses: any[]
): Promise<void> {
  const blob = await pdf(
    <InvoicePDF 
      quote={quote} 
      customer={customer} 
      business={business} 
      actuals={actuals} 
      expenses={expenses} 
    />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const filename = `Invoice-INV-${String(quote.id).padStart(4, "0")}.pdf`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}