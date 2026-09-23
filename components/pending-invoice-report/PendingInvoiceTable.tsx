"use client";

import { useState } from "react";
import type { InvoiceLists, PendingInvoiceLists } from "@/lib/types";

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
} from "lucide-react";

interface PendingInvoiceProps {
  data: PendingInvoiceLists[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;

  onSearch?: (filters: {
    query: string;
    fromDate: string;
    toDate: string;
  }) => void;
}

type StatusKey = "invoiced" | "creditnote" | "receipted" | "cancelled" | "pending";

const statusStyles: Record<StatusKey, { badge: string; dot: string }> = {
  invoiced: {
    badge: "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
  },
  creditnote: {
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  receipted: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  cancelled: {
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },

  pending: {
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
  },
};

const defaultStatusStyle = {
  badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
  dot: "bg-slate-400",
};

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

const formatAmount = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "—";
  }

  return value.toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const cellBase =
  "px-4 py-3 text-sm text-slate-700 whitespace-nowrap";

const cellStrong =
  "px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap";

const cellNumeric =
  "px-4 py-3 text-sm text-slate-700 text-right whitespace-nowrap tabular-nums";

export default function InvoiceTable({
  data,
  currentPage,
  onPageChange,
  totalCount,
  totalPages,
  isLoading = false,
  onSearch,
}: PendingInvoiceProps) {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");  

  const handleSearch = () => {
    onSearch?.({
      query: query.trim(),
      fromDate,
      toDate,
    });

    onPageChange(1);
  };

  const handleClear = () => {
    setQuery("");
    setFromDate("");
    setToDate("");

    onSearch?.({
      query: "",
      fromDate: "",
      toDate: "",
    });

    onPageChange(1);
  };

const getStatusStyle = (status?: string) => {  
  // "Credit Note", "credit_note", "CreditNote" -> "creditnote"
  const key = (status ?? "").toLowerCase().replace(/[\s_-]+/g, "");
  console.log(key);
  return statusStyles[key as StatusKey] ?? defaultStatusStyle;
};

  const pageSize = data.length > 0
    ? data.length
    : 10;

  const getRowNumber = (index: number) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  return (
    <section className="w-full space-y-4">            

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Invoice List Report
            </h2>

            <p className="text-sm text-slate-500">
              {totalCount.toLocaleString()} record
              {totalCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <Table>

            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">

                <TableHead className="px-4 py-3">
                  #
                </TableHead>

                <TableHead className="px-4 py-3">
                  Customer Code
                </TableHead>

                <TableHead className="px-4 py-3">  
                  Agreement Code
                </TableHead>

                <TableHead className="px-4 py-3">
                  Customer Name
                </TableHead>

                <TableHead className="px-4 py-3">
                  Last invoice No
                </TableHead>

                <TableHead className="px-4 py-3">
                  Last Invoice Date
                </TableHead>

                <TableHead className="px-4 py-3">
                  Last inv Period Start
                </TableHead>                
                <TableHead className="px-4 py-3"> 
                  Last inv Period End
                </TableHead>
                <TableHead className="px-4 py-3"> 
                  Renewal Status
                </TableHead>                
              </TableRow>
            </TableHeader>

            <TableBody>

              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 11 }).map(
                      (_, cellIndex) => (
                        <TableCell
                          key={cellIndex}
                          className="px-4 py-4"
                        >
                          <div className="h-4 min-w-[70px] animate-pulse rounded bg-slate-100" />
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              ) : data.length === 0 ? (

                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">

                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <FileX2
                          size={24}
                          className="text-slate-400"
                        />
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

                data.map((invoiceInfo, index) => {                  
                  const statusStyle = getStatusStyle(
                    invoiceInfo.renewalStatus
                  );                  

                  return (
                    <TableRow
                      key={`${invoiceInfo.customerCode}-${index}`}
                      className="hover:bg-slate-50"
                    >                      
                      <TableCell className={cellBase}>
                        {getRowNumber(index)}
                      </TableCell>

                      <TableCell className={cellStrong}>
                        {invoiceInfo.customerCode}
                      </TableCell>

                      <TableCell className={cellBase}> 
                        {invoiceInfo.agreementCode}
                      </TableCell>

                      <TableCell className={cellBase}> 
                        {invoiceInfo.customerName}
                      </TableCell>

                      <TableCell className={cellBase}>                        
                        {invoiceInfo.invNo}
                      </TableCell>                      

                      <TableCell className={cellBase}>                        
                        {formatDate(invoiceInfo.invDate)}
                      </TableCell>                

                      <TableCell className={cellBase}>
                        {formatDate(invoiceInfo.invPeriodStart)}
                      </TableCell>                      

                      <TableCell className={cellBase}>
                        {formatDate(invoiceInfo.invPeriodEnd)}
                      </TableCell>                                            

                      <TableCell className={cellBase}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyle.badge}`}
                      >                        
                          <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                          {formatStatusLabel(invoiceInfo.renewalStatus)}
                        </span>
                      </TableCell>                                            
                    </TableRow>
                  );
                })
              )}

            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="text-sm text-slate-500">
            Page{" "}
            <span className="font-medium text-slate-700">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">
              {Math.max(totalPages, 1)}
            </span>
          </div>

          <div className="flex items-center gap-1">

            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() =>
                onPageChange(currentPage - 1)
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex h-8 min-w-8 items-center justify-center rounded-md bg-slate-900 px-2 text-sm font-medium text-white">
              {currentPage}
            </div>

            <button
              type="button"
              disabled={
                currentPage >= totalPages ||
                isLoading
              }
              onClick={() =>
                onPageChange(currentPage + 1)
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              disabled={
                currentPage >= totalPages ||
                isLoading
              }
              onClick={() =>
                onPageChange(totalPages)
              }
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronsRight size={16} />
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}