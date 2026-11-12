"use client";

import { useEffect, useState, type ElementType } from "react";
import type {
  MachineReturnApprovalFinanceRequest,
  machineReturnResponseDto,
} from "@/lib/types";

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
  CircleHelp,
  Eye,
  PrinterIcon,
  ClipboardCheck,
} from "lucide-react";

import MachineReturnModal, {
  type MachineReturnDetails,
} from "./MachineReturnModal";
import MachineReturnHOD, { type hodApprovalData } from "./MachineReturnHOD";

import {
  approveMachineReturnFinance,
  approveMachineReturnHod,
} from "@/lib/apis";

/* =========================================================
   STATUS STYLES
========================================================= */

type StatusStyle = {
  badge: string;
  dot: string;
  icon: ElementType;
};

const machineStatusStyles = {
  PENDING_HOD: {
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
    icon: Clock3,
  },
  PENDING_FINANCE: {
    badge: "bg-violet-50 text-violet-700 ring-violet-600/20",
    dot: "bg-violet-500",
    icon: Clock3,
  },
  COLLECTED: {
    badge: "bg-blue-50 text-blue-700 ring-blue-600/20",
    dot: "bg-blue-500",
    icon: LoaderCircle,
  },
  APPROVED: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  REJECTED: {
    badge: "bg-red-50 text-red-700 ring-red-600/20",
    dot: "bg-red-500",
    icon: XCircle,
  },
};

const defaultStatusStyle: StatusStyle = {
  badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
  dot: "bg-slate-400",
  icon: CircleHelp,
};

const getStatusStyle = (status?: string): StatusStyle => {
  if (!status) return defaultStatusStyle;

  // "Pending HOD", "pending-hod" and "PENDING_HOD" all become "pending_hod"
  const normalized = status.trim().toLowerCase().replace(/[\s-]+/g, "_");

  // Pending checks come first so "pending_finance_approval" is not
  // mistaken for an approved status.
  if (normalized.includes("pending_finance")) {
    return machineStatusStyles.PENDING_FINANCE;
  }

  if (normalized.includes("pending_hod")) {
    return machineStatusStyles.PENDING_HOD;
  }

  if (
    normalized.includes("rejected") ||
    normalized.includes("failed") ||
    normalized.includes("failure")
  ) {
    return machineStatusStyles.REJECTED;
  }

  if (
    normalized.includes("approved") ||
    normalized.includes("completed") ||
    normalized.includes("success")
  ) {
    return machineStatusStyles.APPROVED;
  }

  if (normalized.includes("collect")) {
    return machineStatusStyles.COLLECTED;
  }

  return defaultStatusStyle;
};

/* =========================================================
   FORMATTERS
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

const orDash = (value?: string | null) =>
  value && value.trim() !== "" ? (
    value
  ) : (
    <span className="text-slate-300">—</span>
  );

/* =========================================================
   PROPS
========================================================= */

interface MachineReturnTableProps {
  data: machineReturnResponseDto[];
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

  /** Called after a successful approve/reject so the parent can reload the list. */
  onRefresh?: () => void;
}

/* =========================================================
   LAYOUT CLASSES
========================================================= */

const COLUMN_COUNT = 13;

/** Roles that use the HOD approval modal. Everyone else gets the finance modal. */
const HOD_ROLES = ["P2P", "Doculine"];

const cellBase = "px-4 py-3 text-sm text-slate-600 whitespace-nowrap";

const cellStrong =
  "px-4 py-3 text-sm font-medium text-slate-900 whitespace-nowrap";

const headBase =
  "h-11 px-4 text-xs font-semibold tracking-wide text-slate-600 whitespace-nowrap";

const stickyNumHead = `${headBase} sticky left-0 z-[2] w-[56px] min-w-[56px] bg-slate-50`;

const stickyPrintHead = `${headBase} sticky left-[56px] z-[2] w-[190px] min-w-[190px] bg-slate-50 text-center`;

const stickyActionHead = `${headBase} sticky left-[246px] z-[2] min-w-[170px] bg-slate-50 text-center shadow-[1px_0_0_#e2e8f0]`;

const stickyNumCell =
  "sticky left-0 z-[1] w-[56px] min-w-[56px] bg-white px-4 py-3 text-sm tabular-nums text-slate-400 transition-colors group-hover:bg-slate-50";

const stickyPrintCell =
  "sticky left-[56px] z-[1] w-[190px] min-w-[190px] bg-white px-4 py-3 text-center transition-colors group-hover:bg-slate-50";

const stickyActionCell =
  "sticky left-[246px] z-[1] min-w-[170px] bg-white px-4 py-3 text-center transition-colors group-hover:bg-slate-50 shadow-[1px_0_0_#e2e8f0]";

const rowButton =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300";

const inputBase =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

const pageButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

/* =========================================================
   COMPONENT
========================================================= */

