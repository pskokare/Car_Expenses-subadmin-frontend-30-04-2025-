"use client"

import { useState, useEffect } from "react"
import InvoicePDFDownloader from "./InvoicePDFDownloader"
import InvoicePDFGenerator from "./InvoicePDFGenerator"

const PDFDownloadButton = (props) => {
  const [useServerSide, setUseServerSide] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Try to detect if we're in an environment that might have issues with crypto
      try {
        // This is a simple test to see if crypto is available
        if (!window.crypto || !window.crypto.subtle) {
          console.warn("Crypto API not fully supported, falling back to client-side PDF generation")
          setUseServerSide(false)
        }
      } catch (err) {
        console.error("Error checking crypto support:", err)
        setUseServerSide(false)
      }
    }
  }, [])

  // If there was an error with the server-side approach, use the client-side approach
  const handleServerError = () => {
    setError("Server-side PDF generation failed. Falling back to client-side generation.")
    setUseServerSide(false)
  }

  return (
    <div>
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

      {useServerSide ? (
        <InvoicePDFDownloader {...props} onError={handleServerError} />
      ) : (
        <InvoicePDFGenerator {...props} />
      )}
    </div>
  )
}

export default PDFDownloadButton
