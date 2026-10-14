"use client";

import type { MachineList } from "@/lib/types";

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
  Cpu,
} from "lucide-react";

interface MachineTableProps {
  data: MachineList[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const COLUMN_COUNT = 3;

const headCell =
  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500";

const cellBase = "px-4 py-3 text-sm text-slate-700 whitespace-nowrap";

const pageButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

export default function MachineTable({
  data,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  isLoading = false,
}: MachineTableProps) {
  const safeTotalPages = Math.max(totalPages, 1);

  return (
    <section className="w-full space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Machine Master List
            </h2>
            <p className="text-sm text-slate-500">
              {totalCount.toLocaleString()} record
              {totalCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className={headCell}>Machine ID</TableHead>
                <TableHead className={headCell}>Machine Model</TableHead>
                <TableHead className={headCell}>Company ID</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: COLUMN_COUNT }).map((_, cellIndex) => (
                      <TableCell key={cellIndex} className="px-4 py-4">
                        <div className="h-4 min-w-[70px] animate-pulse rounded bg-slate-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Cpu size={24} className="text-slate-400" />
                      </div>

                      <p className="text-sm font-medium text-slate-900">
                        No machines found
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Try a different machine ID or model.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((machine, index) => (
                  <TableRow
                    key={`${machine.machineId}-${index}`}
                    className="hover:bg-slate-50"
                  >
                    <TableCell
                      className={`${cellBase} font-mono font-medium text-slate-900`}
                    >
                      {machine.machineId}
                    </TableCell>

                    <TableCell className={cellBase}>
                      <div className="max-w-[320px] truncate">
                        {machine.machineModel}
                      </div>
                    </TableCell>

                    <TableCell className={cellBase}>
                      {machine.companyId}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Page{" "}
            <span className="font-medium text-slate-700">{currentPage}</span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">{safeTotalPages}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(1)}
              className={pageButton}
            >
              <ChevronsLeft size={16} />
            </button>

            <button
              type="button"
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
              disabled={currentPage >= safeTotalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              className={pageButton}
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              disabled={currentPage >= safeTotalPages || isLoading}
              onClick={() => onPageChange(safeTotalPages)}
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