"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Search } from "lucide-react";
import { getInternalConsumption } from "@/lib/apis";
import { InternalConsumptionDto } from "@/lib/types";

type Filters = { query: string; fromDate: string; toDate: string };

const EMPTY_FILTERS: Filters = { query: "", fromDate: "", toDate: "" };
const PAGE_SIZE = 10;
const EXPORT_PAGE_SIZE = 500;

const COLUMNS: { label: string; align: "left" | "right" }[] = [
  { label: "Internal No", align: "left" },
  { label: "Date", align: "left" },
  { label: "Customer", align: "left" },
  { label: "Area", align: "left" },
  { label: "Part Number", align: "left" },
  { label: "Description", align: "left" },
  { label: "Qty", align: "right" },
  { label: "Price", align: "right" },
  { label: "Copies", align: "right" },
  { label: "Current MR", align: "right" },
  { label: "Tech Name", align: "left" },
  { label: "Serial Number", align: "left" },
  { label: "Backup", align: "left" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const d = new Date(value);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
};

const formatMoney = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return "-";
  const n = Number(value);
  return isNaN(n)
    ? String(value)
    : n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
};

// isBackup may arrive as boolean, 0/1 or "Y"/"N". Booleans render nothing in
// JSX, so always convert to text.
const isTrue = (value: unknown) =>
  ["true", "1", "y", "yes"].includes(String(value).toLowerCase());

