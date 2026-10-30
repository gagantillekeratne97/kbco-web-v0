"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import type { Readings } from "./data";
import { btnPrimary, btnSecondary, card, inputCls } from "./ui";
import { getMeterSheet, saveMeterReading } from "@/lib/apis";
import type { CustomerAgreement, MeterSheet, SaveMeterReadingPayload } from "@/lib/types";
import type { CustomerSearchResult } from "./customerSearch";

interface Props {
    customer: CustomerSearchResult;
    agreement: CustomerAgreement;
    start: string;
    end: string;
    readings: Readings;
    onReadings: (r: Readings) => void;
    adjustment: string;
    onAdjustment: (v: string) => void;
    onBack: () => void;
    onNext: () => void;
    onToast: (m: string) => void;
}

const HEADERS = ["Make & model", "Serial no", "MC ref", "M location", "Start", "End", "Copies", "Waistage"];

const getCompanyId = (): string =>
    localStorage.getItem("companyID") || sessionStorage.getItem("companyID") || "";

const toNum = (v: string | undefined): number | null =>
    v === undefined || v === "" ? null : Number(v);

export default function StepReadings({
    customer, agreement, start, end, readings, onReadings, adjustment, onAdjustment, onBack, onNext, onToast,
}: Props) {
    const [sheet, setSheet] = useState<MeterSheet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("");
    const [saving, setSaving] = useState(false);

    const getUserName = ():string => { 
        var username = localStorage.getItem("userName") || sessionStorage.getItem("userName") || ""; 
        return username;
    }

    const buildPayload = (): SaveMeterReadingPayload => ({
    companyId: getCompanyId(),
    customerCode: customer.customerCode,
    agreementId: agreement.agreementId,
    periodStart: start,
    periodEnd: end,
    userName: getUserName(),
    adjustment: toNum(adjustment),
    rows: rows
        .filter((r) => !r.hardErr && toNum(readings[r.serial]?.end) !== null)
        .map((r) => ({
            serial: r.serial,
            endReading: toNum(readings[r.serial]?.end) as number,
            waistage: toNum(readings[r.serial]?.waste) ?? 0,
        })),
    });

    // returns true if the save worked
    const saveAndContinue = async (): Promise<boolean> => {
        debugger;
        const payload = buildPayload();

        if (payload.rows.length === 0) {
            onToast("Enter at least one end reading first.");
            return false;
        }

        try {
            setSaving(true);
            await saveMeterReading(payload);
            return true;
        } catch (err: any) {
            onToast(err?.response?.data?.message ?? "Failed to save meter readings.");
            return false;
        } finally {
            setSaving(false);
        }
    };    

    const onSaveDraft = async () => {
        if (await saveAndContinue()) onToast("Draft saved.");
    };

    const onSaveAndContinue = async () => {
        if (await saveAndContinue()) onNext();
    };

    // Load the meter sheet, then fill the grid with any saved readings
    useEffect(() => {
        let cancelled = false;        

        const load = async () => {
            try {                
                setLoading(true);
                setError("");
                const response = await getMeterSheet(
                    getCompanyId(), customer.customerCode, agreement.agreementId, start, end, getUserName()
                );
                if (cancelled) return;

                const data: MeterSheet = response.data;
                setSheet(data);

                // seed only when the wizard has nothing yet, so going Back from Step 3 keeps unsaved edits
                if (Object.keys(readings).length === 0) {
                    const seeded: Readings = {};
                    data.machines.forEach((m) => {
                        if (m.endReading !== null || m.waistage !== null) {
                            seeded[m.serial] = {
                                end: m.endReading?.toString() ?? "",
                                waste: m.waistage?.toString() ?? "",
                            };
                        }
                    });
                    onReadings(seeded);
                    if (data.adjustment !== null) onAdjustment(String(data.adjustment));
                }
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load the meter sheet.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customer.customerCode, agreement.agreementId, start, end]);

    if (loading) return <p className="text-sm text-slate-500">Loading meter sheet...</p>;

    if (error || !sheet) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-red-600">{error || "Meter sheet not available."}</p>
                <button type="button" className={btnSecondary} onClick={onBack}>Back</button>
            </div>
        );
    }

    const locked = sheet.status === "invoiced";

    const rows = sheet.machines.map((m) => {
        const endVal = toNum(readings[m.serial]?.end);
        const hardErr = endVal !== null && endVal < m.startReading;
        const warn = endVal !== null && !hardErr && endVal - m.startReading > 50000;
        return {
            ...m,
            copiesNow: endVal !== null && !hardErr ? endVal - m.startReading : null,
            hardErr,
            error: hardErr ? "End is less than start" : warn ? "Unusually high jump, please check" : null,
        };
    });

    const completed = rows.filter((r) => r.copiesNow !== null).length;
    const allDone = rows.length > 0 && completed === rows.length;
    const term = filter.trim().toLowerCase();

    const shown = rows.filter((r) =>
        `${r.serial} ${r.model} ${r.machineRef} ${r.machineLocation}`.toLowerCase().includes(term)
    );
    //const shown = rows.filter((r) => `${r.serial} ${r.model}`.toLowerCase().includes(filter.toLowerCase()));

    const setField = (serial: string, key: "end" | "waste", value: string) => {
    const current = readings[serial] ?? { end: "", waste: "" };
    onReadings({ ...readings, [serial]: { ...current, [key]: value } });
    };

    // Enter moves to the next visible machine's End field
    const onEnter = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key !== "Enter") return;
        document.querySelector<HTMLInputElement>(`[data-end="${index + 1}"]`)?.focus();
    };

    const a = sheet.agreement;

    return (
        <div className="space-y-5">
            {locked && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    This agreement is already invoiced for this period. Readings are locked.
                </div>
            )}

            <div className={`${card} grid gap-3 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4`}>
                {[
                    ["Billing method", a.billingMethod],
                    ["Slab method", a.slabMethod],
                    ["Billing period", String(a.billingPeriod)],
                    ["Rep code", a.repCode],
                ].map(([k, v]) => (
                    <div key={k}>
                        <div className="text-slate-500">{k}</div>
                        <div className="font-medium text-slate-900">{v || "-"}</div>
                    </div>
                ))}
                <div className="sm:col-span-2 lg:col-span-4">
                    <div className="text-slate-500">Location</div>
                    <div className="font-medium text-slate-900">                        
                        {[sheet.location.name, sheet.location.address1, sheet.location.address2].filter(Boolean).join(", ") || "-"}
                    </div>
                </div>
            </div>

            <input
                className={`${inputCls} sm:max-w-xs`}
                placeholder="Search serial no or model"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
            />

            <div className={`${card} max-h-[60vh] overflow-auto`}>
                <table className="w-full min-w-[900px] text-sm">
                    <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-slate-200 text-left text-slate-600">
                            {HEADERS.map((h, i) => (
                                <th key={h} className={`px-4 py-3 font-medium ${i > 3 ? "text-right" : ""}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {shown.map((r, index) => (
                            <tr key={r.serial} className="border-b border-slate-100 last:border-0">
                                <td className="px-4 py-2">{r.model}</td>
                                <td className="px-4 py-2">{r.serial}</td>
                                <td className="px-4 py-2">{r.machineRef}</td>
                                <td className="px-4 py-2">{r.machineLocation}</td>
                                <td className="px-4 py-2 text-right text-slate-600">{r.startReading.toLocaleString()}</td>
                                <td className="w-36 px-4 py-2">
                                    <input
                                        data-end={index}
                                        type="number"
                                        disabled={locked}
                                        className={`${inputCls} text-right ${r.hardErr ? "border-red-500" : r.error ? "border-amber-500" : ""}`}
                                        value={readings[r.serial]?.end ?? ""}
                                        onChange={(e) => setField(r.serial, "end", e.target.value)}
                                        onKeyDown={(e) => onEnter(e, index)}
                                        aria-label={`End reading for ${r.serial}`}
                                    />
                                    {r.error && (
                                        <div className={`mt-1 text-xs ${r.hardErr ? "text-red-600" : "text-amber-600"}`}>{r.error}</div>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-right font-medium">
                                    {r.copiesNow !== null ? r.copiesNow.toLocaleString() : "\u2013"}
                                </td>
                                <td className="w-28 px-4 py-2">
                                    <input
                                        type="number"
                                        min="0"
                                        disabled={locked}
                                        className={`${inputCls} text-right`}
                                        value={readings[r.serial]?.waste ?? ""}
                                        onChange={(e) => setField(r.serial, "waste", e.target.value)}
                                        aria-label={`Waistage for ${r.serial}`}
                                    />
                                </td>
                            </tr>
                        ))}
                        {shown.length === 0 && (
                            <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-500">No machine matches that search.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="w-40">
                    <label className="mb-1 block text-sm font-medium text-slate-700">Adjustment</label>
                    <input
                        type="number"
                        disabled={locked}
                        className={`${inputCls} text-right`}
                        value={adjustment}
                        onChange={(e) => onAdjustment(e.target.value)}
                    />
                </div>
                <div className="text-sm text-slate-600">{completed} of {rows.length} machines completed</div>
            </div>

            <div className="flex justify-between gap-3">
                <button type="button" className={btnSecondary} onClick={onBack}>Back</button>
                <div className="flex gap-3">
                    <button
                        type="button"
                        className={btnSecondary}
                        disabled={locked || saving}
                        onClick={onSaveDraft}
                    >
                        {saving ? "Saving..." : "Save draft"}
                    </button>
                    <button
                        type="button"
                        className={btnPrimary}
                        disabled={!allDone || locked || saving}
                        onClick={onSaveAndContinue}
                    >
                        {saving ? "Saving..." : "Save & continue"}
                    </button>
                </div>
            </div>
            {!allDone && !locked && (
                <p className="text-right text-xs text-slate-500">Continue unlocks when every machine has a valid end reading.</p>
            )}
        </div>
    );
}