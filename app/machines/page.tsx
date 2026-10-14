"use client";

import { useEffect, useState } from "react";
import { MachineList } from "@/lib/types";
import { getMachineMasterLists } from "@/lib/apis";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import MachineTable from "@/components/machineMaster/MachineListTable";

export default function MachineMasterPage() {
  // --------------------------------------------------
  // Machine data
  // --------------------------------------------------

  const [machines, setMachines] = useState<MachineList[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --------------------------------------------------
  // Search filter (matches machine ID or machine model)
  // --------------------------------------------------

  const [query, setQuery] = useState("");

  // --------------------------------------------------
  // Server-side pagination
  // --------------------------------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

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
  // Load machines from API
  // --------------------------------------------------

  const loadMachines = async (
    page: number,
    searchQuery: string = query
  ) => {
    setIsLoading(true);

    try {
      const data = await getMachineMasterLists(
        getCompanyId(),
        searchQuery,
        page,
        pageSize
      );

      setMachines(data.items);

      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (error) {
      console.error("Something went wrong:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --------------------------------------------------
  // Initial loading
  // --------------------------------------------------

  useEffect(() => {
    loadMachines(1, "");
  }, []);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const handleSearch = () => {
    loadMachines(1, query.trim());
  };

  // --------------------------------------------------
  // Clear filters
  // --------------------------------------------------

  const handleClear = () => {
    setQuery("");

    // Explicitly pass empty value because
    // React state updates are asynchronous.
    loadMachines(1, "");
  };

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const handlePageChange = (page: number) => {
    loadMachines(page, query.trim());
  };

  // --------------------------------------------------
  // Export handling (all records matching the search)
  // --------------------------------------------------

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const data = await getMachineMasterLists(
        getCompanyId(),
        query.trim(),
        1,
        totalCount || 100000
      );

      const rows = data.items;

      if (!rows || rows.length === 0) {
        alert("No records to export.");
        return;
      }

      const headers = Object.keys(rows[0]);

      const csvRows = [
        headers.join(","),

        ...rows.map((row) =>
          headers
            .map((key) => {
              const value = (row as unknown as Record<string, unknown>)[key];

              const cell =
                value === null || value === undefined ? "" : String(value);

              const escaped = cell.replace(/"/g, '""');

              return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
            })
            .join(",")
        ),
      ];

      const blob = new Blob([csvRows.join("\n")], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `machines_${new Date().toISOString().slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export machines.");
    } finally {
      setIsExporting(false);
    }
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
        <Topbar title="Machine Master List" />

        <div className="m-5 space-y-6">
          {/* ================================================== */}
          {/* Filter Section */}
          {/* ================================================== */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="machine-search">Search</Label>

              <Input
                id="machine-search"
                placeholder="Machine ID or machine model..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch();
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleExport}
                disabled={isExporting}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>

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
          {/* Machine Table */}
          {/* ================================================== */}

          <MachineTable
            data={machines}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}