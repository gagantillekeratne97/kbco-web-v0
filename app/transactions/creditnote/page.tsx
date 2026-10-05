"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getInvoiceCustomerInformation } from "@/lib/apis";
import { creditNoteInfo } from "@/lib/types";
import { useState } from "react";

export default function CreditNoteRequestPage() {
  const [customerInfo, setCustomerInfo] = useState<creditNoteInfo | null>(null);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

      const result = await getInvoiceCustomerInformation(invoiceNo.trim());      

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

  const handleClear = () => {
    setInvoiceNo("");
    setCustomerInfo(null);
    setReason("");
    setError("");
    setCurrentPage(1);
  };

  const handleSubmit = () => {
    if (!customerInfo) {
      setError("Please search for an invoice first.");
      return;
    }

    if (!reason.trim()) {
      setError("Please enter a reason for the credit note.");
      return;
    }

    // TODO:
    // Call your credit note request API here.
    console.log("Credit Note Request:", {
      invoiceNumber: customerInfo.invoiceNumber,
      reason: reason.trim(),
    });
  };

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const invoiceItems = customerInfo?.invoiceItems ?? [];

  const totalItems = invoiceItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentItems = invoiceItems.slice(startIndex, endIndex);

  // --------------------------------------------------
  // Pagination page numbers
  // --------------------------------------------------

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

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex min-h-screen bg-surface font-display">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Credit Note Request" />

        <main className="m-5 space-y-6">

          {/* =========================================================
              SEARCH INVOICE
          ========================================================= */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <h2 className="mb-1 text-base font-semibold text-slate-800">
              Search Invoice
            </h2>

            <p className="mb-4 text-sm text-slate-500">
              Enter an invoice number to view the invoice information.
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <label
              htmlFor="invoiceNo"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Invoice Number
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">

              <div className="relative flex-1">

                {/* Search icon */}
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                  />
                </svg>

                <input
                  id="invoiceNo"
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="e.g. 26JUL_GP2P_0001"
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />

              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Searching..." : "Search"}
              </button>

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
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="mb-5">
                  <h2 className="text-base font-semibold text-slate-800">
                    Invoice Review
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Review the invoice information before submitting the
                    credit note request.
                  </p>
                </div>


                {/* =====================================================
                    CUSTOMER INFORMATION
                ===================================================== */}
                <div className="mb-6">

                  <h3 className="mb-4 text-sm font-semibold text-slate-700">
                    Customer Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Customer Code
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {customerInfo.customerCode || "-"}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Customer Name
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {customerInfo.customerName || "-"}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Customer Address
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {customerInfo.customerAddress || "-"}
                      </p>
                    </div>

                  </div>
                </div>


                {/* =====================================================
                    INVOICE INFORMATION
                ===================================================== */}
                <div className="mb-6 border-t border-slate-100 pt-6">

                  <h3 className="mb-4 text-sm font-semibold text-slate-700">
                    Invoice Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Invoice Number
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {customerInfo.invoiceNumber || "-"}
                      </p>
                    </div>


                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
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


                {/* =====================================================
                    INVOICE SUMMARY
                ===================================================== */}
                <div className="border-t border-slate-100 pt-6">

                  <h3 className="mb-4 text-sm font-semibold text-slate-700">
                    Invoice Summary
                  </h3>

                  <div className="flex justify-end">

                    <div className="w-full max-w-sm space-y-3">

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          Sub Total
                        </span>

                        <span className="font-medium text-slate-800">                    
                          {customerInfo.subTotal}
                        </span>
                      </div>


                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          SSCL
                        </span>

                        <span className="font-medium text-slate-800">
                          {customerInfo.ssclAmount}
                        </span>
                      </div>


                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          VAT
                        </span>

                        <span className="font-medium text-slate-800">
                          {customerInfo.tax}
                        </span>
                      </div>


                      <div className="border-t border-slate-200 pt-3">

                        <div className="flex items-center justify-between">

                          <span className="text-sm font-semibold text-slate-700">
                            Total
                          </span>

                          <span className="text-lg font-bold text-slate-900">
                            {(
                              customerInfo.subTotal +
                              customerInfo.ssclAmount +
                              customerInfo.tax
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
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
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="text-base font-semibold text-slate-800">
                      Invoice Items
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Read-only invoice details for verification.
                    </p>
                  </div>

                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {totalItems} {totalItems === 1 ? "Item" : "Items"}
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

                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                              #
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                              Serial Number
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                              Machine Model
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                              Location
                            </th>

                            <th className="px-4 py-3 text-left font-semibold text-slate-600">
                              Billing Method
                            </th>

                            <th className="px-4 py-3 text-right font-semibold text-slate-600">
                              Start MR
                            </th>

                            <th className="px-4 py-3 text-right font-semibold text-slate-600">
                              End MR
                            </th>

                            <th className="px-4 py-3 text-right font-semibold text-slate-600">
                              Copies
                            </th>

                          </tr>

                        </thead>


                        <tbody className="divide-y divide-slate-100">

                          {currentItems.map((item, index) => (

                            <tr
                              key={`${item.serialNumber}-${index}`}
                              className="transition hover:bg-slate-50"
                            >

                              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                                {startIndex + index + 1}
                              </td>


                              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                                {item.serialNumber || "-"}
                              </td>


                              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                {item.machineModel || "-"}
                              </td>


                              <td className="px-4 py-3 text-slate-600">
                                {item.mLoc || "-"}
                              </td>


                              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                {item.billingMethod || "-"}
                              </td>


                              <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                                {item.startMr ?? "-"}
                              </td>


                              <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                                {item.endMr ?? "-"}
                              </td>


                              <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-800">
                                {item.invoiceCopies ?? "-"}
                              </td>

                            </tr>

                          ))}

                        </tbody>

                      </table>

                    </div>


                    {/* =================================================
                        PAGINATION
                    ================================================= */}
                    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

                      {/* Showing information */}
                      <p className="text-sm text-slate-500">

                        Showing{" "}

                        <span className="font-medium text-slate-700">
                          {startIndex + 1}
                        </span>

                        {" "}to{" "}

                        <span className="font-medium text-slate-700">
                          {Math.min(endIndex, totalItems)}
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
                            setCurrentPage((page) =>
                              Math.max(page - 1, 1)
                            )
                          }
                          disabled={currentPage === 1}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>


                        {/* Page numbers */}
                        {getPageNumbers().map((page, index) => {

                          if (page === "...") {
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
                                setCurrentPage(page as number)
                              }
                              className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                currentPage === page
                                  ? "bg-indigo-600 text-white"
                                  : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}


                        {/* Next */}
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((page) =>
                              Math.min(page + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>

                      </div>

                    </div>
                  </>
                ) : (
                  <div className="px-5 py-10 text-center text-sm text-slate-500">
                    No invoice items found.
                  </div>
                )}

              </div>


              {/* =========================================================
                  CREDIT NOTE REQUEST
              ========================================================= */}
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <h2 className="text-base font-semibold text-slate-800">
                  Credit Note Request
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This request will be made for the entire invoice.
                </p>


                <div className="mt-5">

                  <label
                    htmlFor="reason"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Reason for Credit Note
                  </label>

                  <textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    placeholder="Enter the reason for requesting the credit note..."
                    className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />

                </div>


                <div className="mt-5 flex justify-end">

                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
                  >
                    Submit Credit Note Request
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