"use client";

import { useMemo, useState } from "react";
import { PartsModel } from "@/lib/types";

interface PartsTableProps {
  data: PartsModel[];
}

export default function PartsTable({ data }: PartsTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // -----------------------------------------
  // Search
  // -----------------------------------------
  const filteredData = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return data;
    }

    return data.filter((part) => {
      return (
        part.productCode.toLowerCase().includes(searchValue) ||
        part.productDescription.toLowerCase().includes(searchValue)
      );
    });
  }, [data, search]);

  // -----------------------------------------
  // Pagination
  // -----------------------------------------
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / pageSize)
  );

  // Make sure current page is valid
  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex = (safeCurrentPage - 1) * pageSize;

  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + pageSize
  );

  const startItem =
    filteredData.length === 0
      ? 0
      : startIndex + 1;

  const endItem = Math.min(
    startIndex + pageSize,
    filteredData.length
  );

  // -----------------------------------------
  // Search change
  // -----------------------------------------
  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // -----------------------------------------
  // Page size change
  // -----------------------------------------
  const handlePageSizeChange = (
    value: number
  ) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* ---------------------------------- */}
      {/* Header */}
      {/* ---------------------------------- */}

      <div className="border-b border-slate-200 px-5 py-4">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Title */}
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              Machine Parts
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {data.length.toLocaleString()} parts imported
            </p>
          </div>

          {/* Search */}
          <div className="w-full lg:w-80">

            <div className="relative">

              {/* Search Icon */}
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
                />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  handleSearchChange(e.target.value)
                }
                placeholder="Search part number or description..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none transition
                           placeholder:text-slate-400
                           focus:border-navy
                           focus:ring-2 focus:ring-navy/10"
              />

              {/* Clear Search */}
              {search && (
                <button
                  type="button"
                  onClick={() =>
                    handleSearchChange("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ---------------------------------- */}
      {/* Search Result Information */}
      {/* ---------------------------------- */}

      {search && (
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-xs text-slate-500">
          {filteredData.length.toLocaleString()} result
          {filteredData.length !== 1 ? "s" : ""} found
          {filteredData.length !== data.length &&
            ` from ${data.length.toLocaleString()} parts`}
        </div>
      )}

      {/* ---------------------------------- */}
      {/* Table */}
      {/* ---------------------------------- */}

      <div className="overflow-x-auto">

        <table className="w-full text-left text-sm">

          <thead className="border-b border-slate-200 bg-slate-50">

            <tr>

              <th className="w-16 px-5 py-3 font-semibold text-slate-700">
                #
              </th>

              <th className="px-5 py-3 font-semibold text-slate-700">
                Part Number
              </th>

              <th className="px-5 py-3 font-semibold text-slate-700">
                Part Description
              </th>

              <th className="px-5 py-3 text-right font-semibold text-slate-700">
                Unit Price
              </th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-100">

            {paginatedData.length === 0 ? (

              <tr>

                <td
                  colSpan={4}
                  className="px-5 py-12 text-center"
                >

                  <div className="flex flex-col items-center">

                    <p className="font-medium text-slate-600">
                      No parts found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try changing your search criteria.
                    </p>

                  </div>

                </td>

              </tr>

            ) : (

              paginatedData.map((part, index) => (

                <tr
                  key={`${part.productCode}-${index}`}
                  className="transition-colors hover:bg-slate-50"
                >

                  {/* Row Number */}

                  <td className="px-5 py-3 text-slate-400">
                    {startIndex + index + 1}
                  </td>

                  {/* Part Number */}

                  <td className="px-5 py-3">

                    <span className="font-medium text-slate-800">
                      {part.productCode}
                    </span>

                  </td>

                  {/* Description */}

                  <td className="px-5 py-3 text-slate-600">
                    {part.productDescription}
                  </td>

                  {/* Unit Price */}

                  <td className="px-5 py-3 text-right">

                    <span className="font-medium text-slate-800">
                      {part.productUnitPrice != null
                        ? part.productUnitPrice.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )
                        : "-"}
                    </span>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* ---------------------------------- */}
      {/* Pagination */}
      {/* ---------------------------------- */}

      <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

        {/* Showing Information */}

        <div className="text-sm text-slate-500">

          Showing{" "}

          <span className="font-medium text-slate-700">
            {startItem}
          </span>

          {" "}to{" "}

          <span className="font-medium text-slate-700">
            {endItem}
          </span>

          {" "}of{" "}

          <span className="font-medium text-slate-700">
            {filteredData.length.toLocaleString()}
          </span>

        </div>

        {/* Controls */}

        <div className="flex items-center gap-3">

          {/* Page Size */}

          <div className="flex items-center gap-2">

            <span className="text-sm text-slate-500">
              Rows
            </span>

            <select
              value={pageSize}
              onChange={(e) =>
                handlePageSizeChange(
                  Number(e.target.value)
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none
                         focus:border-navy
                         focus:ring-2 focus:ring-navy/10"
            >

              <option value={10}>
                10
              </option>

              <option value={25}>
                25
              </option>

              <option value={50}>
                50
              </option>

              <option value={100}>
                100
              </option>

            </select>

          </div>

          {/* Previous */}

          <button
            type="button"
            onClick={() =>
              setCurrentPage(
                (page) => Math.max(1, page - 1)
              )
            }
            disabled={safeCurrentPage === 1}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition
                       hover:bg-slate-50
                       disabled:cursor-not-allowed
                       disabled:opacity-40"
          >
            Previous
          </button>

          {/* Page Number */}

          <span className="whitespace-nowrap text-sm text-slate-600">
            Page{" "}
            <span className="font-semibold text-slate-800">
              {safeCurrentPage}
            </span>
            {" "}of{" "}
            <span className="font-semibold text-slate-800">
              {totalPages}
            </span>
          </span>

          {/* Next */}

          <button
            type="button"
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.min(totalPages, page + 1)
              )
            }
            disabled={safeCurrentPage === totalPages}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition
                       hover:bg-slate-50
                       disabled:cursor-not-allowed
                       disabled:opacity-40"
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
}
