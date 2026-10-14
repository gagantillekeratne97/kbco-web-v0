"use client";

import { useEffect, useState } from "react";
import type { CreditNote } from "@/lib/types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  FileX2,
  Search,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock3,
  LoaderCircle,
  Ban,
  CircleHelp,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { approveCreditNoteFinance, approveCreditNoteHOD, getInvoiceCustomerInformation } from "@/lib/apis";
import CreditNoteModal from "../credit-note-modal/creditNoteModal";

interface CreditNoteTableProps {
  data: CreditNote[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;

  onSearch?: (filters: {
    query: string;
    fromDate: string;
    toDate: string;
    status: string;
  }) => void;
}

/* =========================================================
   STATUS TYPES
========================================================= */

type StatusStyle = {
  badge: string;
  dot: string;
  icon: React.ElementType;
};

/* =========================================================
   INVOICE TRANSACTION STATUS STYLES
========================================================= */

const transactionStatusStyles = {
  pending: {
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
    icon: Clock3,
  },
  processing: {
    badge: "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
    icon: LoaderCircle,
  },
  approved: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  rejected: {
    badge: "bg-red-50 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
    icon: XCircle,
  },
  cancelled: {
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
    dot: "bg-slate-400",
    icon: Ban,
  },
};

const defaultTransactionStatusStyle: StatusStyle = {
  badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
  dot: "bg-slate-400",
  icon: CircleHelp,
};

/* =========================================================
   CREDIT NOTE STATUS STYLES
========================================================= */

const creditNoteStatusStyles: Record<string, { badge: string; dot: string }> = {
  "pending hod approval": {
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  "Pending Finance Approval": {
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  processing: {
    badge: "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
  },
  "approved credit note": {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  "rejected credit note": {
    badge: "bg-red-50 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
  },
};

const defaultCreditNoteStatusStyle = {
  badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
  dot: "bg-slate-400",
};

/* =========================================================
   FORMAT HELPERS
========================================================= */

const formatStatusLabel = (status?: string) => {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatAmount = (value?: number | null) => {
  if (value === null || value === undefined) return "—";

  return value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/* Shows a faint dash for empty text values */
const orDash = (value?: string | null) =>
  value && value.trim() !== "" ? (
    value
  ) : (
    <span className="text-slate-300">—</span>
  );

/* =========================================================
   TABLE STYLES
========================================================= */

const COLUMN_COUNT = 21; // must match the number of <TableHead> items

const cellBase = "px-4 py-3 text-sm text-slate-600 whitespace-nowrap";
const cellStrong = "px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap";
const cellNumeric =
  "px-4 py-3 text-sm text-slate-700 text-right whitespace-nowrap tabular-nums";

const headBase =
  "h-11 px-4 text-xs font-semibold tracking-wide text-slate-600 whitespace-nowrap";
const headRight = `${headBase} text-right`;

/* Sticky (frozen) left columns: "#" and "Action" */
const stickyNumHead = `${headBase} sticky left-0 z-[2] w-[56px] min-w-[56px] bg-slate-50`;
const stickyActionHead = `${headBase} sticky left-[56px] z-[2] min-w-[110px] bg-slate-50 text-center shadow-[1px_0_0_#e2e8f0]`;
const stickyNumCell =
  "sticky left-0 z-[1] w-[56px] min-w-[56px] bg-white px-4 py-3 text-sm tabular-nums text-slate-400 transition-colors group-hover:bg-slate-50";
const stickyActionCell =
  "sticky left-[56px] z-[1] min-w-[110px] bg-white px-4 py-3 text-center transition-colors group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]";

const inputBase =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

const pageButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

/* =========================================================
   COMPONENT
========================================================= */

export default function CreditNoteTable({
  data,
  currentPage,
  onPageChange,
  totalCount,
  totalPages,
  pageSize = 10,
  isLoading = false,
  onSearch,
}: CreditNoteTableProps) {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);  
  const [selectedCNNo, setSelectedCNNo] = useState("");
  const [userRole, setUserRole] = useState("");

  /* =======================================================
     SEARCH / CLEAR
  ======================================================= */  

  const handleSearch = () => {
    onSearch?.({
      query: query.trim(),
      fromDate,
      toDate,
      status,
    });

    onPageChange(1);
  };

  const GetUserRole = (): string => { 
  const userrole = localStorage.getItem("userRole") || sessionStorage.getItem("userRole"); 
  if (!userrole) { 
    throw new Error("User role not found.");
  }

  return userrole;
  }

  useEffect(() => { 
    const userrole = GetUserRole();
    setUserRole(userrole);
  });

  const handleClear = () => {
    setQuery("");
    setFromDate("");
    setToDate("");
    setStatus("");

    onSearch?.({
      query: "",
      fromDate: "",
      toDate: "",
      status: "",
    });

    onPageChange(1);
  };  

  /* =======================================================
     ROW CLICK
     (replace with router.push to the approval page)
  ======================================================= */

  const handleRowClick = (cnNo: string) => {
    console.log("Row clicked for CN No:", cnNo);
  };

  /* =======================================================
     STATUS STYLE HELPERS
  ======================================================= */

  const getTransactionStatusStyle = (status?: string): StatusStyle => {
    if (!status) return defaultTransactionStatusStyle;

    const normalized = status.trim().toLowerCase();

    /* Check rejected/failed first so they never match another category */

    if (
      normalized.includes("rejected") ||
      normalized.includes("failed") ||
      normalized.includes("failure")
    ) {
      return transactionStatusStyles.rejected;
    }

    if (normalized.includes("cancelled") || normalized.includes("canceled")) {
      return transactionStatusStyles.cancelled;
    }

    if (
      normalized.includes("approved") ||
      normalized.includes("completed") ||
      normalized.includes("success")
    ) {
      return transactionStatusStyles.approved;
    }

    if (normalized.includes("processing") || normalized.includes("progress")) {
      return transactionStatusStyles.processing;
    }

    if (
      normalized.includes("pending") ||
      normalized.includes("waiting") ||
      normalized.includes("approval")
    ) {
      return transactionStatusStyles.pending;
    }

    return defaultTransactionStatusStyle;
  };

  const getCreditNoteStatusStyle = (status?: string) => {
    if (!status) return defaultCreditNoteStatusStyle;

    return (
      creditNoteStatusStyles[status.trim().toLowerCase()] ??
      defaultCreditNoteStatusStyle
    );
  };

  /* =======================================================
     ROW NUMBER
  ======================================================= */

  const getRowNumber = (index: number) =>
    (currentPage - 1) * pageSize + index + 1;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="w-full space-y-4">
      {/* ===================================================
          FILTERS
      =================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* FROM DATE */}

          <div className="space-y-1.5">
            <label
              htmlFor="fromDate"
              className="text-sm font-medium text-slate-700"
            >
              Date From
            </label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className={inputBase}
            />
          </div>

          {/* TO DATE */}

          <div className="space-y-1.5">
            <label
              htmlFor="toDate"
              className="text-sm font-medium text-slate-700"
            >
              Date To
            </label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className={inputBase}
            />
          </div>

          {/* STATUS */}

          <div className="space-y-1.5">
            <label
              htmlFor="statusFilter"
              className="text-sm font-medium text-slate-700"
            >
              Status
            </label>
            <select
              id="statusFilter"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputBase}
            >
              <option value="">All statuses</option>
              {Object.keys(creditNoteStatusStyles).map((key) => (
                <option key={key} value={key}>
                  {formatStatusLabel(key)}
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH */}

          <div className="space-y-1.5 md:col-span-2">
            <label
              htmlFor="creditNoteSearch"
              className="text-sm font-medium text-slate-700"
            >
              Search
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="creditNoteSearch"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  placeholder="CN no, invoice no, customer..."
                  className={`${inputBase} pl-9`}
                />
              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Search size={16} />
                Search
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          TABLE CARD
      =================================================== */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* CARD HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Credit Note Report
            </h2>
            <p className="text-sm text-slate-500">
              {totalCount.toLocaleString()} record
              {totalCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* TABLE SCROLL */}

        <div className="w-full overflow-x-auto">
          <Table>
            {/* =================================================
                HEADER
            ================================================= */}

            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className={stickyNumHead}>#</TableHead>
                <TableHead className={stickyActionHead}>Action</TableHead>
                <TableHead className={headBase}>Credit Note No</TableHead>
                <TableHead className={headBase}>
                  Invoice Transaction Status
                </TableHead>
                <TableHead className={headBase}>CN Date</TableHead>
                <TableHead className={headBase}>Invoice Reference No</TableHead>
                <TableHead className={headBase}>Invoice Date</TableHead>
                <TableHead className={headBase}>Customer Code</TableHead>
                <TableHead className={headBase}>Customer</TableHead>
                <TableHead className={headBase}>Status</TableHead>
                <TableHead className={headRight}>Credit Note Value</TableHead>
                <TableHead className={headRight}>SSCL</TableHead>
                <TableHead className={headRight}>VAT</TableHead>
                <TableHead className={headBase}>Reason for Credit Note</TableHead>
                <TableHead className={headBase}>Credit Note Raised By</TableHead>
                <TableHead className={headBase}>HOD Comment</TableHead>
                <TableHead className={headBase}>Approved By</TableHead>
                <TableHead className={headBase}>Approved Date</TableHead>
                <TableHead className={headBase}>Finance Comment</TableHead>
                <TableHead className={headBase}>Finance Approved By</TableHead>
                <TableHead className={headBase}>
                  Finance Approved Date
                </TableHead>
              </TableRow>
            </TableHeader>

            {/* =================================================
                BODY
            ================================================= */}

            <TableBody>
              {isLoading ? (
                /* ---------- LOADING ---------- */

                Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index} className="border-b border-slate-100">
                    {Array.from({ length: COLUMN_COUNT - 1 }).map(
                      (_, cellIndex) => (
                        <TableCell key={cellIndex} className="px-4 py-3.5">
                          <div className="h-4 min-w-[70px] animate-pulse rounded bg-slate-100" />
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                /* ---------- EMPTY STATE ---------- */

                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMN_COUNT - 1}
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <FileX2 size={24} className="text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        No credit notes found
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or date range.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                /* ---------- DATA ---------- */

                data.map((creditNote, index) => {
                  const transactionStatusStyle = getTransactionStatusStyle(
                    creditNote.invTransactionStatus
                  );
                  const creditNoteStatusStyle = getCreditNoteStatusStyle(
                    creditNote.creditNoteStatus
                  );
                  const TransactionIcon = transactionStatusStyle.icon;

                  return (
                    <TableRow
                      key={`${creditNote.cnNo}-${index}`}
                      onClick={() => handleRowClick(creditNote.cnNo)}
                      className="group cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50"
                    >
                      {/* ROW NUMBER */}

                      <TableCell className={stickyNumCell}>
                        {getRowNumber(index)}
                      </TableCell>

                      {/* VIEW BUTTON */}

                      <TableCell className={stickyActionCell}>
                        <Link
                          href="#"
                          onClick={() => {
                            setIsModalOpen(true); 
                            setSelectedCNNo(String(creditNote.cnNo));
                          }}
                          aria-label={`View credit note ${creditNote.cnNo}`}                          
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                        >
                          <Eye size={14} strokeWidth={2} />
                          View
                        </Link>
                      </TableCell>                                            
                      {/* CREDIT NOTE NUMBER */}

                      <TableCell className={cellStrong}>
                        {creditNote.cnNo}
                      </TableCell>

                      {/* INVOICE TRANSACTION STATUS */}

                      <TableCell className={cellBase}>
                        <span
                          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${transactionStatusStyle.badge}`}
                        >
                          <TransactionIcon
                            size={14}
                            strokeWidth={2.2}
                            className={
                              creditNote.invTransactionStatus
                                ?.toLowerCase()
                                .includes("processing")
                                ? "animate-spin"
                                : ""
                            }
                          />
                          <span>
                            {formatStatusLabel(creditNote.invTransactionStatus)}
                          </span>
                        </span>
                      </TableCell>

                      {/* CN DATE */}

                      <TableCell className={cellBase}>
                        {formatDate(creditNote.cnDate)}
                      </TableCell>

                      {/* INVOICE NUMBER */}

                      <TableCell className={cellBase}>
                        {creditNote.invoiceNo}
                      </TableCell>

                      {/* INVOICE DATE */}

                      <TableCell className={cellBase}>
                        {formatDate(creditNote.invoiceDate)}
                      </TableCell>

                      {/* CUSTOMER CODE */}

                      <TableCell className={cellBase}>
                        {creditNote.customerCode}
                      </TableCell>

                      {/* CUSTOMER */}

                      <TableCell className={cellBase}>
                        <div
                          className="max-w-[220px] truncate"
                          title={creditNote.customerName}
                        >
                          {creditNote.customerName}
                        </div>
                      </TableCell>

                      {/* CREDIT NOTE STATUS */}

                      <TableCell className={cellBase}>
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${creditNoteStatusStyle.badge}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${creditNoteStatusStyle.dot}`}
                          />
                          {formatStatusLabel(creditNote.creditNoteStatus)}
                        </span>
                      </TableCell>

                      {/* CREDIT NOTE VALUE */}

                      <TableCell
                        className={`${cellNumeric} font-semibold text-slate-900`}
                      >
                        {formatAmount(creditNote.creditNoteValue)}
                      </TableCell>

                      {/* SSCL */}

                      <TableCell className={cellNumeric}>
                        {formatAmount(creditNote.ssclAmount)}
                      </TableCell>

                      {/* VAT */}

                      <TableCell className={cellNumeric}>
                        {formatAmount(creditNote.vatAmount)}
                      </TableCell>

                      {/* REASON */}

                      <TableCell className={cellBase}>
                        <div
                          className="max-w-[250px] truncate"
                          title={creditNote.crReason}
                        >
                          {orDash(creditNote.crReason)}
                        </div>
                      </TableCell>

                      {/* RAISED BY */}

                      <TableCell className={cellBase}>
                        {orDash(creditNote.crBy)}
                      </TableCell>

                      {/* HOD COMMENT */}

                      <TableCell className={cellBase}>
                        <div
                          className="max-w-[220px] truncate"
                          title={creditNote.hodCrComment}
                        >
                          {orDash(creditNote.hodCrComment)}
                        </div>
                      </TableCell>

                      {/* APPROVED BY */}

                      <TableCell className={cellBase}>
                        {orDash(creditNote.approvedBy)}
                      </TableCell>

                      {/* APPROVED DATE */}

                      <TableCell className={cellBase}>
                        {formatDate(creditNote.approvedDate)}
                      </TableCell>

                      {/* FINANCE COMMENT */}

                      <TableCell className={cellBase}>
                        <div
                          className="max-w-[220px] truncate"
                          title={creditNote.financeComment}
                        >
                          {orDash(creditNote.financeComment)}
                        </div>
                      </TableCell>

                      {/* FINANCE APPROVED BY */}

                      <TableCell className={cellBase}>
                        {orDash(creditNote.financeAppBy)}
                      </TableCell>

                      {/* FINANCE APPROVED DATE */}

                      <TableCell className={cellBase}>
                        {formatDate(creditNote.financeAppDate)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>          

          {(["Doculine", "P2P"].includes(userRole)) && (
              <CreditNoteModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  invoiceNumber={selectedCNNo}
                  onApprove={async (invoiceNumber, comment) => {
                      await approveCreditNoteHOD(invoiceNumber, comment);
                  }}
              />
          )}
          

          {(["Finance", "Administrator"].includes(userRole)) && (
              <CreditNoteModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  invoiceNumber={selectedCNNo}
                  onApprove={async (invoiceNumber, comment) => {
                      await approveCreditNoteFinance(invoiceNumber, comment);
                  }}
              />
          )}
          

          {/* <CreditNoteModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          invoiceNumber={selectedCNNo}
          onApprove={async (invoiceNumber, comment) => { 
            await approveCreditNoteHOD(invoiceNumber, comment);
          }}
          />               */}

          {/* <InvoiceModal 
                      isOpen={isModalOpen} 
                      onClose={() => setIsModalOpen(false)}
                      invoiceNumber={selectedCNNo}/>                        */}
        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {/* PAGE INFO */}

          <div className="text-sm text-slate-500">
            Page{" "}
            <span className="font-medium text-slate-700">{currentPage}</span> of{" "}
            <span className="font-medium text-slate-700">
              {Math.max(totalPages, 1)}
            </span>
          </div>

          {/* PAGINATION BUTTONS */}

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="First page"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(1)}
              className={pageButton}
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
              className={pageButton}
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex h-8 min-w-8 items-center justify-center rounded-md bg-slate-900 px-2 text-sm font-medium text-white">
              {currentPage}
            </div>

            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              className={pageButton}
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              aria-label="Last page"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(totalPages)}
              className={pageButton}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}