"use client";

import { useEffect, useState } from "react";
import { getInvoicePreview, processInvoice } from "@/lib/apis";
import type { CustomerAgreement, InvoicePreview } from "@/lib/types";
import type { CustomerSearchResult } from "./customerSearch";
import { btnPrimary, btnSecondary, card, inputCls } from "./ui";

interface Props {
    customer: CustomerSearchResult;
    agreement: CustomerAgreement;
    start: string;
    end: string;
    onBack: () => void;
    onDone: (invoiceNo: string) => void;
    onToast: (m: string) => void;
}

const getCompanyId = (): string =>
    localStorage.getItem("companyID") || sessionStorage.getItem("companyID") || "";

// use your real storage keys here
const getUserCode = (): string =>
    localStorage.getItem("userCode") || sessionStorage.getItem("userCode") || "";
const getUserName = (): string =>
    localStorage.getItem("userName") || sessionStorage.getItem("userName") || "";

// today as yyyy-MM-dd in local time (toISOString would use UTC)
const today = (): string => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const money = (n: number | null | undefined): string =>
    (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const num = (n: number | null | undefined): string => (n ?? 0).toLocaleString();

export default function StepReview({ customer, agreement, start, end, onBack, onDone, onToast }: Props) {
    const [preview, setPreview] = useState<InvoicePreview | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [invoiceDate, setInvoiceDate] = useState(today());
    const [discount, setDiscount] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(0);

    const [confirming, setConfirming] = useState(false);
    const [processing, setProcessing] = useState(false);

    const baseParams = () => ({
        companyId: getCompanyId(),
        customerCode: customer.customerCode,
        agreementId: agreement.agreementId,
        periodStart: start,
        periodEnd: end,
        invoiceDate,
        userCode: getUserCode(),
        userName: getUserName(),
    });

    // Load the preview (re-runs when the applied discount changes)
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await getInvoicePreview({ ...baseParams(), discount: appliedDiscount });
                if (!cancelled) setPreview(response);
            } catch (err: any) {
                if (cancelled) return;
                setPreview(null);
                setError(err?.response?.data?.message ?? "Failed to load the invoice preview.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer.customerCode, agreement.agreementId, start, end, appliedDiscount]);

    const applyDiscount = () => {
        const v = Number(discount);
        setAppliedDiscount(Number.isFinite(v) && v > 0 ? v : 0);
    };

    const onProcess = async () => {
        try {
            setProcessing(true);
            const response = await processInvoice({ ...baseParams(), discount: appliedDiscount });
            const { invoiceNo, afterCreditNote } = response;
            onToast(
                afterCreditNote
                    ? `Invoice ${invoiceNo} created (period had a credit note).`
                    : `Invoice ${invoiceNo} created.`
            );
            onDone(invoiceNo);
        } catch (err: any) {
            onToast(err?.response?.data?.message ?? "Failed to process the invoice.");
            setConfirming(false);
        } finally {
            setProcessing(false);
        }
    };

    if (loading && !preview) return <p className="text-sm text-slate-500">Loading invoice preview...</p>;

    if (error || !preview) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-red-600">{error || "Invoice preview not available."}</p>
                <button type="button" className={btnSecondary} onClick={onBack}>Back</button>
            </div>
        );
    }

    const { master, details, bw, calc } = preview;
    const totalCopies = details.reduce((s, d) => s + (d.invCopies ?? 0), 0);
    const totalWaistage = details.reduce((s, d) => s + (d.waistage ?? 0), 0);
    const location = [master.invAdd1, master.invAdd2, master.invAdd3].filter(Boolean).join(", ");

    return (
        <div className="space-y-5">
            {/* Summary */}
            <div className={`${card} grid gap-3 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4`}>
                {[
                    ["Customer", customer.customerName],
                    ["Agreement", agreement.agreementId],
                    ["Period", `${start} to ${end}`],
                    ["Billing method", master.billingMethod],
                ].map(([k, v]) => (
                    <div key={k}>
                        <div className="text-slate-500">{k}</div>
                        <div className="font-medium text-slate-900">{v || "-"}</div>
                    </div>
                ))}
                <div className="sm:col-span-2 lg:col-span-4">
                    <div className="text-slate-500">Invoice address</div>
                    <div className="font-medium text-slate-900">{location || "-"}</div>
                </div>
            </div>

            {/* Machines */}
            <div className={`${card} max-h-[45vh] overflow-auto`}>
                <table className="w-full min-w-[800px] text-sm">
                    <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-slate-200 text-left text-slate-600">
                            {["Make & model", "Serial no", "MC ref", "M location", "Start", "End", "Copies", "Waistage"].map((h, i) => (
                                <th key={h} className={`px-4 py-3 font-medium ${i > 3 ? "text-right" : ""}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {details.map((d) => (
                            <tr key={d.serialNo} className="border-b border-slate-100 last:border-0">
                                <td className="px-4 py-2">{d.makeModel}</td>
                                <td className="px-4 py-2">{d.serialNo}</td>
                                <td className="px-4 py-2">{d.pNo}</td>
                                <td className="px-4 py-2">{d.mLoc}</td>
                                <td className="px-4 py-2 text-right">{num(d.startMr)}</td>
                                <td className="px-4 py-2 text-right">{num(d.endMr)}</td>
                                <td className="px-4 py-2 text-right font-medium">{num(d.invCopies)}</td>
                                <td className="px-4 py-2 text-right">{num(d.waistage)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="border-t border-slate-200 bg-slate-50 font-medium">
                            <td className="px-4 py-2" colSpan={6}>Totals ({details.length} machines)</td>
                            <td className="px-4 py-2 text-right">{num(totalCopies)}</td>
                            <td className="px-4 py-2 text-right">{num(totalWaistage)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Commitment breakup */}
                <div className={`${card} overflow-auto`}>
                    <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                        Rate slabs
                    </div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-left text-slate-600">
                                <th className="px-4 py-2 font-medium">From</th>
                                <th className="px-4 py-2 text-right font-medium">To</th>
                                <th className="px-4 py-2 text-right font-medium">Rate</th>
                                <th className="px-4 py-2 text-right font-medium">Copies charged</th>
                            </tr>
                        </thead>
                        <tbody>
                            {calc.slabs.map((s, i) => (
                                <tr key={i} className="border-b border-slate-100 last:border-0">
                                    <td className="px-4 py-2">{num(s.range1)}</td>
                                    <td className="px-4 py-2 text-right">{s.range2 === 0 ? "and above" : num(s.range2)}</td>
                                    <td className="px-4 py-2 text-right">{money(s.rate)}</td>
                                    <td className="px-4 py-2 text-right font-medium">
                                        {s.breakup === null || s.breakup === undefined ? "\u2013" : num(s.breakup)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className={`${card} space-y-2 p-4 text-sm`}>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Invoice value</span>
                        <span className="font-medium">{money(calc.invoiceValue)}</span>
                    </div>
                    {(master.rentalVal ?? 0) > 0 && (
                        <div className="flex justify-between">
                            <span className="text-slate-600">Rental</span>
                            <span className="font-medium">{money(master.rentalVal)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-slate-600">NBT</span>
                        <span className="font-medium">{money(calc.nbt)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">VAT</span>
                        <span className="font-medium">{money(calc.vat)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 text-base">
                        <span className="font-semibold text-slate-900">Net value</span>
                        <span className="font-semibold text-slate-900">{money(calc.net)}</span>
                    </div>
                    {loading && <p className="text-xs text-slate-500">Recalculating...</p>}
                </div>
            </div>

            {/* Invoice date + discount */}
            <div className="flex flex-wrap items-end gap-4">
                <div className="w-44">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Invoice date</label>
                    <input
                        type="date"
                        className={inputCls}
                        value={invoiceDate}
                        disabled={processing}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                    />
                </div>
                <div className="w-40">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Discount</label>
                    <input
                        type="number"
                        min="0"
                        className={`${inputCls} text-right`}
                        value={discount}
                        disabled={processing}
                        onChange={(e) => setDiscount(e.target.value)}
                        onBlur={applyDiscount}
                        onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-3">
                <button type="button" className={btnSecondary} disabled={processing} onClick={onBack}>
                    Back
                </button>

                {!confirming ? (
                    <button
                        type="button"
                        className={btnPrimary}
                        disabled={loading || !invoiceDate}
                        onClick={() => setConfirming(true)}
                    >
                        Process invoice
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">Create this invoice for {money(calc.net)}?</span>
                        <button type="button" className={btnSecondary} disabled={processing} onClick={() => setConfirming(false)}>
                            Cancel
                        </button>
                        <button type="button" className={btnPrimary} disabled={processing} onClick={onProcess}>
                            {processing ? "Processing..." : "Confirm"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}