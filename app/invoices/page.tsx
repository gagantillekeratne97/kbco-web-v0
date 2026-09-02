"use client";

import { useEffect, useState } from "react";
import { InvoiceLists } from "@/lib/types";
import { getInvoiceLists } from "@/lib/apis";
import { Download, Search } from "lucide-react";
import InvoiceTable from "@/components/invoice/invoiceTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
//import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";

export default function InvoicePage() {
  // Invoice data
  const [invoices, setInvoices] = useState<InvoiceLists[]>([]);

  // Search filters
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Number of records requested from the API
  const pageSize = 10;

  // Export option 
  const [isExporting, setIsExporting] = useState(false);

  // --------------------------------------------------
  // Export handling function 
  // --------------------------------------------------
  const handleExport = async () => {
  setIsExporting(true);
  try {
    // Fetch all matching records (ignore pagination for export)
    const data = await getInvoiceLists({
      query,
      fromDate,
      toDate,
      page: 1,
      pageSize: totalCount || 100000, // large enough to get everything
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
            const cell = value === null || value === undefined ? "" : String(value);
            // Escape quotes and wrap in quotes if it contains a comma/quote/newline
            const escaped = cell.replace(/"/g, '""');
            return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
          })
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `invoices_${new Date().toISOString().slice(0, 10)}.csv`;
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
    searchToDate: string = toDate
  ) => {
    try {
      const data = await getInvoiceLists({
        query: searchQuery,
        fromDate: searchFromDate,
        toDate: searchToDate,
        page,
        pageSize,
      });

      // Invoice records
      setInvoices(data.items);

      // Pagination information
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("Something went wrong:", error);
    }
  };

  // --------------------------------------------------
  // Initial loading
  // --------------------------------------------------

  useEffect(() => {
    loadInvoices(1, "", "", "");
  }, []);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const handleSearch = () => {
    loadInvoices(
      1,
      query,
      fromDate,
      toDate
    );
  };  

  // --------------------------------------------------
  // Clear filters
  // --------------------------------------------------

  const handleClear = () => {
    setQuery("");
    setFromDate("");
    setToDate("");

    // Explicitly pass empty values because
    // React state updates are asynchronous.
    loadInvoices(1, "", "", "");
  };

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const handlePageChange = (page: number) => {
    loadInvoices(
      page,
      query,
      fromDate,
      toDate
    );
  };

  return (
    <div className="flex min-h-screen bg-surface font-display">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0"> 
            <Topbar title="Invoice List"/>
            <div className="m-5 space-y-6">

      {/* --------------------------------------------- */}
      {/* Filter Section */}
      {/* --------------------------------------------- */}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

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

        {/* --------------------------------------------- */}
        {/* Buttons */}
        {/* --------------------------------------------- */}

        <div className="mt-5 flex justify-end gap-2">
  {/* Clear */}
  <Button variant="outline" onClick={handleClear}>
    Clear
  </Button>

        {/* Export */}
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={isExporting}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>

        {/* Search */}
        <Button
          onClick={handleSearch}
          className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm gap-2"
        >
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
      </div>

      {/* --------------------------------------------- */}
      {/* Invoice Table */}
      {/* --------------------------------------------- */}

      <InvoiceTable
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