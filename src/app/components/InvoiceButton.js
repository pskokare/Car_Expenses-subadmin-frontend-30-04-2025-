// "use client"

// import { useState } from 'react';

// const InvoiceButton = ({ item, cabData, companyInfo, companyLogo, signature, subCompanyName, invoiceNumber, derivePrefix }) => {
//   const [isGenerating, setIsGenerating] = useState(false);
  
//   // const handleGeneratePDF = async () => {
//   //   console.log("after container")
//   //   setIsGenerating(true);
    
//   //   try {
//   //     console.log("we are with minnat bhai")
//   //     // Dynamic import of the PDF libraries
//   //     const { PDFDownloadLink } = await import('@react-pdf/renderer');
//   //     console.log("PDFdOWNLOADlINK")
//   //     const { default: InvoicePDF } = await import('../../components/InvoicePDF');
//   //     console.log("invoicePDF")
      
      
//   //     // Create a temporary element to render the PDF
//   //     const container = document.createElement('div');
//   //     container.style.display = 'none';
//   //     document.body.appendChild(container);
   
      
//   //     // Render the PDF link
//   //     const renderPDF = () => {
//   //       return (
//   //         <PDFDownloadLink
//   //           document={
//   //             <InvoicePDF
//   //               cabData={cabData}
//   //               trip={item}
//   //               companyLogo={companyLogo}
//   //               signature={signature}
//   //               companyPrefix={derivePrefix(subCompanyName)}
//   //               companyInfo={companyInfo}
//   //               companyName={subCompanyName}
//   //               invoiceNumber={invoiceNumber || `${derivePrefix(subCompanyName)}-${String(item.invoiceSerial || 0).padStart(5, "0")}`}
//   //               invoiceDate={new Date().toLocaleDateString("en-IN")}
//   //             />
//   //           }
//   //           fileName={`Invoice-${item?.cab?.cabNumber}.pdf`}
//   //         >
//   //           {({ blob, url, loading, error }) => {
//   //             if (!loading && !error) {
//   //               // Auto-click the download link
//   //               const downloadLink = document.createElement('a');
//   //               downloadLink.href = url;
//   //               downloadLink.download = `Invoice-${item?.cab?.cabNumber}.pdf`;
//   //               document.body.appendChild(downloadLink);
//   //               downloadLink.click();
//   //               document.body.removeChild(downloadLink);
                
//   //               // Clean up
//   //               setTimeout(() => {
//   //                 document.body.removeChild(container);
//   //                 setIsGenerating(false);
//   //               }, 100);
//   //             }
//   //             return null;
//   //           }}
//   //         </PDFDownloadLink>
//   //       );
//   //     };

//   //     console.log("after render")
      
//   //     // Use ReactDOM to render the PDF link
//   //     const ReactDOM = await import('react-dom/client');
//   //     const root = ReactDOM.createRoot(container);
//   //     root.render(renderPDF());
      
//   //   } catch (error) {
//   //     console.error("PDF generation error:", error);
//   //     setIsGenerating(false);
//   //     alert("Failed to generate PDF. Please try again.");
//   //   }
//   // };


//   const handleGeneratePDF = async () => {
//     setIsGenerating(true);
  
//     try {
//       const { pdf } = await import('@react-pdf/renderer');
//       const { default: InvoicePDF } = await import('../../components/InvoicePDF');
//       const ReactDOMServer = await import('react-dom/server.browser'); // required to render PDF doc
  
//       const invoiceDocument = (
//         <InvoicePDF
//           cabData={cabData}
//           trip={item}
//           companyLogo={companyLogo}
//           signature={signature}
//           companyPrefix={derivePrefix(subCompanyName)}
//           companyInfo={companyInfo}
//           companyName={subCompanyName}
//           invoiceNumber={invoiceNumber || ${derivePrefix(subCompanyName)}-${String(item.invoiceSerial || 0).padStart(5, "0")}}
//           invoiceDate={new Date().toLocaleDateString("en-IN")}
//         />
//       );
  
//       const blob = await pdf(invoiceDocument).toBlob();
//       const url = URL.createObjectURL(blob);
  
//       const downloadLink = document.createElement('a');
//       downloadLink.href = url;
//       downloadLink.download = Invoice-${item?.cab?.cabNumber}.pdf;
//       document.body.appendChild(downloadLink);
//       downloadLink.click();
//       document.body.removeChild(downloadLink);
  
//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("PDF generation error:", error);
//       alert("Failed to generate PDF. Please try again.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };
//   return (
//     <button
//       onClick={handleGeneratePDF}
//       disabled={isGenerating}
//       className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//     >
//       {isGenerating ? "Generating PDF..." : "Download Invoice"}
//     </button>
//   );
// };

// export default InvoiceButton;



// "use client";

// import { useState } from "react";

// const InvoiceButton = ({
//   item,
//   cabData,
//   companyInfo,
//   companyLogo,
//   signature,
//   subCompanyName,
//   invoiceNumber,
//   derivePrefix,
// }) => {
//   const [isGenerating, setIsGenerating] = useState(false);

//   const handleGeneratePDF = async () => {
//     setIsGenerating(true);

//     try {
//       const { pdf } = await import("@react-pdf/renderer");
//       const { default: InvoicePDF } = await import("../../components/InvoicePDF");

//       const invoiceId =
//         invoiceNumber ||
//         `${derivePrefix(subCompanyName)}-${String(item.invoiceSerial || 0).padStart(5, "0")}`;

//       const invoiceDocument = (
//         <InvoicePDF
//           cabData={cabData}
//           trip={item}
//           companyLogo={companyLogo}
//           signature={signature}
//           companyPrefix={derivePrefix(subCompanyName)}
//           companyInfo={companyInfo}
//           companyName={subCompanyName}
//           invoiceNumber={invoiceId}
//           invoiceDate={new Date().toLocaleDateString("en-IN")}
//         />
//       );

//       const blob = await pdf(invoiceDocument).toBlob();
//       const url = URL.createObjectURL(blob);

//       const downloadLink = document.createElement("a");
//       downloadLink.href = url;
//       downloadLink.download = `Invoice-${item?.cab?.cabNumber}.pdf`;
//       document.body.appendChild(downloadLink);
//       downloadLink.click();
//       document.body.removeChild(downloadLink);

//       URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("PDF generation error:", error);
//       alert("Failed to generate PDF. Please try again.");
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   return (
//     <button
//       onClick={handleGeneratePDF}
//       disabled={isGenerating}
//       className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//     >
//       {isGenerating ? "Generating PDF..." : "Download Invoice"}
//     </button>
//   );
// };

// export default InvoiceButton;


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
