"use client";

import { useState } from "react";
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
} from "lucide-react";

interface CreditNoteTableProps {
  data: CreditNote[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;

  onSearch?: (filters: {
    query: string;
    fromDate: string;
    toDate: string;
    status:string; 
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
    badge:
      "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
    icon: Clock3,
  },

  processing: {
    badge:
      "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
    icon: LoaderCircle,
  },

  approved: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },

  completed: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },

  success: {
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },

  rejected: {
    badge:
      "bg-red-50 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
    icon: XCircle,
  },

  failed: {
    badge:
      "bg-red-50 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
    icon: XCircle,
  },

  cancelled: {
    badge:
      "bg-slate-100 text-slate-600 ring-slate-500/20",
    dot: "bg-slate-400",
    icon: Ban,
  },

  canceled: {
    badge:
      "bg-slate-100 text-slate-600 ring-slate-500/20",
    dot: "bg-slate-400",
    icon: Ban,
  },
};

const defaultTransactionStatusStyle: StatusStyle = {
  badge:
    "bg-slate-100 text-slate-600 ring-slate-500/20",
  dot: "bg-slate-400",
  icon: CircleHelp,
};

/* =========================================================
   CREDIT NOTE STATUS STYLES
========================================================= */

const creditNoteStatusStyles: Record<
  string,
  { badge: string; dot: string }
