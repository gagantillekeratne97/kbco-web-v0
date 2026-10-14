"use client";

import { useMemo, useState } from "react";
import { SLABS, type Agreement, type Customer, type Readings } from "./data";
import { btnPrimary, btnSecondary, card, computeTotals, fmt, inputCls } from "./ui";

interface Props {
    customer: Customer;
    agreement: Agreement;
    readings: Readings;
    adjustment: string;
    start: string;
    end: string;
    onBack: () => void;
    onFinish: () => void;
    onToast: (m: string) => void;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
    return (
        <div className={`flex justify-between py-1.5 ${bold ? "mt-1 border-t border-slate-200 pt-3 text-lg font-semibold text-slate-900" : "text-sm"}`}>
            <span className={bold ? "" : "text-slate-600"}>{label}</span>
            <span>{value}</span>
        </div>
    );
}

export default function StepReview({ customer, agreement: a, readings, adjustment, start, end, onBack, onFinish, onToast }: Props) {
    const [vat, setVat] = useState(true);
    const [sscl, setSscl] = useState(false);
    const [showCalc, setShowCalc] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [invoiceNo, setInvoiceNo] = useState<string | null>(null);

    const t = useMemo(() => computeTotals(a, readings, adjustment, vat, sscl), [a, readings, adjustment, vat, sscl]);

    let prev = 0;
    const ranges = SLABS.map((s, i) => {
        const from = prev + 1;
        prev = s.upTo ?? prev;
        return { i, from, to: s.upTo, rate: s.rate };
    });

    return (
        <div className="space-y-5">
            <div className="text-sm text-slate-500">{customer.name} / {a.id} / {start} to {end}</div>

            <div className="grid gap-5 md:grid-cols-2">
                <div className={`${card} p-5`}>
                    <h2 className="mb-2 font-semibold text-slate-900">Copies</h2>
                    <Row label="Total copies" value={t.copies.toLocaleString()} />
                    <Row label="Total waistage" value={t.waste.toLocaleString()} />
                    <Row label="Invoicing copies" value={t.invoicing.toLocaleString()} bold />
                    <button type="button" className="mt-4 text-sm text-blue-600 underline" onClick={() => setShowCalc(!showCalc)}>
                        {showCalc ? "Hide" : "Show"} how this was calculated
                    </button>
                    {showCalc && (
                        <table className="mt-2 w-full text-sm">
                            <tbody>
                                {ranges.map((r) => (
                                    <tr key={r.i} className="border-t border-slate-100">
                                        <td className="py-1.5 text-slate-600">
                                            Range {r.i + 1}: {r.from.toLocaleString()}{r.to ? ` to ${r.to.toLocaleString()}` : " and above"}
                                        </td>
                                        <td className="text-right">{fmt(r.rate)} per copy</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className={`${card} p-5`}>
                    <h2 className="mb-2 font-semibold text-slate-900">Invoice</h2>
                    <Row label="Rental" value={fmt(a.rental)} />
                    <Row label="Copy charges" value={fmt(t.copyCharges)} />
                    <Row label="Adjustment" value={fmt(t.adj)} />
                    <label className="flex items-center justify-between py-1.5 text-sm">
                        <span className="text-slate-600">SSCL (2.5%)</span>
                        <span className="flex items-center gap-3">
                            <input type="checkbox" checked={sscl} onChange={(e) => setSscl(e.target.checked)} />
                            {fmt(t.ssclValue)}
                        </span>
                    </label>
                    <label className="flex items-center justify-between py-1.5 text-sm">
                        <span className="text-slate-600">VAT (18%)</span>
                        <span className="flex items-center gap-3">
                            <input type="checkbox" checked={vat} onChange={(e) => setVat(e.target.checked)} />
                            {fmt(t.vatValue)}
                        </span>
                    </label>
                    <Row label="Net value" value={fmt(t.net)} bold />
                </div>
            </div>

            <div className="flex flex-wrap items-end gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Invoice date</label>
                    <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="text-sm text-slate-500">Invoice number is generated when you process.</div>
            </div>

            <div className="flex justify-between">
                <button type="button" className={btnSecondary} onClick={onBack}>Back</button>
                <button type="button" className={btnPrimary} onClick={() => setConfirmOpen(true)}>Process invoice</button>
            </div>

            {confirmOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
                    <div className={`${card} w-full max-w-md p-6`}>
                        {!invoiceNo ? (
                            <>
                                <h3 className="text-lg font-semibold text-slate-900">Process this invoice?</h3>
                                <p className="mt-2 text-sm text-slate-600">
                                    Net value {fmt(t.net)} will be invoiced to {customer.name}. After this, only a credit note can reverse it.
                                </p>
                                <div className="mt-5 flex justify-end gap-3">
                                    <button type="button" className={btnSecondary} onClick={() => setConfirmOpen(false)}>Cancel</button>
                                    {/* Backend stage: POST /agreements/{id}/invoices returns the real invoice number */}
                                    <button type="button" className={btnPrimary} onClick={() => setInvoiceNo("26OCT_GP2P_0007")}>
                                        Confirm and process
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-semibold text-slate-900">Invoice {invoiceNo} created</h3>
                                <p className="mt-2 text-sm text-slate-600">Agreement {a.id} is now marked as invoiced.</p>
                                <div className="mt-5 flex flex-wrap justify-end gap-3">
                                    <button type="button" className={btnSecondary} onClick={() => onToast("Opening invoice view")}>View invoice</button>
                                    <button type="button" className={btnSecondary} onClick={() => onToast("Sending to printer")}>Print</button>
                                    <button type="button" className={btnPrimary} onClick={onFinish}>Next agreement</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}