// yyyy-MM-dd for CSV (sorts and imports cleanly in Excel)
const csvDate = (value?: string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const downloadCsv = (rows: InternalConsumptionDto[]) => {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

  const header = COLUMNS.map((c) => esc(c.label)).join(",");

  const lines = rows.map((i) =>
    [
      i.irNumber,
      csvDate(i.irDate),
      i.customerName,
      i.area,
      i.pnumber,
      i.pdescription,
      i.qty,
      i.pnPrice,
      i.copies,
      i.currentMr,
      i.techName,
      i.serialNumber,
      isTrue(i.isBackup) ? "Yes" : "No",
    ]
      .map(esc)
      .join(",")
  );

  // "\uFEFF" is a BOM so Excel reads UTF-8 correctly
  const blob = new Blob(["\uFEFF" + [header, ...lines].join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `internal-consumption-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function InternalPage() {
  // What the user is typing
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Filters from the last Search click (used for paging and export)
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);

  const [comId, setComId] = useState<string | null>(null);

  const [internalLists, setInternalLists] = useState<InternalConsumptionDto[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");
  const [error, setError] = useState("");

  // Ignore responses from older, slower requests
  const requestIdRef = useRef(0);

  // localStorage/sessionStorage don't exist during server pre-render, so read
  // them inside an effect, never during render.
  useEffect(() => {
    const id =
      localStorage.getItem("companyID") || sessionStorage.getItem("companyID");

    if (!id) {
      setError("Company ID not found. Please log in again.");
      return;
    }
    setComId(id);
  }, []);

  // Initial load once the company ID is known
  useEffect(() => {
    if (comId) fetchInternalConsumption(1, EMPTY_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comId]);

  const fetchInternalConsumption = async (page: number, filters: Filters) => {
    if (!comId) return;

    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError("");

      const response = await getInternalConsumption(
        comId,
        filters.fromDate,
        filters.toDate,
        filters.query,
        page,
        PAGE_SIZE
      );

      if (requestId !== requestIdRef.current) return; // stale response

      setInternalLists(response.data ?? []);
      setCurrentPage(response.pagination.currentPage);
      setTotalRecords(response.pagination.totalRecords);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      console.error("Error loading internal consumption:", err);
      setInternalLists([]);
      setTotalRecords(0);
      setTotalPages(0);
      setError("Could not load internal consumption records. Please try again.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const handleSearch = () => {
    if (fromDate && toDate && fromDate > toDate) {
      setError("From Date cannot be later than To Date.");
      return;
    }

    const filters = { query: query.trim(), fromDate, toDate };
    setAppliedFilters(filters);
    fetchInternalConsumption(1, filters);
  };

  const handleClear = () => {
    setQuery("");
    setFromDate("");
    setToDate("");
    setAppliedFilters(EMPTY_FILTERS);
    fetchInternalConsumption(1, EMPTY_FILTERS); // refetch with cleared values
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || loading) return;
    fetchInternalConsumption(page, appliedFilters);
  };

  // Export ALL records matching the last applied filters (not just this page)
  const handleExport = async () => {
    if (!comId || exporting) return;

    try {
      setExporting(true);
      setError("");

      const { query: q, fromDate: from, toDate: to } = appliedFilters;

      const all: InternalConsumptionDto[] = [];
      let page = 1;
      let pages = 1;

      do {
        const res = await getInternalConsumption(
          comId,
          from,
          to,
          q,
          page,
          EXPORT_PAGE_SIZE
        );

        all.push(...(res.data ?? []));
        pages = res.pagination.totalPages;
        setExportProgress(`${all.length} / ${res.pagination.totalRecords}`);
        page++;
      } while (page <= pages);

      if (all.length === 0) {
        setError("No records to export.");
        return;
      }

      downloadCsv(all);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
      setExportProgress("");
    }
  };

  const rangeStart =
    internalLists.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = rangeStart === 0 ? 0 : rangeStart + internalLists.length - 1;

  return (
    <div className="flex min-h-screen bg-surface font-display">
      <Sidebar />

      <div className="flex flex-1 min-w-0 flex-col">
        <Topbar title="Internal Consumption" />

        <div className="m-5 space-y-6">
          {/* ============================ Filters ============================ */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="customer-search">Search</Label>
                <Input
                  id="customer-search"
                  placeholder="Internal number, customer, part number..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from-date">From Date</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  max={toDate || undefined}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-date">To Date</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={loading || exporting}
              >
                Clear
              </Button>

              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={handleExport}
                disabled={loading || exporting || totalRecords === 0}
              >
                <Download className="h-4 w-4" />
                {exporting ? `Exporting ${exportProgress}` : "Export"}
              </Button>

              <Button
                type="button"
                onClick={handleSearch}
                disabled={loading || exporting || !comId}
                className="gap-2 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
              >
                <Search className="h-4 w-4" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* ========================== Error banner ========================= */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* ============================= Results =========================== */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    {COLUMNS.map((col) => (
                      <th
                        key={col.label}
                        className={`px-4 py-3 font-semibold ${
                          col.align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={COLUMNS.length}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : internalLists.length === 0 ? (
                    <tr>
                      <td
                        colSpan={COLUMNS.length}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No internal consumption records found.
                      </td>
                    </tr>
                  ) : (
                    internalLists.map((item, index) => (
                      <tr
                        key={`${item.irNumber}-${item.pnumber}-${index}`}
                        className="border-b last:border-b-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-medium">{item.irNumber}</td>
                        <td className="px-4 py-3">{formatDate(item.irDate)}</td>
                        <td className="px-4 py-3">{item.customerName}</td>
                        <td className="px-4 py-3">{item.area}</td>
                        <td className="px-4 py-3">{item.pnumber}</td>
                        <td className="px-4 py-3">{item.pdescription}</td>
                        <td className="px-4 py-3 text-right">{item.qty}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {formatMoney(item.pnPrice)}
                        </td>
                        <td className="px-4 py-3 text-right">{item.copies}</td>
                        <td className="px-4 py-3 text-right">{item.currentMr}</td>
                        <td className="px-4 py-3">{item.techName}</td>
                        <td className="px-4 py-3">{item.serialNumber}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              isTrue(item.isBackup)
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {isTrue(item.isBackup) ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* =========================== Pagination ========================= */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <div className="text-sm text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-700">
                    {rangeStart}-{rangeEnd}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-700">
                    {totalRecords}
                  </span>{" "}
                  records
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1 || loading}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>

                  <span className="px-3 text-sm text-slate-600">
                    Page <span className="font-medium">{currentPage}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages || loading}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}