export default function MachineReturnTable({
  data,
  currentPage,
  onPageChange,
  totalCount,
  totalPages,
  pageSize = 10,
  isLoading = false,
  onSearch,
  onRefresh,
}: MachineReturnTableProps) {
  /* =======================================================
     SEARCH STATE
  ======================================================= */

  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("");

  /* =======================================================
     USER / ROLE STATE
  ======================================================= */

  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const [companyId, setCompanyId] = useState("");

  // Worked out from the role, so it can never get out of sync with it
  const isHodRole = HOD_ROLES.includes(userRole);

  /* =======================================================
     MODAL STATE
     A modal is open exactly when a row is selected.
  ======================================================= */

  const [selectedReturn, setSelectedReturn] =
    useState<machineReturnResponseDto | null>(null);

  /* =======================================================
     LOAD USER INFORMATION
  ======================================================= */

  useEffect(() => {
    const read = (key: string) =>
      localStorage.getItem(key) || sessionStorage.getItem(key) || "";

    setUserRole(read("userRole"));
    setUserName(read("userName"));
    setCompanyId(read("companyID"));
  }, []);

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
     APPROVAL MODAL
  ======================================================= */

  const openApprovalModal = (row: machineReturnResponseDto) => {
    setSelectedReturn(row);
  };

  const closeApprovalModal = () => {
    setSelectedReturn(null);
  };

  /* =======================================================
     HOD APPROVAL API
  ======================================================= */

  const submitHodDecision = async (
    decision: "approve" | "reject",
    formData: hodApprovalData
  ) => {
    if (!selectedReturn) return;

    try {
      await approveMachineReturnHod(formData, decision);

      closeApprovalModal();
      onRefresh?.();

      alert(
        `Machine return HOD ${decision === "approve" ? "approval" : "rejection"} completed successfully.`
      );
    } catch (error) {
      console.error("HOD approval failed:", error);

      alert(
        error instanceof Error
          ? error.message
          : "HOD approval failed. Please try again."
      );
    }
  };

  /* =======================================================
     FINANCE APPROVAL API
     Errors are NOT caught here on purpose: the finance modal
     catches them and shows the message inside the dialog.
  ======================================================= */

  const submitFinanceDecision = async (
    formData: MachineReturnApprovalFinanceRequest
  ) => {
    if (!selectedReturn) return;

    // Approve or reject is already inside formData.approverDetails.status
    await approveMachineReturnFinance(formData);

    closeApprovalModal();
    onRefresh?.();

    alert("Machine return finance decision completed successfully.");
  };

  /* =======================================================
     SELECTED RETURN DETAILS
  ======================================================= */

  const details: MachineReturnDetails | undefined = selectedReturn
    ? {
        customerName: selectedReturn.customerName,
        agreementCode: selectedReturn.agreementCode ?? "",
        address: selectedReturn.address ?? "",
        contactPerson: selectedReturn.contactPerson ?? "",
        model: selectedReturn.model ?? "",
        serialNo: selectedReturn.serialNumber,
        noOfMachines: String(selectedReturn.noOfMachines ?? ""),
        invoiceNo: selectedReturn.invoiceNumber,
        location: selectedReturn.location ?? "",
        meterReading: selectedReturn.meterReading ?? "",
        handoverDate: formatDate(selectedReturn.installationDate),
        reasonForReturn: selectedReturn.returnReason,
      }
    : undefined;

  /* =======================================================
     ROW HELPERS
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

              {Object.keys(machineStatusStyles).map((key) => (
                <option key={key} value={key}>
                  {formatStatusLabel(key)}
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH */}

          <div className="space-y-1.5 md:col-span-2">
            <label
              htmlFor="machineReturnSearch"
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
                  id="machineReturnSearch"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  placeholder="Return ID, serial no, customer..."
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
              Machine Return Report
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
            {/* HEADER */}

            <TableHeader>
              <TableRow className="border-b border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className={stickyNumHead}>#</TableHead>
                <TableHead className={stickyPrintHead}>Print / View</TableHead>
                <TableHead className={stickyActionHead}>Action</TableHead>
                <TableHead className={headBase}>Machine Return ID</TableHead>
                <TableHead className={headBase}>
                  Machine Return Status
                </TableHead>
                <TableHead className={headBase}>Date</TableHead>
                <TableHead className={headBase}>Serial Number</TableHead>
                <TableHead className={headBase}>P Number</TableHead>
                <TableHead className={headBase}>Part Number</TableHead>
                <TableHead className={headBase}>Customer Name</TableHead>
                <TableHead className={headBase}>Return Reason</TableHead>
                <TableHead className={headBase}>Department</TableHead>
                <TableHead className={headBase}>Installation Date</TableHead>
              </TableRow>
            </TableHeader>

            {/* BODY */}

            <TableBody>
              {isLoading ? (
                /* LOADING */

                Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index} className="border-b border-slate-100">
                    {Array.from({ length: COLUMN_COUNT }).map(
                      (_, cellIndex) => (
                        <TableCell key={cellIndex} className="px-4 py-3.5">
                          <div className="h-4 min-w-[70px] animate-pulse rounded bg-slate-100" />
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                /* EMPTY STATE */

                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <FileX2 size={24} className="text-slate-400" />
                      </div>

                      <p className="text-sm font-medium text-slate-900">
                        No machine returns found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or date range.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                /* DATA */

                data.map((row, index) => {
                  const statusStyle = getStatusStyle(row.status);
                  const StatusIcon = statusStyle.icon;

                  return (
                    <TableRow
                      key={`${row.returnId}-${index}`}
                      className="group border-b border-slate-100 transition-colors hover:bg-slate-50"
                    >
                      {/* ROW NUMBER */}

                      <TableCell className={stickyNumCell}>
                        {getRowNumber(index)}
                      </TableCell>

                      {/* PRINT + VIEW */}

                      <TableCell className={stickyPrintCell}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              // TODO: call the printing function here
                            }}
                            aria-label={`Print machine return ${row.returnId}`}
                            className={rowButton}
                          >
                            <PrinterIcon size={14} strokeWidth={2} />
                            Print
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              // TODO: open the viewer here
                            }}
                            aria-label={`View machine return ${row.returnId}`}
                            className={rowButton}
                          >
                            <Eye size={14} strokeWidth={2} />
                            View
                          </button>
                        </div>
                      </TableCell>

                      {/* APPROVE / REJECT */}

                      <TableCell className={stickyActionCell}>
                        <button
                          type="button"
                          onClick={() => openApprovalModal(row)}
                          aria-label={`Approve or reject machine return ${row.returnId}`}
                          className={rowButton}
                        >
                          <ClipboardCheck size={14} strokeWidth={2} />
                          Approve/Reject
                        </button>
                      </TableCell>

                      {/* MACHINE RETURN ID */}

                      <TableCell className={cellStrong}>
                        {row.returnId}
                      </TableCell>

                      {/* STATUS */}

                      <TableCell className={cellBase}>
                        <span
                          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle.badge}`}
                        >
                          <StatusIcon size={14} strokeWidth={2.2} />
                          <span>{formatStatusLabel(row.status)}</span>
                        </span>
                      </TableCell>

                      {/* DATE */}

                      <TableCell className={cellBase}>
                        {formatDate(row.date)}
                      </TableCell>

                      {/* SERIAL NUMBER */}

                      <TableCell className={cellBase}>
                        {orDash(row.serialNumber)}
                      </TableCell>

                      {/* P NUMBER */}

                      <TableCell className={cellBase}>
                        {orDash(row.pnumber)}
                      </TableCell>

                      {/* PART NUMBER */}

                      <TableCell className={cellBase}>
                        {orDash(row.partNumber)}
                      </TableCell>

                      {/* CUSTOMER NAME */}

                      <TableCell className={cellBase}>
                        <div
                          className="max-w-[220px] truncate"
                          title={row.customerName}
                        >
                          {row.customerName}
                        </div>
                      </TableCell>

                      {/* RETURN REASON */}

                      <TableCell className={cellBase}>
                        <div
                          className="max-w-[250px] truncate"
                          title={row.returnReason}
                        >
                          {orDash(row.returnReason)}
                        </div>
                      </TableCell>

                      {/* DEPARTMENT */}

                      <TableCell className={cellBase}>
                        {orDash(row.department)}
                      </TableCell>

                      {/* INSTALLATION DATE */}

                      <TableCell className={cellBase}>
                        {formatDate(row.installationDate)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* =================================================
            PAGINATION
        ================================================= */}

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          {/* PAGE INFO */}

          <div className="text-sm text-slate-500">
            Page{" "}
            <span className="font-medium text-slate-700">{currentPage}</span>{" "}
            of{" "}
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

      {/* ===================================================
          APPROVAL MODALS
      =================================================== */}

      {/* HOD MODAL */}

      {selectedReturn && isHodRole && (
        <MachineReturnHOD
          open
          details={details}
          returnNo={selectedReturn.returnId}
          onClose={closeApprovalModal}
          onApprove={(formData) => submitHodDecision("approve", formData)}
          onReject={(formData) => submitHodDecision("reject", formData)}
        />
      )}

      {/* FINANCE MODAL */}

      {selectedReturn && !isHodRole && (
        <MachineReturnModal
          open
          onClose={closeApprovalModal}
          machineReturnID={selectedReturn.returnId}
          approverID={userName}
          companyId={companyId}
          details={details}
          returnNo={selectedReturn.returnId}
          onApprove={submitFinanceDecision}
          onReject={submitFinanceDecision}
        />
      )}
    </section>
  );
}