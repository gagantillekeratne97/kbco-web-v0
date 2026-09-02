"use client";

import { useCallback, useEffect, useState } from "react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import CreditNoteTable from "@/components/creditnotes/CreditNoteTable";

import { getCreditNoteLists } from "@/lib/apis";
import type {
  CreditNote,
  InvoiceRequestQuery,
} from "@/lib/types";

export default function CreditNotePage() {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    query: "",
    fromDate: "",
    toDate: "",
  });

  const pageSize = 10;

  const fetchCreditNotes = useCallback(async () => {
    try {
      setIsLoading(true);

      const params: InvoiceRequestQuery = {
        query: filters.query,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        page: currentPage,
        pageSize: pageSize,
      };

      const result = await getCreditNoteLists(params);

      setCreditNotes(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);

    } catch (error) {
      console.error(
        "Failed to fetch credit notes:",
        error
      );

      setCreditNotes([]);
      setTotalCount(0);
      setTotalPages(1);

    } finally {
      setIsLoading(false);
    }
  }, [
    filters,
    currentPage,
  ]);

  useEffect(() => {
    fetchCreditNotes();
  }, [fetchCreditNotes]);

  const handleSearch = (newFilters: {
    query: string;
    fromDate: string;
    toDate: string;
  }) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex min-h-screen bg-surface font-display">

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        <Topbar title="Credit Note" />

        <main className="flex-1 p-4 md:p-6">

          <CreditNoteTable
            data={creditNotes}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            isLoading={isLoading}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
          />

        </main>

      </div>

    </div>
  );
}