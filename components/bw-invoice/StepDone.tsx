"use client";

import { useEffect, useState } from "react";
import { getInvoiceLayoutDetails } from "@/lib/apis";
import type { Invoice } from "@/lib/types";
import InvoicePDF from "@/components/invoiceGenerate/InvoicePDF";
//import InvoicePDF from "../";          // adjust the path to where your InvoicePDF component lives
import { btnPrimary, btnSecondary, card } from "./ui";

interface Props {
    invoiceNo: string;
    customerName: string;
    mode: "created" | "view";
    onNew: () => void;
}

const getCompanyId = (): string =>
    localStorage.getItem("companyID") || sessionStorage.getItem("companyID") || "";

export default function StepDone({ invoiceNo, customerName, mode, onNew}: Props) {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [attempt, setAttempt] = useState(0);   // bump to retry

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getInvoiceLayoutDetails(invoiceNo, getCompanyId());
                if (!cancelled) setInvoice(data);
            } catch (err) {
                if (cancelled) return;
                setInvoice(null);
                setError(err instanceof Error ? err.message : "Failed to load the invoice document.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [invoiceNo, attempt]);

    return (
        <div className={`${card} space-y-5 p-6`}>
            <div>
                <div className="text-lg font-semibold text-slate-900">
                    {mode === "created" ? "Invoice created" : "Invoice"}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                    Invoice <span className="font-medium text-slate-900">{invoiceNo}</span> for {customerName}
                {mode === "created" ? " has been processed." : "."}
                </p>
            </div>

            {loading && <p className="text-sm text-slate-500">Preparing the invoice document...</p>}

            {error && (
                <div className="space-y-3">
                    <p className="text-sm text-red-600">{error}</p>
                    <button type="button" className={btnSecondary} onClick={() => setAttempt((n) => n + 1)}>
                        Try again
                    </button>
                </div>
            )}

            {invoice && <InvoicePDF invoice={invoice} />}

            <div className="border-t border-slate-200 pt-4">
                <button type="button" className={btnPrimary} onClick={onNew}>
                    {mode === "created" ? "Process another invoice" : "Back to agreements"}
                </button>
            </div>
        </div>
    );
}