import type { Agreement, AgreementStatus, Readings } from "./data";
import { SLABS, SSCL_RATE, VAT_RATE } from "./data";

/* ---------- shared class names ---------- */
export const card = "rounded-xl border border-slate-200 bg-white shadow-sm";
export const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30";
export const btnPrimary =
    "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 disabled:cursor-not-allowed disabled:opacity-40";
export const btnSecondary =
    "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40 disabled:cursor-not-allowed disabled:opacity-50";

/* ---------- formatting ---------- */
export const fmt = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const toNum = (v: string | undefined): number | null =>
    v === undefined || v === "" ? null : Number(v);

/* ---------- calculations (moves to the server in the backend stage) ---------- */
export function tieredValue(copies: number): number {
    let prev = 0;
    let total = 0;
    for (const s of SLABS) {
        const cap = s.upTo ?? Infinity;
        const take = Math.max(0, Math.min(copies, cap) - prev);
        total += take * s.rate;
        prev = cap;
    }
    return total;
}

export function computeTotals(
    agreement: Agreement,
    readings: Readings,
    adjustment: string,
    vat: boolean,
    sscl: boolean
) {
    let copies = 0;
    let waste = 0;
    for (const m of agreement.machines) {
        const r = readings[m.serial];
        copies += Number(r?.end ?? 0) - m.start;
        waste += Number(r?.waste) || 0;
    }
    const invoicing = copies - waste;
    const copyCharges = tieredValue(invoicing);
    const adj = Number(adjustment) || 0;
    const base = agreement.rental + copyCharges + adj;
    const ssclValue = sscl ? base * SSCL_RATE : 0;
    const vatValue = vat ? (base + ssclValue) * VAT_RATE : 0;
    return { copies, waste, invoicing, copyCharges, adj, ssclValue, vatValue, net: base + ssclValue + vatValue };
}

/* ---------- small components ---------- */
const BADGES: Record<AgreementStatus, { label: string; cls: string }> = {
    invoiced: { label: "Invoiced", cls: "bg-emerald-100 text-emerald-800" },
    saved: { label: "M/R saved", cls: "bg-blue-100 text-blue-800" },
    unsaved: { label: "M/R not saved", cls: "bg-amber-100 text-amber-800" },
};

export function StatusBadge({ status }: { status: AgreementStatus }) {
    const b = BADGES[status];
    return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${b.cls}`}>{b.label}</span>;
}

export function Stepper({ step }: { step: number }) {
    const items = ["Select", "Meter readings", "Review & process"];
    return (
        <ol className="mb-6 flex flex-wrap items-center gap-2 text-sm">
            {items.map((t, i) => (
                <li key={t} className="flex items-center gap-2">
                    <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                            i < step ? "bg-emerald-600 text-white" : i === step ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}
                    >
                        {i < step ? "\u2713" : i + 1}
                    </span>
                    <span className={i === step ? "font-semibold text-slate-900" : "text-slate-500"}>{t}</span>
                    {i < items.length - 1 && <span className="mx-1 h-px w-6 bg-slate-300 sm:w-12" />}
                </li>
            ))}
        </ol>
    );
}