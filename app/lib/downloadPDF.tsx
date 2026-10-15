import { pdf } from "@react-pdf/renderer";
import { QuotePDF } from "./QuotePDF";

export async function downloadQuotePDF(
  quote: any,
  customer: any,
  business: any
): Promise<void> {
  const blob = await pdf(
    <QuotePDF quote={quote} customer={customer} business={business} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const filename = `Quote-${String(quote.id).padStart(4, "0")}.pdf`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Give the browser a moment before revoking
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}