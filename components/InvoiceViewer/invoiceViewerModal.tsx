"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import InvoicePDF, {
  type DocumentVariant,
} from "@/components/invoiceGenerate/InvoicePDF";
import InvoiceSearch from "@/components/invoiceSearch";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { getInvoiceLayoutDetails } from "@/lib/apis";
import { Invoice } from "@/lib/types";

// Outside the component so the effects below don't depend on it.
const readCompanyId = (): string => {
  const id =
    localStorage.getItem("companyID") || sessionStorage.getItem("companyID");

  if (!id) throw new Error("Company ID not found.");
  return id;
};

export interface InvoiceViewerModalProps {
  open: boolean;
  onClose: () => void;
  /** Heading in the modal header. */
  title?: string;
  /** Used in labels and messages: "Invoice", "Credit Note", ... */
  documentLabel?: string;
  /** Opens straight onto this document and loads it (e.g. from a table row). */
  initialInvoiceNumber?: string;
  /** Hide the search box, for when the document is already chosen. */
  hideSearch?: boolean;
  /** Which PDF layout to print: "invoice" (default) or "creditNote". */
  variant?: DocumentVariant;
}

export default function InvoiceViewerModal({
  open,
  onClose,
  title = "Invoice Viewer",
  documentLabel = "Invoice",
  initialInvoiceNumber,
  hideSearch = false,
  variant = "invoice",
}: InvoiceViewerModalProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Incremented on every load and on close, so a slow response that arrives
  // after the modal was closed (or a newer search) is ignored.
  const requestId = useRef(0);

  const label = documentLabel.toLowerCase();

  // `company` is a parameter so the open effect can call this before state updates.
  const loadInvoice = async (rawNumber: string, company = companyId) => {
    const number = rawNumber.trim();

    if (!number || !company.trim()) {
      setError(`Enter the ${label} number.`);
      return;
    }

    const thisRequest = ++requestId.current;

    setLoading(true);
    setError("");
    setInvoice(null); // clear the previous document so a stale PDF can't be downloaded

    try {
      const data = await getInvoiceLayoutDetails(number, company.trim());
      if (thisRequest !== requestId.current) return;
      setInvoice(data);
    } catch (err) {
      if (thisRequest !== requestId.current) return;
      console.error(err);
      setError(`Could not load that ${label}. Check the number and try again.`);
    } finally {
      if (thisRequest === requestId.current) setLoading(false);
    }
  };

  // Reset when closed, and auto-load when opened with a document number.
  useEffect(() => {
    if (!open) {
      requestId.current++; // ignore anything still in flight
      setInvoice(null);
      setInvoiceNumber("");
      setError("");
      setLoading(false);
      return;
    }

    let company = "";
    try {
      company = readCompanyId();
      setCompanyId(company);
    } catch {
      setError("Company ID not found. Please sign in again.");
      return;
    }

    if (initialInvoiceNumber) {
      setInvoiceNumber(initialInvoiceNumber);
      loadInvoice(initialInvoiceNumber, company);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialInvoiceNumber]);

  // Escape closes the modal, and the page behind it stops scrolling.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      // mousedown (not click) so dragging a text selection out of the panel doesn't close it
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* No overflow-hidden on the panel, or the search dropdown would be clipped. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl"
      >
        <LoadingOverlay
          show={loading}
          title={`Loading ${label}`}
          message="Fetching details from the server..."
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b rounded-t-xl border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1 transition-colors rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search (outside the scrolling body so its dropdown can overlap it) */}
        {!hideSearch && (
          <div className="relative z-20 px-6 pt-5">
            <p className="mb-1 text-sm text-slate-500">{documentLabel} Number</p>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <InvoiceSearch
                  value={invoiceNumber}
                  onChange={setInvoiceNumber}
                  onSelect={(selected) => loadInvoice(selected.invoiceNo)}
                  onEnter={() => loadInvoice(invoiceNumber)}
                />
              </div>
              <button
                type="button"
                onClick={() => loadInvoice(invoiceNumber)}
                disabled={loading}
                className="h-10 px-4 text-sm text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50"
              >
                View
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto">
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          {!invoice && !loading && !error && (
            <p className="py-8 text-sm text-center text-slate-500">
              Search for a {label} to view it.
            </p>
          )}

          {invoice && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">{documentLabel} Number</p>
                  <p className="font-medium">{invoice.invoiceNo}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">{documentLabel} Date</p>
                  <p className="font-medium">{invoice.invoiceDate}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Supplier</p>
                  <p className="font-medium">{invoice.supplier.name}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Purchaser</p>
                  <p className="font-medium">{invoice.purchaser.name}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Total Items</p>
                  <p className="font-medium">{invoice.items.length}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Total Amount</p>
                  <p className="text-lg font-bold text-blue-700">
                    LKR{" "}
                    {invoice.financialDetails.totalAmountValue.toLocaleString(
                      "en-LK",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-6 border-t border-slate-200">
                <InvoicePDF invoice={invoice} variant={variant} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}