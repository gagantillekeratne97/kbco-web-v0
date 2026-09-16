"use client";

import { useState } from "react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

interface ItemReport {
  companyID: string;
  partNumber: string;
  partDescription: string;
  partUnitPrice: number | null;
  brandName?: string | null;
  itemClass?: string | null;
  qty?: number | null;
  vatAvailable?: boolean;
  active?: boolean;
}

const sampleData: ItemReport[] = [
  {
    companyID: "001",
    partNumber: "P001",
    partDescription: "Toner Cartridge",
    partUnitPrice: 12500,
    brandName: "Canon",
    itemClass: "Consumable",
    qty: 10,
    vatAvailable: true,
    active: true,
  },
  {
    companyID: "001",
    partNumber: "P002",
    partDescription: "Drum Unit",
    partUnitPrice: 8500,
    brandName: "Ricoh",
    itemClass: "Machine Part",
    qty: 5,
    vatAvailable: true,
    active: true,
  },
  {
    companyID: "001",
    partNumber: "P003",
    partDescription: "Developer Unit",
    partUnitPrice: 6750,
    brandName: "Kyocera",
    itemClass: "Machine Part",
    qty: 8,
    vatAvailable: false,
    active: true,
  },
];

export default function ItemsReportPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [brand, setBrand] = useState("all");
  const [itemClass, setItemClass] = useState("all");

  const totalItems = 1364;
  const activeItems = 1348;
  const inactiveItems = 16;
  const totalQty = 8942;    

  return (
    <div className="flex min-h-screen bg-surface font-display">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title="Machine Parts Report" />

        <main className="flex-1 p-4 md:p-6 lg:p-8">

          {/* =====================================================
              Header
          ===================================================== */}

          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-1.5 w-8 rounded-full bg-orange" />

                <span className="text-xs font-semibold uppercase tracking-wider text-orange">
                  Inventory
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-navy md:text-3xl">
                Machine Parts
              </h1>

              <p className="mt-1.5 text-sm text-slate-500">
                Review and manage machine parts currently registered
                in the system.
              </p>
            </div>

            <button
              type="button"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-navy
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-navy/90
                focus:outline-none
                focus:ring-2
                focus:ring-navy/20
              "
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                />
              </svg>

              Export Excel
            </button>

          </div>

          {/* =====================================================
              Statistics
          ===================================================== */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* Total */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Total Items
                  </p>

                  <p className="mt-2 text-2xl font-bold text-navy">
                    {totalItems.toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Registered parts
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7h-7V4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"
                    />
                  </svg>
                </div>

              </div>
            </div>

            {/* Active */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Active Items
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {activeItems.toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Currently available
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-current" />
                </div>

              </div>
            </div>

            {/* Inactive */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Inactive Items
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-600">
                    {inactiveItems.toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Currently inactive
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 6 6 18M6 6l12 12"
                    />
                  </svg>
                </div>

              </div>
            </div>

            {/* Quantity */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Inventory Quantity
                  </p>

                  <p className="mt-2 text-2xl font-bold text-orange">
                    {totalQty.toLocaleString()}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Total available quantity
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-soft text-orange">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7.5 12 3 4 7.5m16 0v9L12 21l-8-4.5v-9m16 0-8 4.5m0 0L4 7.5m8 4.5V21"
                    />
                  </svg>
                </div>

              </div>
            </div>

          </div>

          {/* =====================================================
              Report
          ===================================================== */}

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            {/* Report Header */}

            <div className="border-b border-slate-200 px-5 py-5 md:px-6">

              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                <div>
                  <h2 className="text-base font-semibold text-navy">
                    Items Register
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    All machine parts currently registered in the database.
                  </p>
                </div>

                <div className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {totalItems.toLocaleString()}
                  </span>{" "}
                  records
                </div>

              </div>

              {/* Filters */}

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

                {/* Search */}

                <div className="relative xl:col-span-1">

                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
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
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search part number or description..."
                    className="
                      w-full
                      rounded-lg
                      border
                      border-slate-300
                      bg-white
                      py-2.5
                      pl-9
                      pr-3
                      text-sm
                      text-slate-700
                      outline-none
                      transition

                      placeholder:text-slate-400

                      focus:border-navy
                      focus:ring-2
                      focus:ring-navy/10
                    "
                  />

                </div>

                {/* Status */}

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-slate-600
                    outline-none

                    focus:border-navy
                    focus:ring-2
                    focus:ring-navy/10
                  "
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {/* Brand */}

                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-slate-600
                    outline-none

                    focus:border-navy
                    focus:ring-2
                    focus:ring-navy/10
                  "
                >
                  <option value="all">All Brands</option>
                  <option value="Canon">Canon</option>
                  <option value="Ricoh">Ricoh</option>
                  <option value="Kyocera">Kyocera</option>
                </select>

                {/* Item Class */}

                <select
                  value={itemClass}
                  onChange={(e) => setItemClass(e.target.value)}
                  className="
                    rounded-lg
                    border
                    border-slate-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    text-slate-600
                    outline-none

                    focus:border-navy
                    focus:ring-2
                    focus:ring-navy/10
                  "
                >
                  <option value="all">All Item Classes</option>
                  <option value="Machine Part">Machine Part</option>
                  <option value="Consumable">Consumable</option>
                  <option value="Accessory">Accessory</option>
                </select>

              </div>

            </div>

            {/* =================================================
                Table
            ================================================= */}

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1050px] text-left text-sm">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <th className="w-16 px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Part Number
                    </th>

                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Description
                    </th>

                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Brand
                    </th>

                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Unit Price
                    </th>

                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Qty
                    </th>

                    <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      VAT
                    </th>

                    <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {sampleData.map((item, index) => (

                    <tr
                      key={item.partNumber}
                      className="
                        transition-colors
                        hover:bg-slate-50
                      "
                    >

                      <td className="px-5 py-4 text-slate-400">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      <td className="px-5 py-4">

                        <div className="font-semibold text-navy">
                          {item.partNumber}
                        </div>

                        <div className="mt-0.5 text-xs text-slate-400">
                          Company {item.companyID}
                        </div>

                      </td>

                      <td className="max-w-xs px-5 py-4">

                        <div className="truncate font-medium text-slate-700">
                          {item.partDescription}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {item.itemClass}
                        </div>

                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.brandName || "-"}
                      </td>

                      <td className="px-5 py-4 text-right">

                        <span className="font-semibold text-slate-800">
                          {item.partUnitPrice?.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          ) ?? "-"}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-right">

                        <span className="font-medium text-slate-700">
                          {item.qty?.toLocaleString() ?? "-"}
                        </span>

                      </td>

                      <td className="px-5 py-4 text-center">

                        {item.vatAvailable ? (
                          <span className="
                            inline-flex
                            rounded-full
                            bg-emerald-50
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            text-emerald-700
                          ">
                            VAT
                          </span>
                        ) : (
                          <span className="
                            inline-flex
                            rounded-full
                            bg-slate-100
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-slate-500
                          ">
                            No VAT
                          </span>
                        )}

                      </td>

                      <td className="px-5 py-4 text-center">

                        <span className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-full
                          bg-emerald-50
                          px-2.5
                          py-1
                          text-xs
                          font-semibold
                          text-emerald-700
                        ">

                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                          Active

                        </span>

                      </td>

                      <td className="px-5 py-4 text-right">

                        <button
                          type="button"
                          className="
                            rounded-lg
                            p-2
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            hover:text-navy
                          "
                          aria-label={`View ${item.partNumber}`}
                        >

                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 12s3.5-6.75 9.75-6.75S21.75 12 21.75 12s-3.5 6.75-9.75 6.75S2.25 12 2.25 12Z"
                            />

                            <circle
                              cx="12"
                              cy="12"
                              r="2.5"
                            />
                          </svg>

                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* =================================================
                Pagination
            ================================================= */}

            <div className="
              flex
              flex-col
              gap-4
              border-t
              border-slate-200
              px-5
              py-4

              sm:flex-row
              sm:items-center
              sm:justify-between
            ">

              <div className="text-sm text-slate-500">

                Showing{" "}

                <span className="font-semibold text-slate-700">
                  1
                </span>

                {" "}to{" "}

                <span className="font-semibold text-slate-700">
                  25
                </span>

                {" "}of{" "}

                <span className="font-semibold text-slate-700">
                  {totalItems.toLocaleString()}
                </span>

              </div>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  disabled
                  className="
                    rounded-lg
                    border
                    border-slate-200
                    px-3
                    py-2
                    text-sm
                    font-medium
                    text-slate-400
                    disabled:cursor-not-allowed
                  "
                >
                  Previous
                </button>

                <button
                  type="button"
                  className="
                    rounded-lg
                    bg-navy
                    px-3
                    py-2
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  1
                </button>

                <button
                  type="button"
                  className="
                    rounded-lg
                    border
                    border-slate-200
                    px-3
                    py-2
                    text-sm
                    font-medium
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  2
                </button>

                <button
                  type="button"
                  className="
                    rounded-lg
                    border
                    border-slate-200
                    px-3
                    py-2
                    text-sm
                    font-medium
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  3
                </button>

                <span className="px-1 text-slate-400">
                  ...
                </span>

                <button
                  type="button"
                  className="
                    rounded-lg
                    border
                    border-slate-200
                    px-3
                    py-2
                    text-sm
                    font-medium
                    text-slate-600
                    hover:bg-slate-50
                  "
                >
                  Next
                </button>

              </div>

            </div>

          </section>

        </main>

      </div>
    </div>
  );
}