> = {
  "pending hod approval": {
    badge:
      "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },

  processing: {
    badge:
      "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
  },

  "approved credit note": {
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },

  "rejected credit note": {
    badge:
      "bg-red-50 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
  },
};

const defaultCreditNoteStatusStyle = {
  badge:
    "bg-slate-100 text-slate-600 ring-slate-500/20",
  dot: "bg-slate-400",
};

/* =========================================================
   FORMAT STATUS LABEL
========================================================= */

const formatStatusLabel = (status?: string) => {
  if (!status) return "Unknown";

  return status
    .toLowerCase()
    .split(/[\s_-]+/)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

/* =========================================================
   FORMAT DATE
========================================================= */

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* =========================================================
   FORMAT AMOUNT
========================================================= */

const formatAmount = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "—";
  }

  return value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/* =========================================================
   TABLE CELL STYLES
========================================================= */

const cellBase =
  "px-4 py-3 text-sm text-slate-700 whitespace-nowrap";

const cellStrong =
  "px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap";

const cellNumeric =
  "px-4 py-3 text-sm text-slate-700 text-right whitespace-nowrap tabular-nums";

/* =========================================================
   COMPONENT
========================================================= */

export default function CreditNoteTable({
  data,
  currentPage,
  onPageChange,
  totalCount,
  totalPages,
  isLoading = false,
  onSearch,
}: CreditNoteTableProps) {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch = () => {
    onSearch?.({
      query: query.trim(),
      fromDate,
      toDate,
      status
    });

    onPageChange(1);
  };

  /* =======================================================
     CLEAR
  ======================================================= */

  const handleClear = () => {
    setQuery("");
    setFromDate("");
    setToDate("");

    onSearch?.({
      query: "",
      fromDate: "",
      toDate: "",
      status
    });

    onPageChange(1);
  };

  /* =======================================================
     GET INVOICE TRANSACTION STATUS STYLE
  ======================================================= */

  const getTransactionStatusStyle = (
    status?: string
  ): StatusStyle => {
    if (!status) {
      return defaultTransactionStatusStyle;
    }

    const normalized = status.trim().toLowerCase();

    /*
      Check rejected/failed first.
      This prevents statuses containing words such as
      "failed" from accidentally matching another category.
    */

    if (
      normalized.includes("rejected") ||
      normalized.includes("failed") ||
      normalized.includes("failure")
    ) {
      return transactionStatusStyles.rejected;
    }

    if (
      normalized.includes("cancelled") ||
      normalized.includes("canceled")
    ) {
      return transactionStatusStyles.cancelled;
    }

    if (
      normalized.includes("approved") ||
      normalized.includes("completed") ||
      normalized.includes("success")
    ) {
      return transactionStatusStyles.approved;
    }

    if (
      normalized.includes("processing") ||
      normalized.includes("progress")
    ) {
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

  /* =======================================================
     GET CREDIT NOTE STATUS STYLE
  ======================================================= */

  const getCreditNoteStatusStyle = (status?: string) => {
    if (!status) {
      return defaultCreditNoteStatusStyle;
    }

    const normalized = status
      .trim()
      .toLowerCase();

    return (
      creditNoteStatusStyles[normalized] ??
      defaultCreditNoteStatusStyle
    );
  };

  /* =======================================================
     PAGINATION
  ======================================================= */

  const pageSize =
    data.length > 0 ? data.length : 10;

  const getRowNumber = (index: number) => {
    return (
      (currentPage - 1) * pageSize +
      index +
      1
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="w-full space-y-4">

      {/* ===================================================
          FILTERS
      =================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">

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
              onChange={(e) =>
                setFromDate(e.target.value)
              }
              className="
                h-10
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                text-sm
                text-slate-700
                outline-none
                transition
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
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
              onChange={(e) =>
                setToDate(e.target.value)
              }
              className="
                h-10
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                text-sm
                text-slate-700
                outline-none
                transition
                focus:border-slate-500
                focus:ring-2
                focus:ring-slate-200
              "
            />

          </div>

          {/* SEARCH */}

          <div className="space-y-1.5 lg:col-span-2">

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
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  id="creditNoteSearch"
                  type="text"
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  placeholder="Search CN no, invoice no, customer..."
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    pl-9
                    pr-3
                    text-sm
                    text-slate-700
                    outline-none
                    placeholder:text-slate-400
                    transition
                    focus:border-slate-500
                    focus:ring-2
                    focus:ring-slate-200
                  "
                />

              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={isLoading}
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-slate-900
                  px-4
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Search size={16} />
                Search
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={isLoading}
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-slate-700
                  transition
                  hover:bg-slate-50
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <RotateCcw size={16} />
                Clear
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-sm
      ">

        {/* TABLE HEADER */}

        <div className="
          flex
          items-center
          justify-between
          border-b
          border-slate-200
          px-4
          py-3
        ">

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
                TABLE HEADER
            ================================================= */}

            <TableHeader>

              <TableRow className="bg-slate-50 hover:bg-slate-50">

                <TableHead className="px-4 py-3">
                  #
                </TableHead>

                <TableHead className="px-4 py-3">
                  Credit Note No
                </TableHead>

                <TableHead className="px-4 py-3">
                  Invoice Transaction Status
                </TableHead>

                <TableHead className="px-4 py-3">
                  CN Date
                </TableHead>

                <TableHead className="px-4 py-3">
                  Invoice Reference No
                </TableHead>

                <TableHead className="px-4 py-3">
                  Invoice Date
                </TableHead>

                <TableHead className="px-4 py-3">
                  Customer Code
                </TableHead>

                <TableHead className="px-4 py-3">
                  Customer
                </TableHead>

                <TableHead className="px-4 py-3">
                  Status
                </TableHead>

                <TableHead className="px-4 py-3 text-right">
                  Credit Note Value
                </TableHead>

                <TableHead className="px-4 py-3 text-right">
                  SSCL
                </TableHead>

                <TableHead className="px-4 py-3 text-right">
                  VAT
                </TableHead>

                <TableHead className="px-4 py-3">
                  REASON FOR CREDIT NOTE
                </TableHead>

                <TableHead className="px-4 py-3">
                  Credit Note Raised By
                </TableHead>

              </TableRow>

            </TableHeader>

            {/* =================================================
                TABLE BODY
            ================================================= */}

            <TableBody>

              {/* LOADING */}

              {isLoading ? (

                Array.from({ length: 8 }).map(
                  (_, index) => (

                    <TableRow key={index}>

                      {Array.from({
                        length: 14,
                      }).map(
                        (_, cellIndex) => (

                          <TableCell
                            key={cellIndex}
                            className="px-4 py-4"
                          >

                            <div className="
                              h-4
                              min-w-[70px]
                              animate-pulse
                              rounded
                              bg-slate-100
                            " />

                          </TableCell>

                        )
                      )}

                    </TableRow>

                  )
                )

              ) : data.length === 0 ? (

                /* =================================================
                    EMPTY STATE
                ================================================= */

                <TableRow>

                  <TableCell
                    colSpan={14}
                    className="h-64 text-center"
                  >

                    <div className="
                      flex
                      flex-col
                      items-center
                      justify-center
                    ">

                      <div className="
                        mb-3
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                      ">

                        <FileX2
                          size={24}
                          className="text-slate-400"
                        />

                      </div>

                      <p className="
                        text-sm
                        font-medium
                        text-slate-900
                      ">
                        No credit notes found
                      </p>

                      <p className="
                        mt-1
                        text-sm
                        text-slate-500
                      ">
                        Try changing your search or date range.
                      </p>

                    </div>

                  </TableCell>

                </TableRow>

              ) : (

                /* =================================================
                    DATA
                ================================================= */

                data.map(
                  (creditNote, index) => {

                    const transactionStatusStyle =
                      getTransactionStatusStyle(
                        creditNote.invTransactionStatus
                      );

                    const creditNoteStatusStyle =
                      getCreditNoteStatusStyle(
                        creditNote.creditNoteStatus
                      );

                    const TransactionIcon =
                      transactionStatusStyle.icon;

                    return (

                      <TableRow
                        key={`${creditNote.cnNo}-${index}`}
                        className="
                          transition-colors
                          hover:bg-slate-50
                        "
                      >

                        {/* ROW NUMBER */}

                        <TableCell className={cellBase}>
                          {getRowNumber(index)}
                        </TableCell>

                        {/* CREDIT NOTE NUMBER */}

                        <TableCell className={cellStrong}>
                          {creditNote.cnNo}
                        </TableCell>

                        {/* =================================================
                            INVOICE TRANSACTION STATUS
                        ================================================= */}

                        <TableCell className={cellBase}>

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              px-3
                              py-1.5
                              text-xs
                              font-semibold
                              ring-1
                              ring-inset
                              whitespace-nowrap
                              transition
                              ${transactionStatusStyle.badge}
                            `}
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
                              {formatStatusLabel(
                                creditNote.invTransactionStatus
                              )}
                            </span>

                          </span>

                        </TableCell>

                        {/* CN DATE */}

                        <TableCell className={cellBase}>
                          {formatDate(
                            creditNote.cnDate
                          )}
                        </TableCell>

                        {/* INVOICE NUMBER */}

                        <TableCell className={cellBase}>
                          {creditNote.invoiceNo}
                        </TableCell>

                        {/* INVOICE DATE */}

                        <TableCell className={cellBase}>
                          {formatDate(
                            creditNote.invoiceDate
                          )}
                        </TableCell>

                        {/* CUSTOMER CODE */}

                        <TableCell className={cellBase}>
                          {creditNote.customerCode}
                        </TableCell>

                        {/* CUSTOMER */}

                        <TableCell className={cellBase}>

                          <div className="
                            max-w-[220px]
                            truncate
                          ">
                            {creditNote.customerName}
                          </div>

                        </TableCell>

                        {/* =================================================
                            CREDIT NOTE STATUS
                        ================================================= */}

                        <TableCell className={cellBase}>

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              px-2.5
                              py-1
                              text-xs
                              font-medium
                              ring-1
                              ring-inset
                              whitespace-nowrap
                              ${creditNoteStatusStyle.badge}
                            `}
                          >

                            <span
                              className={`
                                h-1.5
                                w-1.5
                                shrink-0
                                rounded-full
                                ${creditNoteStatusStyle.dot}
                              `}
                            />

                            {formatStatusLabel(
                              creditNote.creditNoteStatus
                            )}

                          </span>

                        </TableCell>

                        {/* CREDIT NOTE VALUE */}

                        <TableCell
                          className={`
                            ${cellNumeric}
                            font-semibold
                            text-slate-900
                          `}
                        >
                          {formatAmount(
                            creditNote.creditNoteValue
                          )}
                        </TableCell>

                        {/* SSCL */}

                        <TableCell className={cellNumeric}>
                          {formatAmount(
                            creditNote.ssclAmount
                          )}
                        </TableCell>

                        {/* VAT */}

                        <TableCell className={cellNumeric}>
                          {formatAmount(
                            creditNote.vatAmount
                          )}
                        </TableCell>

                        {/* REASON */}

                        <TableCell className={cellBase}>

                          <div className="
                            max-w-[250px]
                            truncate
                          ">
                            {creditNote.crReason}
                          </div>

                        </TableCell>

                        {/* RAISED BY */}

                        <TableCell className={cellBase}>
                          {creditNote.crBy}
                        </TableCell>

                      </TableRow>

                    );
                  }
                )

              )}

            </TableBody>

          </Table>

        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="
          flex
          flex-col
          gap-3
          border-t
          border-slate-200
          px-4
          py-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        ">

          {/* PAGE INFO */}

          <div className="text-sm text-slate-500">

            Page{" "}

            <span className="font-medium text-slate-700">
              {currentPage}
            </span>

            {" "}of{" "}

            <span className="font-medium text-slate-700">
              {Math.max(totalPages, 1)}
            </span>

          </div>

          {/* PAGINATION BUTTONS */}

          <div className="flex items-center gap-1">

            {/* FIRST */}

            <button
              type="button"
              disabled={
                currentPage <= 1 ||
                isLoading
              }
              onClick={() =>
                onPageChange(1)
              }
              className="
                inline-flex
                h-8
                w-8
                items-center
                justify-center
                rounded-md
                border
                border-slate-200
                bg-white
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronsLeft size={16} />
            </button>

            {/* PREVIOUS */}

            <button
              type="button"
              disabled={
                currentPage <= 1 ||
                isLoading
              }
              onClick={() =>
                onPageChange(
                  currentPage - 1
                )
              }
              className="
                inline-flex
                h-8
                w-8
                items-center
                justify-center
                rounded-md
                border
                border-slate-200
                bg-white
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronLeft size={16} />
            </button>

            {/* CURRENT PAGE */}

            <div className="
              flex
              h-8
              min-w-8
              items-center
              justify-center
              rounded-md
              bg-slate-900
              px-2
              text-sm
              font-medium
              text-white
            ">
              {currentPage}
            </div>

            {/* NEXT */}

            <button
              type="button"
              disabled={
                currentPage >= totalPages ||
                isLoading
              }
              onClick={() =>
                onPageChange(
                  currentPage + 1
                )
              }
              className="
                inline-flex
                h-8
                w-8
                items-center
                justify-center
                rounded-md
                border
                border-slate-200
                bg-white
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronRight size={16} />
            </button>

            {/* LAST */}

            <button
              type="button"
              disabled={
                currentPage >= totalPages ||
                isLoading
              }
              onClick={() =>
                onPageChange(totalPages)
              }
              className="
                inline-flex
                h-8
                w-8
                items-center
                justify-center
                rounded-md
                border
                border-slate-200
                bg-white
                text-slate-600
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronsRight size={16} />
            </button>

          </div>

        </div>

      </div>

    </section>
  );
}