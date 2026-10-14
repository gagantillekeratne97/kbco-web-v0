"use client";

import { useEffect, useState } from "react";
import CustomerSearch, { type CustomerSearchResult } from "./customerSearch";
import { btnPrimary, btnSecondary, card, inputCls, StatusBadge } from "./ui";
import { getCustomerAgreements } from "@/lib/apis";
import { type CustomerAgreement } from "@/lib/types";

interface Props {
    customer: CustomerSearchResult | null;
    onCustomer: (c: CustomerSearchResult | null) => void;
    start: string;
    end: string;
    onStart: (v: string) => void;
    onEnd: (v: string) => void;
    onPick: (a: CustomerAgreement) => void;
}

const getCompanyId = (): string =>
    localStorage.getItem("companyID") || sessionStorage.getItem("companyID") || "";

export default function StepSelect({ customer, onCustomer, start, end, onStart, onEnd, onPick }: Props) {
    const [q, setQ] = useState(customer?.customerName ?? "");
    const [agreements, setAgreements] = useState<CustomerAgreement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const invalidPeriod = !start || !end || end < start;

    // Load the customer's agreements whenever the customer or the period changes
    useEffect(() => {
        if (!customer || invalidPeriod) {
            setAgreements([]);
            setError("");
            return;
        }

        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const response = await getCustomerAgreements(
                    getCompanyId(),
                    customer.customerCode,
                    start,
                    end
                );
                if (!cancelled) setAgreements(response.data || []);
            } catch (err) {
                if (cancelled) return;
                setAgreements([]);
                setError(err instanceof Error ? err.message : "Failed to load agreements.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        // ignore a late response if the customer or dates changed again
        return () => {
            cancelled = true;
        };
    }, [customer, start, end, invalidPeriod]);

    return (
        <div className="space-y-6">
            <div className={`${card} p-5`}>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Customer</label>
                        <CustomerSearch
                            value={q}
                            onChange={(v) => {
                                setQ(v);
                                onCustomer(null);
                            }}
                            onSelect={onCustomer}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Billing period</label>
                        <div className="flex items-center gap-2">
                            <input type="date" className={inputCls} value={start} onChange={(e) => onStart(e.target.value)} aria-label="Period start" />
                            <span className="text-slate-500">to</span>
                            <input type="date" className={inputCls} value={end} onChange={(e) => onEnd(e.target.value)} aria-label="Period end" />
                        </div>
                        {invalidPeriod ? (
                            <p className="mt-1 text-xs text-red-600">The end date must be on or after the start date.</p>
                        ) : (
                            <p className="mt-1 text-xs text-slate-500">Use the exact billing period. Status is checked for these dates.</p>
                        )}
                    </div>
                </div>
            </div>

            {customer ? (
                <div>
                    <h2 className="mb-3 text-base font-semibold text-slate-900">Agreements for {customer.customerName}</h2>

                    {loading && <p className="text-sm text-slate-500">Loading agreements...</p>}
                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {agreements.map((a, index) => {
                            const locked = a.status === "invoiced";
                            const empty = a.machineCount === 0;
                            return (
                                <div key={`${a.agreementId}-${index}`} className={`${card} flex flex-col gap-3 p-4`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="font-semibold text-slate-900">{a.agreementId}</div>
                                            <div className="text-sm text-slate-500">{a.agreementName}</div>
                                        </div>
                                        <StatusBadge status={a.status} />
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {a.machineCount} machine{a.machineCount !== 1 ? "s" : ""}
                                    </div>
                                    <button
                                        type="button"
                                        className={`${locked || empty ? btnSecondary : btnPrimary} mt-auto`}
                                        disabled={locked || empty}
                                        onClick={() => onPick(a)}
                                    >
                                        {locked
                                            ? "Already invoiced"
                                            : empty
                                            ? "No machines"
                                            : a.status === "saved"
                                            ? "Continue readings"
                                            : "Enter readings"}
                                    </button>
                                </div>
                            );
                        })}

                        {!loading && !error && !invalidPeriod && agreements.length === 0 && (
                            <p className="text-sm text-slate-500">This customer has no agreements.</p>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-sm text-slate-500">Choose a customer to see their agreements.</p>
            )}
        </div>
    );
}