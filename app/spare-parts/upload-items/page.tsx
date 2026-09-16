"use client";

import { useState } from "react";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import Notification from "@/components/Notifications";

import { PartsModel } from "@/lib/types";
import {
  processRecords,
  uploadItemsExcel,
} from "@/lib/apis";

import PartsTable from "@/components/parts/PartsTable";

export default function SparePartsPage() {
  const [file, setFile] = useState<File | null>(null);

  const [parts, setParts] = useState<PartsModel[]>([]);

  const [loading, setLoading] = useState(false);

  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");

  const [notification, setNotification] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const companyID = "001";

  // =========================================================
  // Close Notification
  // =========================================================

  const handleCloseNotification = () => {
    setNotification(null);
  };

  // =========================================================
  // Upload Excel
  // =========================================================

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an Excel file.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await uploadItemsExcel(
        file,
        companyID
      );

      setParts(result.data);

      setNotification({
        type: "success",
        title: "Excel Uploaded Successfully",
        message: `${result.data.length.toLocaleString()} parts were imported successfully.`,
      });

    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading the Excel file.";

      setError(message);

      setNotification({
        type: "error",
        title: "Upload Failed",
        message,
      });

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // Process Parts
  // =========================================================

  const handleProcess = async () => {
    if (parts.length === 0) {
      setError("There are no parts to process.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const result = await processRecords(parts);

      console.log("Process result:", result);

      setNotification({
        type: "success",
        title: "Parts Processed Successfully",
        message: `${parts.length.toLocaleString()} parts have been processed successfully.`,
      });

    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to process parts.";

      setError(message);

      setNotification({
        type: "error",
        title: "Processing Failed",
        message,
      });

    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-surface font-display">

      {/* =====================================================
          Notification
      ===================================================== */}

      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={handleCloseNotification}
          duration={5000}
        />
      )}

      {/* =====================================================
          Sidebar
      ===================================================== */}

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">

        {/* ===================================================
            Topbar
        =================================================== */}

        <Topbar title="Machine Parts Report" />

        <main className="flex-1 space-y-6 p-4 md:p-6">

          {/* =================================================
              Upload Section
          ================================================= */}

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-slate-800">
                Import Machine Parts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload an Excel file containing Part Number,
                Part Description and Unit Price.
              </p>

            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end">

              {/* File Input */}

              <div className="flex-1">

                <label
                  htmlFor="parts-excel"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Excel File
                </label>

                <input
                  id="parts-excel"
                  type="file"
                  accept=".xlsx"
                  onChange={(e) => {

                    const selectedFile =
                      e.target.files?.[0] ?? null;

                    setFile(selectedFile);

                    setError("");

                    // Remove previous notification
                    setNotification(null);
                  }}
                  className="
                    block w-full cursor-pointer rounded-lg
                    border border-slate-300
                    bg-slate-50
                    text-sm text-slate-700

                    file:mr-4
                    file:cursor-pointer
                    file:border-0
                    file:bg-slate-800
                    file:px-4
                    file:py-2.5
                    file:text-sm
                    file:font-medium
                    file:text-white

                    hover:file:bg-slate-700
                  "
                />

                {file && (
                  <p className="mt-2 text-xs text-slate-500">

                    Selected file:{" "}

                    <span className="font-medium text-slate-700">
                      {file.name}
                    </span>

                  </p>
                )}

              </div>

              {/* Upload Button */}

              <button
                type="button"
                onClick={handleUpload}
                disabled={loading || !file}
                className="
                  rounded-lg
                  bg-navy
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white

                  transition
                  hover:bg-navy/90

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {loading ? "Uploading..." : "Upload Excel"}

              </button>

            </div>

            {/* Error Message */}

            {error && (
              <div
                className="
                  mt-4
                  rounded-lg
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-700
                "
              >
                {error}
              </div>
            )}

          </section>

          {/* =================================================
              Process Section
          ================================================= */}

          {parts.length > 0 && (

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="
                flex
                flex-col
                gap-4

                md:flex-row
                md:items-center
                md:justify-between
              ">

                <div>

                  <h2 className="text-base font-semibold text-slate-800">
                    Process Imported Parts
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Review the imported parts below before
                    processing them into the system.
                  </p>

                  <p className="mt-2 text-sm text-slate-600">

                    <span className="font-semibold text-slate-800">
                      {parts.length.toLocaleString()}
                    </span>{" "}

                    parts are ready to process.

                  </p>

                </div>

                {/* Process Button */}

                <button
                  type="button"
                  onClick={handleProcess}
                  disabled={
                    processing ||
                    parts.length === 0
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-lg
                    bg-orange
                    px-6
                    py-2.5
                    text-sm
                    font-semibold
                    text-white

                    transition
                    hover:bg-orange/90

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {processing ? (
                    <>
                      {/* Spinner */}

                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >

                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="
                            M4 12
                            a8 8 0 018-8
                            v4
                            a4 4 0 00-4 4
                            H4z
                          "
                        />

                      </svg>

                      Processing...
                    </>
                  ) : (
                    "Process Parts"
                  )}

                </button>

              </div>

            </section>

          )}

          {/* =================================================
              Parts Table
          ================================================= */}

          {parts.length > 0 && (

            <section>

              <div className="
                mb-3
                flex
                items-center
                justify-between
              ">

                <div>

                  <h2 className="text-lg font-semibold text-slate-800">
                    Imported Parts
                  </h2>

                  <p className="text-sm text-slate-500">
                    {parts.length.toLocaleString()} parts loaded from Excel.
                  </p>

                </div>

              </div>

              <PartsTable data={parts} />

            </section>

          )}

        </main>

      </div>

    </div>
  );
}

