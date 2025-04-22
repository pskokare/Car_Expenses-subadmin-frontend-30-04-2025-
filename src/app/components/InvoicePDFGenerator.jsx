"use client"

import { useState } from "react"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

// This component is a fallback that uses jsPDF instead of @react-pdf/renderer
// It will be used if the server-side PDF generation fails
const InvoicePDFGenerator = ({
  trip,
  cabData,
  companyLogo,
  signature,
  companyPrefix,
  companyInfo,
  companyName,
  invoiceNumber,
  invoiceDate,
}) => {
  const [generating, setGenerating] = useState(false)

  // Helper function to safely extract amounts
  const extractAmount = (data, paths) => {
    if (!data) return 0

    for (const path of paths) {
      const parts = path.split(".")
      let current = data

      for (const part of parts) {
        if (!current || typeof current !== "object") {
          current = null
          break
        }
        current = current[part]
      }

      if (Array.isArray(current)) {
        const sum = current.reduce((sum, amt) => {
          if (amt === null || amt === undefined) return sum

          if (typeof amt === "string") {
            const cleanedAmount = amt.replace(/[^\d.-]/g, "")
            return sum + (Number(cleanedAmount) || 0)
          }

          return sum + (Number(amt) || 0)
        }, 0)

        if (sum > 0) return sum
      } else if (current !== undefined && current !== null) {
        if (typeof current === "string") {
          const cleanedAmount = current.replace(/[^\d.-]/g, "")
          return Number(cleanedAmount) || 0
        }
        return Number(current) || 0
      }
    }

    return 0
  }

  const generatePDF = async () => {
    try {
      setGenerating(true)

      // Extract amounts using the same logic as in InvoicePDF
      const fuelAmount =
        extractAmount(trip, ["cab.fuel.amount", "tripDetails.fuel.amount", "fuel.amount"]) ||
        extractAmount(cabData, ["fuel.amount"]) ||
        0

      const fastTagAmount =
        extractAmount(trip, ["cab.fastTag.amount", "tripDetails.fastTag.amount", "fastTag.amount"]) ||
        extractAmount(cabData, ["fastTag.amount"]) ||
        0

      const tyreAmount =
        extractAmount(trip, [
          "cab.tyrePuncture.repairAmount",
          "tripDetails.tyrePuncture.repairAmount",
          "tyrePuncture.repairAmount",
        ]) ||
        extractAmount(cabData, ["tyrePuncture.repairAmount"]) ||
        0

      const otherAmount =
        extractAmount(trip, ["cab.otherProblems.amount", "tripDetails.otherProblems.amount", "otherProblems.amount"]) ||
        extractAmount(cabData, ["otherProblems.amount"]) ||
        0

      const subtotal = fuelAmount + fastTagAmount + tyreAmount + otherAmount
      const gst = subtotal * 0.05
      const totalAmount = subtotal + gst

      // Format number with commas for Indian numbering system
      const formatIndianNumber = (num) => {
        if (num == null || isNaN(Number(num))) return "0.00"
        const parts = num.toFixed(2).split(".")
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        return parts.join(".")
      }

      // Create a new jsPDF instance
      const doc = new jsPDF()

      // Set document properties
      doc.setProperties({
        title: `Invoice-${trip?.cab?.cabNumber}`,
        author: companyName || "Company",
        subject: "Invoice",
        keywords: "invoice, cab, transportation",
      })

      // Add company logo if available
      if (companyLogo) {
        try {
          // We need to load the image first
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.src = companyLogo

          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
          })

          // Add the image to the PDF
          doc.addImage(img, "JPEG", 20, 20, 40, 30)
        } catch (err) {
          console.error("Error loading company logo:", err)
        }
      }

      // Add company info
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(companyName || "Company Name", 70, 30)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      if (companyInfo) {
        const infoLines = companyInfo.split("\n")
        infoLines.forEach((line, index) => {
          doc.text(line, 70, 40 + index * 5)
        })
      } else {
        doc.text("Address Line 1", 70, 40)
        doc.text("City, State, Zip", 70, 45)
        doc.text("Phone: 0000000000", 70, 50)
        doc.text("GSTIN: XXXXXXXXXXXX", 70, 55)
      }

      // Add horizontal lines and title
      doc.setLineWidth(0.5)
      doc.line(20, 65, 190, 65)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("TAX INVOICE", 105, 72, { align: "center" })
      doc.line(20, 75, 190, 75)

      // Add invoice details
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(0, 123, 255) // Blue color for WTL TOURISM
      doc.text("WTL TOURISM PRIVATE LIMITED", 20, 85)

      doc.setTextColor(0, 0, 0) // Reset to black
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Floor No.: First Floor", 20, 92)
      doc.text("Office No. 09, A-Building, S No.53/2A/1, City Vista, Fountain Road, Pune", 20, 99)
      doc.text("State: Maharashtra - 27", 20, 106)
      doc.text("Phone: 8237257618", 20, 113)
      doc.text("GSTIN: 27AADCW8531C1ZD", 20, 120)

      // Add invoice number and date on the right
      doc.setFontSize(10)
      doc.text("Original for Recipient", 150, 85)
      doc.text(`Invoice Number: ${invoiceNumber || "RADIANT-000000"}`, 150, 92)
      doc.text(`Invoice Date: ${invoiceDate || new Date().toLocaleDateString("en-IN")}`, 150, 99)
      doc.text(`Cab Number: ${trip?.cab?.cabNumber || "N/A"}`, 150, 106)

      // Create expense table
      doc.autoTable({
        startY: 130,
        head: [["Expense Type", "Amount"]],
        body: [
          ["Fuel", `₹${formatIndianNumber(fuelAmount)}`],
          ["FastTag", `₹${formatIndianNumber(fastTagAmount)}`],
          ["Tyre Puncture", `₹${formatIndianNumber(tyreAmount)}`],
          ["Other Problems", `₹${formatIndianNumber(otherAmount)}`],
          ["Subtotal", `₹${formatIndianNumber(subtotal)}`],
          ["GST (5%)", `₹${formatIndianNumber(gst)}`],
          ["Total", `₹${formatIndianNumber(totalAmount)}`],
        ],
        theme: "grid",
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 50, halign: "right" },
        },
        styles: { fontSize: 10 },
      })

      // Convert number to words
      const numberToWords = (num) => {
        const ones = [
          "",
          "One",
          "Two",
          "Three",
          "Four",
          "Five",
          "Six",
          "Seven",
          "Eight",
          "Nine",
          "Ten",
          "Eleven",
          "Twelve",
          "Thirteen",
          "Fourteen",
          "Fifteen",
          "Sixteen",
          "Seventeen",
          "Eighteen",
          "Nineteen",
        ]
        const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

        const numToWords = (num) => {
          if (num < 20) return ones[num]
          if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
          if (num < 1000)
            return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + numToWords(num % 100) : "")
          if (num < 100000)
            return numToWords(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + numToWords(num % 1000) : "")
          if (num < 10000000)
            return numToWords(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + numToWords(num % 100000) : "")
          return (
            numToWords(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + numToWords(num % 10000000) : "")
          )
        }

        return numToWords(Math.floor(num)) + " Rupees Only"
      }

      // Add amount in words
      const tableEndY = doc.lastAutoTable.finalY + 10
      doc.setFontSize(10)
      doc.setFont("helvetica", "italic")
      doc.text(`Amount in words: ${numberToWords(totalAmount)}`, 20, tableEndY)

      // Add terms and conditions
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Terms & Conditions:", 20, tableEndY + 15)
      doc.setFont("helvetica", "normal")
      doc.text("1. Minimum ₹500 will be charged if trip is canceled.", 20, tableEndY + 22)
      doc.text("2. Invoice will be cancelled if not paid in 7 days.", 20, tableEndY + 29)
      doc.text("3. Diesel above ₹90/ltr may incur extra charges.", 20, tableEndY + 36)
      doc.text("4. Payment due within 15 days of invoice date.", 20, tableEndY + 43)
      doc.text("5. Late payments incur 2% monthly interest.", 20, tableEndY + 50)

      // Add signature if available
      if (signature) {
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.src = signature

          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
          })

          doc.addImage(img, "JPEG", 150, tableEndY + 15, 30, 30)
        } catch (err) {
          console.error("Error loading signature:", err)
        }
      }

      doc.setFontSize(8)
      doc.text(`For ${companyName || "________________"}`, 150, tableEndY + 50)
      doc.text("Authorized Signatory", 150, tableEndY + 55)

      // Save the PDF
      doc.save(`Invoice-${trip?.cab?.cabNumber || "cab"}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button
      onClick={generatePDF}
      disabled={generating}
      className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
    >
      {generating ? "Generating PDF..." : "Download Invoice"}
    </button>
  )
}

export default InvoicePDFGenerator
