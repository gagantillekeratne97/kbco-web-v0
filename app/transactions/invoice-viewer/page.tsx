"use client";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import InvoicePDF from "@/components/invoiceGenerate/InvoicePDF";
//import Invoice from "@/components/InvoiceSearch"; // adjust to where your component lives
import InvoiceSearch from "@/components/invoiceSearch";
import { getInvoiceLayoutDetails } from "@/lib/apis";
import { Invoice } from "@/lib/types";
import { useEffect, useState } from "react";

// Outside the component so the effect below doesn't depend on it.
const readCompanyId = (): string => {
  const id =
    localStorage.getItem("companyID") || sessionStorage.getItem("companyID");

  if (!id) throw new Error("Company ID not found.");
  return id;
};

export default function InvoiceViewerPage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      setCompanyId(readCompanyId());
    } catch {
      setError("Company ID not found. Please sign in again.");
    }
  }, []);

  // Takes the number as a parameter so picking a suggestion can load it
  // immediately (state wouldn't have updated yet inside the same click).
  const loadInvoice = async (rawNumber: string) => {
    const number = rawNumber.trim();
    const company = companyId.trim();

    if (!number || !company) {
      setError("Enter the invoice number (and make sure the company is set).");
      return;
    }

    setLoading(true);
    setError("");
    setInvoice(null); // clear the previous invoice so a stale PDF can't be downloaded

    try {
      const data = await getInvoiceLayoutDetails(number, company);
      setInvoice(data);
    } catch (err) {
      console.error(err);
      setError("Could not load that invoice. Check the company ID and invoice number.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800";

  return (
    <div className="flex min-h-screen bg-surface font-display">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar title="Invoice Viewing" />
        <div className="m-5 space-y-6">
          <main className="min-h-screen p-6 bg-slate-100 md:p-10">
            <div className="max-w-5xl p-6 mx-auto bg-white shadow-sm rounded-xl md:p-8">
              <h1 className="text-2xl font-bold text-slate-800">
                Invoice PDF Generator
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Search for an invoice, pick it from the list, and it loads automatically.
              </p>

              <div className="p-5 mt-6 border rounded-lg border-slate-200">
                <h2 className="text-lg font-semibold text-slate-700">
                  Invoice Details
                </h2>

                <div className="grid gap-4 mt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Company ID</p>
                    <input
                      type="text"
                      value={companyId}
                      disabled
                      readOnly
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-slate-500">Invoice Number</p>
                    <InvoiceSearch
                      value={invoiceNumber}
                      onChange={setInvoiceNumber}
                      onSelect={(selected) => loadInvoice(selected.invoiceNo)}
                      onEnter={() => loadInvoice(invoiceNumber)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => loadInvoice(invoiceNumber)}
                  disabled={loading}
                  className="px-4 py-2 mt-4 text-sm text-white bg-blue-700 rounded-md hover:bg-blue-800 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "View Invoice"}
                </button>

                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                {invoice && (
                  <div className="grid gap-4 pt-5 mt-6 border-t border-slate-200 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-500">Invoice Date</p>
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
                )}
              </div>

              {/* InvoicePDF needs a real invoice, so it only renders once one is loaded */}
              {invoice && (
                <div className="mt-6">
                  <InvoicePDF invoice={invoice} />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}