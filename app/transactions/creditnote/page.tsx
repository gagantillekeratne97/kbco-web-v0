"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import {
  createCreditNote,
  getInvoiceCustomerInformation,
} from "@/lib/apis";
import { creditNoteInfo } from "@/lib/types";
import InvoiceSearch, {
  type InvoiceSearchResult,
} from "@/components/invoiceSearch";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function CreditNoteRequestPage() {
  // =========================================================
  // STATE
  // =========================================================

  const [isCreating, setIsCreating] = useState(false);

  const [customerInfo, setCustomerInfo] =
    useState<creditNoteInfo | null>(null);

  const [invoiceNo, setInvoiceNo] = useState("");

  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  // =========================================================
  // GET COMPANY ID
  // =========================================================

  const getCompanyId = (): string => {
    const companyId =
      localStorage.getItem("companyID") ||
      sessionStorage.getItem("companyID");

    if (!companyId) {
      throw new Error("Company ID not found.");
    }

    return companyId;
  };

  // =========================================================
  // HANDLE INVOICE SELECTION FROM AUTOCOMPLETE
  // =========================================================

  const handleInvoiceSelect = async (
    invoice: InvoiceSearchResult
  ) => {
    try {
      setInvoiceNo(invoice.invoiceNo);

      setLoading(true);
      setError("");
      setCustomerInfo(null);
      setCurrentPage(1);

      const result = await getInvoiceCustomerInformation(
        invoice.invoiceNo.trim()
      );

      setCustomerInfo(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch invoice information."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // MANUAL SEARCH
  // =========================================================

  const handleSearch = async () => {
    if (!invoiceNo.trim()) {
      setError("Please enter an invoice number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCustomerInfo(null);
      setCurrentPage(1);

      const result = await getInvoiceCustomerInformation(
        invoiceNo.trim()
      );

      setCustomerInfo(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch customer information."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CLEAR
  // =========================================================

  const handleClear = () => {
    setInvoiceNo("");
    setCustomerInfo(null);
    setReason("");
    setError("");
    setCurrentPage(1);
  };

  // =========================================================
  // SUBMIT CREDIT NOTE
  // =========================================================

  const handleSubmit = async () => {
    // Prevent duplicate submissions
    if (isCreating) return;

    // Validate invoice
    if (!customerInfo) {
      toast.error("Invoice Required", {
        description: "Please search for an invoice first.",
        duration: 4000,
      });

      return;
    }

    // Validate reason
    if (!reason.trim()) {
      toast.error("Reason Required", {
        description:
          "Please enter a reason for the credit note.",
        duration: 4000,
      });

      return;
    }

    try {
      setIsCreating(true);

      const result = await createCreditNote({
        invoiceNumber: customerInfo.invoiceNumber,
        creditNoteDate: new Date()
          .toISOString()
          .split("T")[0],
        companyId: getCompanyId(),
        reason: reason.trim(),
      });

      if (result.status === 200) {
        toast.success("Credit Note Created", {
          description:
            "The credit note request was submitted successfully.",
          duration: 4000,
        });

        handleClear();
      } else {
        toast.error("Failed to Submit Credit Note", {
          description:
            "The credit note request could not be submitted.",
          duration: 4000,
        });
      }
    } catch (err) {
      toast.error("Unable to Create Credit Note", {
        description:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // =========================================================
  // PAGINATION
  // =========================================================

  const invoiceItems = customerInfo?.invoiceItems ?? [];

  const totalItems = invoiceItems.length;

  const totalPages = Math.ceil(
    totalItems / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const endIndex =
    startIndex + itemsPerPage;

  const currentItems = invoiceItems.slice(
    startIndex,
    endIndex
  );

  // =========================================================
  // PAGINATION PAGE NUMBERS
  // =========================================================

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const startPage = Math.max(
      2,
      currentPage - 1
    );

    const endPage = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (
      let i = startPage;
      i <= endPage;
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex min-h-screen bg-surface font-display">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar title="Credit Note Request" />

        <main className="m-5 space-y-6">

          {/* =====================================================
              SEARCH INVOICE
          ===================================================== */}

          <div className="p-5 bg-white border shadow-sm rounded-xl border-slate-200">

            <h2 className="mb-1 text-base font-semibold text-slate-800">
              Search Invoice
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Enter an invoice number or the last digits
              to find an invoice.
            </p>

            {/* Error message */}

            {error && (
              <div className="px-4 py-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                {error}
              </div>
            )}

            <label
              htmlFor="invoiceNo"
              className="block mb-2 text-sm font-medium text-slate-700"
            >
              Invoice Number
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">

              {/* =================================================
                  AUTOCOMPLETE SEARCH
              ================================================= */}

              <div className="relative flex-1">

                <InvoiceSearch
                  value={invoiceNo}
                  onChange={setInvoiceNo}
                  onSelect={handleInvoiceSelect}
                  onEnter={handleSearch}
                />

              </div>

              {/* =================================================
                  SEARCH BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Searching..."
                  : "Search"}
              </button>

              {/* =================================================
                  CLEAR BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>

            </div>
          </div>

          {/* =========================================================
              INVOICE INFORMATION
          ========================================================= */}

          {customerInfo && (
            <>

              {/* =====================================================
                  INVOICE REVIEW
              ===================================================== */}

              <div className="p-5 bg-white border shadow-sm rounded-xl border-slate-200">

                <div className="mb-5">

                  <h2 className="text-base font-semibold text-slate-800">
                    Invoice Review
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Review the invoice information before
                    submitting the credit note request.
                  </p>

                </div>

                {/* =================================================
                    CUSTOMER INFORMATION
                ================================================= */}

                <div className="mb-6">

                  <h3 className="mb-4 text-sm font-semibold text-slate-700">
                    Customer Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div>
                      <p className="text-xs font-medium tracking-wide uppercase text-slate-400">
                        Customer Code
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {customerInfo.customerCode || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium tracking-wide uppercase text-slate-400">
                        Customer Name
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {customerInfo.customerName || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium tracking-wide uppercase text-slate-400">
                        Customer Address
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {customerInfo.customerAddress || "-"}
                      </p>
                    </div>

                  </div>

                </div>

                {/* =================================================
                    INVOICE INFORMATION
                ================================================= */}

                <div className="pt-6 mb-6 border-t border-slate-100">

                  <h3 className="mb-4 text-sm font-semibold text-slate-700">
                    Invoice Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div>
                      <p className="text-xs font-medium tracking-wide uppercase text-slate-400">
                        Invoice Number
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {customerInfo.invoiceNumber || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium tracking-wide uppercase text-slate-400">
                        Invoice Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {customerInfo.invoiceDate
                          ? new Date(
                              customerInfo.invoiceDate
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>

                  </div>

                </div>

                {/* =================================================
                    INVOICE SUMMARY
                ================================================= */}

                <div className="pt-6 border-t border-slate-100">

                  <h3 className="mb-4 text-sm font-semibold text-slate-700">
                    Invoice Summary
                  </h3>

                  <div className="flex justify-end">

                    <div className="w-full max-w-sm space-y-3">

                      {/* Sub Total */}

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Sub Total
                        </span>

                        <span className="font-medium text-slate-800">
                          {customerInfo.subTotal}
                        </span>

                      </div>

                      {/* SSCL */}

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          SSCL
                        </span>

                        <span className="font-medium text-slate-800">
                          {customerInfo.ssclAmount}
                        </span>

                      </div>

                      {/* VAT */}

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          VAT
                        </span>

                        <span className="font-medium text-slate-800">
                          {customerInfo.tax}
                        </span>

                      </div>

                      {/* Total */}

                      <div className="pt-3 border-t border-slate-200">

                        <div className="flex items-center justify-between">

                          <span className="text-sm font-semibold text-slate-700">
                            Total
                          </span>

                          <span className="text-lg font-bold text-slate-900">

                            {(
                              customerInfo.subTotal +
                              customerInfo.ssclAmount +
                              customerInfo.tax
                            ).toLocaleString(
                              "en-US",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}

                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* =========================================================
                  INVOICE ITEMS
              ========================================================= */}

              <div className="bg-white border shadow-sm rounded-xl border-slate-200">

                <div className="flex flex-col gap-2 p-5 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="text-base font-semibold text-slate-800">
                      Invoice Items
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Read-only invoice details for verification.
                    </p>

                  </div>

                  <div className="px-3 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                    {totalItems}{" "}
                    {totalItems === 1
                      ? "Item"
                      : "Items"}                      
                  </div>                  

                </div>

                {totalItems > 0 ? (
                  <>

                    {/* =================================================
                        TABLE
                    ================================================= */}

                    <div className="overflow-x-auto">                      
                      <table className="w-full min-w-[1100px] text-sm">

                        <thead className="border-b border-slate-200 bg-slate-50">

                          <tr>

                            <th className="px-4 py-3 font-semibold text-left text-slate-600">
                              #
                            </th>

                            <th className="px-4 py-3 font-semibold text-left text-slate-600">
                              Serial Number
                            </th>

                            <th className="px-4 py-3 font-semibold text-left text-slate-600">
                              Machine Model
                            </th>

                            <th className="px-4 py-3 font-semibold text-left text-slate-600">
                              Location
                            </th>

                            <th className="px-4 py-3 font-semibold text-left text-slate-600">
                              Billing Method
                            </th>

                            <th className="px-4 py-3 font-semibold text-right text-slate-600">
                              Start MR
                            </th>

                            <th className="px-4 py-3 font-semibold text-right text-slate-600">
                              End MR
                            </th>

                            <th className="px-4 py-3 font-semibold text-right text-slate-600">
                              Copies
                            </th>

                          </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-100">

                          {currentItems.map(
                            (item, index) => (

                              <tr
                                key={`${item.serialNumber}-${index}`}
                                className="transition hover:bg-slate-50"
                              >

                                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                                  {startIndex +
                                    index +
                                    1}
                                </td>

                                <td className="px-4 py-3 font-medium whitespace-nowrap text-slate-800">
                                  {item.serialNumber ||
                                    "-"}
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                  {item.machineModel ||
                                    "-"}
                                </td>

                                <td className="px-4 py-3 text-slate-600">
                                  {item.mLoc || "-"}
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                                  {item.billingMethod ||
                                    "-"}
                                </td>

                                <td className="px-4 py-3 text-right whitespace-nowrap text-slate-600">
                                  {item.startMr ?? "-"}
                                </td>

                                <td className="px-4 py-3 text-right whitespace-nowrap text-slate-600">
                                  {item.endMr ?? "-"}
                                </td>

                                <td className="px-4 py-3 font-medium text-right whitespace-nowrap text-slate-800">
                                  {item.invoiceCopies ??
                                    "-"}
                                </td>

                              </tr>

                            )
                          )}

                        </tbody>

                      </table>

                    </div>

                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    <div className="flex flex-col gap-3 px-4 py-4 border-t border-slate-200 sm:flex-row sm:items-center sm:justify-between">

                      {/* Showing information */}

                      <p className="text-sm text-slate-500">

                        Showing{" "}

                        <span className="font-medium text-slate-700">
                          {startIndex + 1}
                        </span>

                        {" "}to{" "}

                        <span className="font-medium text-slate-700">
                          {Math.min(
                            endIndex,
                            totalItems
                          )}
                        </span>

                        {" "}of{" "}

                        <span className="font-medium text-slate-700">
                          {totalItems}
                        </span>

                        {" "}items

                      </p>

                      {/* Pagination buttons */}

                      <div className="flex items-center gap-1">

                        {/* Previous */}

                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage(
                              (page) =>
                                Math.max(
                                  page - 1,
                                  1
                                )
                            )
                          }
                          disabled={
                            currentPage === 1
                          }
                          className="px-3 py-2 text-sm font-medium transition border rounded-lg border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>

                        {/* Page numbers */}

                        {getPageNumbers().map(
                          (page, index) => {

                            if (
                              page === "..."
                            ) {
                              return (
                                <span
                                  key={`ellipsis-${index}`}
                                  className="px-2 text-sm text-slate-400"
                                >
                                  ...
                                </span>
                              );
                            }

                            return (
                              <button
                                key={page}
                                type="button"
                                onClick={() =>
                                  setCurrentPage(
                                    page as number
                                  )
                                }
                                className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                  currentPage ===
                                  page
                                    ? "bg-indigo-600 text-white"
                                    : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          }
                        )}

                        {/* Next */}

                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage(
                              (page) =>
                                Math.min(
                                  page + 1,
                                  totalPages
                                )
                            )
                          }
                          disabled={
                            currentPage ===
                            totalPages
                          }
                          className="px-3 py-2 text-sm font-medium transition border rounded-lg border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>

                      </div>

                    </div>

                  </>
                ) : (
                  <div className="px-5 py-10 text-sm text-center text-slate-500">
                    No invoice items found.
                  </div>
                )}

              </div>

              {/* =========================================================
                  CREDIT NOTE REQUEST
              ========================================================= */}

              <div className="p-5 bg-white border shadow-sm rounded-xl border-slate-200">

                <h2 className="text-base font-semibold text-slate-800">
                  Credit Note Request
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This request will be made for the entire invoice.
                </p>

                {/* Reason */}

                <div className="mt-5">

                  <label
                    htmlFor="reason"
                    className="block mb-2 text-sm font-medium text-slate-700"
                  >
                    Reason for Credit Note
                  </label>

                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    rows={4}
                    placeholder="Enter the reason for requesting the credit note..."
                    className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />

                </div>

                {/* Submit */}

                <div className="flex justify-end mt-5">

                  <button
                    type="button"
                    disabled={isCreating}
                    onClick={handleSubmit}
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />

                        Creating Credit Note...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />

                        Submit Credit Note Request
                      </>
                    )}

                  </button>

                </div>

              </div>

            </>
          )}

        </main>
      </div>
    </div>
  );
}