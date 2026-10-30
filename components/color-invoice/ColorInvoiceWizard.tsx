"use client";

import { useRef, useState } from "react";
import { Readings } from "../bw-invoice/data";
import ColorStepSelect from "./ColorStepSelect";
import ColorStepReading from "./ColorStepReading";
import ColorStepReview from "./ColorStepReview";
import ColorStepDone from "./ColorStepDone";
import { Stepper } from "../bw-invoice/ui";
import { type CustomerSearchResult } from "./colorCustomerSearch";
import { getInvoiceNumber } from "@/lib/apis";
import { type CustomerAgreement } from "@/lib/types";

const getCompanyId = (): string =>
    localStorage.getItem("companyID") || sessionStorage.getItem("companyID") || "";

export default function ColorInvoiceWizard() {
    const [step, setStep] = useState(0);
    const [customer, setCustomer] = useState<CustomerSearchResult | null>(null);
    const [agreement, setAgreement] = useState<CustomerAgreement | null>(null);
    const [start, setStart] = useState("2026-10-01");
    const [end, setEnd] = useState("2026-10-31");
    const [readings, setReadings] = useState<Readings>({});
    const [adjustment, setAdjustment] = useState("0");
    const [message, setMessage] = useState("");
    // created = just processed in this wizard, view = opened from an "Already invoiced" card
    const [completed, setCompleted] = useState<{ invoiceNo: string; mode: "created" | "view" } | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>();

    const toast = (m: string) => {
        setMessage(m);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setMessage(""), 2500);
    };

    const pickAgreement = (a: CustomerAgreement) => {
        setAgreement(a);
        setReadings({});
        setAdjustment("0");
        setStep(1);
    };

    // StepReview calls this once the invoice is created
    const onInvoiceCreated = (invoiceNo: string) => {
        setCompleted({ invoiceNo, mode: "created" });
    };

    // "View invoice" on an already invoiced agreement card
    const viewInvoice = async (a: CustomerAgreement) => {
        if (!customer) return;
        try {
            const invoiceNo = await getInvoiceNumber({
                companyId: getCompanyId(),
                customerCode: customer.customerCode,
                agreementId: a.agreementId,
                periodStart: start,
                periodEnd: end,
            });
            setCompleted({ invoiceNo, mode: "view" });
        } catch (err) {
            toast(err instanceof Error ? err.message : "Could not find the invoice.");
        }
    };

    // After processing: back to Step 1 with a clean slate.
    // StepSelect reloads the agreements, so the server reports the new "invoiced" status.
    const startNew = () => {
        setCompleted(null);
        setAgreement(null);
        setReadings({});
        setAdjustment("0");
        setStep(0);
    };

    return (
        <div className="mx-auto max-w-5xl">
            <Stepper step={step} />

            {completed && customer ? (
                <ColorStepDone
                    invoiceNo={completed.invoiceNo}
                    customerName={customer.customerName}
                    mode={completed.mode}
                    // viewing: just return to the agreement list (customer and dates are kept)
                    onNew={completed.mode === "view" ? () => setCompleted(null) : startNew}
                />
            ) : (
                <>
                    {step === 0 && (
                        <ColorStepSelect
                            customer={customer}
                            onCustomer={setCustomer}
                            start={start}
                            end={end}
                            onStart={setStart}
                            onEnd={setEnd}
                            onPick={pickAgreement}
                            onViewInvoice={viewInvoice}
                        />
                    )}

                    {step === 1 && agreement && customer && (
                        <ColorStepReading
                            customer={customer}
                            agreement={agreement}
                            start={start}
                            end={end}
                            readings={readings}
                            onReadings={setReadings}
                            adjustment={adjustment}
                            onAdjustment={setAdjustment}
                            onBack={() => setStep(0)}
                            onNext={() => setStep(2)}
                            onToast={toast}
                        />
                    )}

                    {step === 2 && agreement && customer && (
                        <ColorStepReview
                            customer={customer}
                            agreement={agreement}
                            start={start}
                            end={end}
                            onBack={() => setStep(1)}
                            onDone={onInvoiceCreated}
                            onToast={toast}
                        />
                    )}
                </>
            )}

            {message && (
                <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
                    {message}
                </div>
            )}
        </div>
    );
}