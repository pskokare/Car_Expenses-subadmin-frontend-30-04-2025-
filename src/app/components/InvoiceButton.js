
"use client";
import { useState } from "react";

const InvoiceButton = ({
  item,
  cabData,
  companyInfo,
  companyLogo,
  signature,
  subCompanyName,
  invoiceNumber,
  derivePrefix,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item,
          cabData,
          companyInfo,
          companyLogo,
          signature,
          subCompanyName,
          invoiceNumber,
          derivePrefix: derivePrefix(subCompanyName),
        }),
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${item?.cab?.cabNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Client download error:", error);
      alert("Failed to download invoice PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      disabled={isGenerating}
      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
    >
      {isGenerating ? "Generating PDF..." : "Download Invoice"}
    </button>
  );
};

export default InvoiceButton;
