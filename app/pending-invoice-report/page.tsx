"use client";

import { useEffect, useState } from "react";
import { InvoiceLists, PendingInvoiceLists } from "@/lib/types";
import { getInvoiceLists, getPendingInvoiceList } from "@/lib/apis";
import { Download, Search } from "lucide-react";
import InvoiceTable from "@/components/invoice/invoiceTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import PendingInvoiceTable from "@/components/pending-invoice-report/PendingInvoiceTable";

export default function PendingInvoicesPage() {
  // --------------------------------------------------
  // Invoice Status
  // --------------------------------------------------

  const [status, setStatus] = useState("");

  // Change these values according to your database
  // status values.
  const invoiceStatuses = [
    {
      label: "All",
      value: "",
    },
    {
      label: "Invoiced",
      value: "NULL",
    },
    {
      label: "Credit Note",
      value: "CREDITNOTE",
    },
    {
      label: "Cancelled",
      value: "CANCELLED",
    },
  ];

  // --------------------------------------------------
  // Invoice data
  // --------------------------------------------------

  const [invoices, setInvoices] = useState<PendingInvoiceLists[]>([]);

  // --------------------------------------------------
  // Search filters
  // --------------------------------------------------

  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // --------------------------------------------------
  // Server-side pagination
  // --------------------------------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Number of records requested from the API
  const pageSize = 10;

  // --------------------------------------------------
  // Export option
  // --------------------------------------------------

  const [isExporting, setIsExporting] = useState(false);

  // --------------------------------------------------
  // Get Company ID
  // --------------------------------------------------

  const getCompanyId = (): string => {
    const companyId =
      localStorage.getItem("companyID") ||
      sessionStorage.getItem("companyID");

    if (!companyId) {
      throw new Error("Company ID not found.");
    }

    return companyId;
  };

  // --------------------------------------------------
  // Export handling
  // --------------------------------------------------

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Fetch all matching records.
      // Pagination is ignored for export.
      const data = await getPendingInvoiceList({
        query,
        fromDate,
        toDate,
        page: 1,
        pageSize: totalCount || 100000,

        // IMPORTANT:
        // Export currently selected status.
        status,

        companyId: getCompanyId(),
      });

      const rows = data.items;

      if (!rows || rows.length === 0) {
        alert("No records to export.");
        return;
      }

      // Build CSV from the keys of the first record
      const headers = Object.keys(rows[0]);

      const csvRows = [
        headers.join(","),

        ...rows.map((row) =>
          headers
            .map((key) => {
              const value = (row as Record<string, unknown>)[key];

              const cell =
                value === null || value === undefined
                  ? ""
                  : String(value);

              // Escape quotes
              const escaped = cell.replace(/"/g, '""');

              // Wrap values containing comma, quote or newline
              return /[",\n]/.test(escaped)
                ? `"${escaped}"`
                : escaped;
            })
            .join(",")
        ),
      ];

      const csvContent = csvRows.join("\n");

      const blob = new Blob(
        [csvContent],
        {
          type: "text/csv;charset=utf-8;",
        }
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `invoices_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Export failed:", error);

      alert("Failed to export invoices.");

    } finally {
      setIsExporting(false);
    }
  };

  // --------------------------------------------------
  // Load invoices from API
  // --------------------------------------------------

  const loadInvoices = async (
    page: number,
    searchQuery: string = query,
    searchFromDate: string = fromDate,
    searchToDate: string = toDate,
    searchStatus: string = status
  ) => {
    try {
      const companyId = getCompanyId();

      const data = await getPendingInvoiceList({
        query: searchQuery,
        fromDate: searchFromDate,
        toDate: searchToDate,

        page,
        pageSize,

        companyId,

        status: searchStatus,
      });

      // Invoice records
      setInvoices(data.items);

      // Pagination information
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);

    } catch (error) {
      console.error(
        "Something went wrong:",
        error
      );
    }
  };

  // --------------------------------------------------
  // Status button handling
  // --------------------------------------------------

  const handleStatusChange = (
    newStatus: string
  ) => {
    setStatus(newStatus);

    // Explicitly pass newStatus because
    // React state updates are asynchronous.
    loadInvoices(
      1,
      query,
      fromDate,
      toDate,
      newStatus
    );
  };

  // --------------------------------------------------
  // Initial loading
  // --------------------------------------------------

  useEffect(() => {
    loadInvoices(
      1,
      "",
      "",
      "",
      ""
    );
  }, []);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const handleSearch = () => {
    loadInvoices(
      1,
      query,
      fromDate,
      toDate,
      status
    );
  };

  // --------------------------------------------------
  // Clear filters
  // --------------------------------------------------

  const handleClear = () => {
    setQuery("");
    setFromDate("");
    setToDate("");
    setStatus("");

    // Explicitly pass empty values because
    // React state updates are asynchronous.
    loadInvoices(
      1,
      "",
      "",
      "",
      ""
    );
  };

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const handlePageChange = (
    page: number
  ) => {
    loadInvoices(
      page,
      query,
      fromDate,
      toDate,
      status
    );
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="flex min-h-screen bg-surface font-display">

      {/* Sidebar */}
      <Sidebar />

      <div className="flex flex-1 min-w-0 flex-col">

        {/* Topbar */}
        <Topbar title="Pending Invoice List" />

        <div className="m-5 space-y-6">

          {/* ================================================== */}
          {/* Filter Section */}
          {/* ================================================== */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            {/* Search / Date Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

              {/* Search */}
              <div className="space-y-2 md:col-span-2">

                <Label htmlFor="customer-search">
                  Search
                </Label>

                <Input
                  id="customer-search"
                  placeholder="Invoice number, customer code or address..."
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                />

              </div>

              {/* From Date */}
              <div className="space-y-2">

                <Label htmlFor="from-date">
                  From Date
                </Label>

                <Input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(event) =>
                    setFromDate(event.target.value)
                  }
                />

              </div>

              {/* To Date */}
              <div className="space-y-2">

                <Label htmlFor="to-date">
                  To Date
                </Label>

                <Input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(event) =>
                    setToDate(event.target.value)
                  }
                />

              </div>

            </div>

            {/* ================================================== */}
            {/* Status Filter */}
            {/* ================================================== */}

            <div className="mt-5 border-t border-slate-100 pt-5">

              <Label className="mb-3 block">
                Invoice Status
              </Label>

              <div className="flex flex-wrap gap-2">

                {invoiceStatuses.map(
                  (item) => {

                    const isActive =
                      status === item.value;

                    return (
                      <Button
                        key={item.value || "all"}
                        type="button"
                        variant={
                          isActive
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          handleStatusChange(
                            item.value
                          )
                        }
                        className={
                          isActive
                            ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                            : "bg-white text-slate-600 hover:bg-slate-50"
                        }
                      >
                        {item.label}
                      </Button>
                    );
                  }
                )}

              </div>

            </div>

            {/* ================================================== */}
            {/* Action Buttons */}
            {/* ================================================== */}

            <div className="mt-5 flex justify-end gap-2">

              {/* Clear */}
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
              >
                Clear
              </Button>

              {/* Export */}
              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
                className="gap-2"
              >
                <Download className="h-4 w-4" />

                {isExporting
                  ? "Exporting..."
                  : "Export"}
              </Button>

              {/* Search */}
              <Button
                type="button"
                onClick={handleSearch}
                className="gap-2 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
              >
                <Search className="h-4 w-4" />

                Search
              </Button>

            </div>

          </div>

          {/* ================================================== */}
          {/* Invoice Table */}
          {/* ================================================== */}

          <PendingInvoiceTable
            data={invoices}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
          />

        </div>

      </div>

    </div>
  );
}