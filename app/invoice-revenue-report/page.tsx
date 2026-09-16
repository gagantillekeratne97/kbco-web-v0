"use client";

import { useEffect, useState } from "react";
import { InvoiceRevenueLists } from "@/lib/types";
import {
  getInvoiceRevenueLists,
  getRevenueKpiTotal,
} from "@/lib/apis";
import {
  Download,
  Search,
  TrendingUp,
} from "lucide-react";
import InvoiceTable from "@/components/invoice/invoiceTable";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import KpiCard from "@/components/invoice-revenue-kpicard/kpicard";

export default function InvoicePage() {
  // --------------------------------------------------
  // Invoice data
  // --------------------------------------------------

  const [invoices, setInvoices] = useState<InvoiceRevenueLists[]>([]);

  // --------------------------------------------------
  // Search filters
  // --------------------------------------------------

  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Invoice Status
  // Empty string = All Statuses
  const [invoiceStatus, setInvoiceStatus] = useState("");

  // --------------------------------------------------
  // Server-side pagination
  // --------------------------------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = 10;

  // --------------------------------------------------
  // Export
  // --------------------------------------------------

  const [isExporting, setIsExporting] = useState(false);

  // --------------------------------------------------
  // KPI Cards
  // --------------------------------------------------

  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalInvoiceSum, setTotalInvoiceSum] = useState<number>(0);
  const [totalCreditNoteSum, setTotalCreditNoteSum] =
    useState<number>(0);

  // --------------------------------------------------
  // Load KPI
  // --------------------------------------------------

  useEffect(() => {
    const loadRevenueTotal = async () => {
      try {
        const data = await getRevenueKpiTotal();

        setTotalRevenue(data.value);

        console.log("Total Revenue:", data.value);
      } catch (error) {
        console.error(
          "Failed to load revenue KPI:",
          error
        );
      }
    };

    loadRevenueTotal();
  }, []);

  // --------------------------------------------------
  // Load invoices
  // --------------------------------------------------

  const getCompanyId = (): string => { 
    const companyId = localStorage.getItem("companyID") || sessionStorage.getItem("companyID");
    
    if (!companyId) {
      throw new Error("Company ID not found.");
    }

    return companyId;
  };

  const loadInvoices = async (
    page: number,
    searchQuery: string = query,
    searchFromDate: string = fromDate,
    searchToDate: string = toDate,
    searchInvoiceStatus: string = invoiceStatus
  ) => {
    try {
      const data = await getInvoiceRevenueLists({
        query: searchQuery,
        fromDate: searchFromDate,
        toDate: searchToDate,
        status: searchInvoiceStatus,
        page,
        pageSize,
        companyId: getCompanyId()
      });

      // Invoice records
      setInvoices(data.items);

      // Pagination
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);      
    } catch (error) {
      console.error(
        "Something went wrong while loading invoices:",
        error
      );
    }
  };

  // --------------------------------------------------
  // Initial loading
  //
  // Empty dates are intentional.
  // Backend will return current month's data when
  // no dates are supplied.
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
      invoiceStatus
    );
  };

  // --------------------------------------------------
  // Clear filters
  // --------------------------------------------------

  const handleClear = () => {
    setQuery("");
    setFromDate("");
    setToDate("");
    setInvoiceStatus("");

    // Explicitly pass empty values because React
    // state updates are asynchronous.
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

  const handlePageChange = (page: number) => {
    loadInvoices(
      page,
      query,
      fromDate,
      toDate,
      invoiceStatus
    );
  };

  // --------------------------------------------------
  // Export
  // --------------------------------------------------

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Fetch all matching records.
      // Pagination is ignored for export.
      const data = await getInvoiceRevenueLists({
        query,
        fromDate,
        toDate,
        status,
        page: 1,
        pageSize: totalCount || 100000,
        companyId: getCompanyId()
      });

      const rows = data.items;

      if (!rows || rows.length === 0) {
        alert("No records to export.");
        return;
      }

      // Build CSV
      const headers = Object.keys(rows[0]);

      const csvRows = [
        headers.join(","),

        ...rows.map((row) =>
          headers
            .map((key) => {
              const value =
                (row as Record<string, unknown>)[key];

              const cell =
                value === null ||
                value === undefined
                  ? ""
                  : String(value);

              const escaped = cell.replace(
                /"/g,
                '""'
              );

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

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `invoices_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Export failed:",
        error
      );

      alert(
        "Failed to export invoices."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface font-display">
      <Sidebar />

      <div className="flex flex-1 min-w-0 flex-col">
        <Topbar title="Invoice Revenue List" />

        <div className="m-5 space-y-6">

          {/* --------------------------------------------- */}
          {/* KPI Cards */}
          {/* --------------------------------------------- */}

          <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">

            <KpiCard
              label="Total Invoice Revenue"
              value={`LKR ${totalRevenue.toLocaleString(
                "en-LK",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}`}
              deltaPct={5.2}
              icon={TrendingUp}
            />

            <KpiCard 
            label="Total Cancelled Invoice (Sum)" 
            value="LKR 0.00"
            deltaPct={5.12}
            icon={TrendingUp}/>
          </div>

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

              {/* Invoice Status */}
              <div className="space-y-2">
                <Label htmlFor="invoice-status">
                  Invoice Status
                </Label>

                <Select
                  value={
                    invoiceStatus || "ALL"
                  }
                  onValueChange={(value) =>
                  setInvoiceStatus(
                    value === "ALL" ? "" : (value ?? "")
                  )
                }
                >
                  <SelectTrigger id="invoice-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="ALL">
                      All Statuses
                    </SelectItem>

                    <SelectItem value="INVOICE_PROCESSED">
                      Invoice Processed
                    </SelectItem>

                    <SelectItem value="CREDIT_NOTE">
                      Credit Note
                    </SelectItem>

                    <SelectItem value="RECEIPTED">
                      Receipted
                    </SelectItem>

                    <SelectItem value="CANCELLED">
                      Cancelled
                    </SelectItem>

                  </SelectContent>
                </Select>
              </div>

            </div>

            {/* --------------------------------------------- */}
            {/* Buttons */}
            {/* --------------------------------------------- */}

            <div className="mt-5 flex justify-end gap-2">

              {/* Clear */}
              <Button
                variant="outline"
                onClick={handleClear}
              >
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

                {isExporting
                  ? "Exporting..."
                  : "Export"}
              </Button>

              {/* Search */}
              <Button
                onClick={handleSearch}
                className="gap-2 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
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