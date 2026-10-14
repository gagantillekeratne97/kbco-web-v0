"use client";

import { useRef, useState } from "react";
import type { Readings } from "./data";
import StepSelect from "./StepSelect";
// import StepReadings from "./StepReading";   // re-enable after the meter sheet endpoint
// import StepReview from "./Stepreview";      // re-enable after the meter sheet endpoint
import { btnSecondary, card, Stepper } from "./ui";
import { type CustomerSearchResult } from "./customerSearch";
import { type CustomerAgreement } from "@/lib/types";
import StepReadings from "./StepReading";

export default function BWInvoiceWizard() {
    const [step, setStep] = useState(0);
    const [customer, setCustomer] = useState<CustomerSearchResult | null>(null);
    const [agreement, setAgreement] = useState<CustomerAgreement | null>(null);
    const [start, setStart] = useState("2026-10-01");
    const [end, setEnd] = useState("2026-10-31");
    const [readings, setReadings] = useState<Readings>({});
    const [adjustment, setAdjustment] = useState("0");
    const [message, setMessage] = useState("");
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

    // After processing an invoice: go back to Step 1.
    // StepSelect reloads the agreements, so the server reports the new "invoiced" status.
    const finish = () => {
        setAgreement(null);
        setStep(0);
    };

    return (
        <div className="mx-auto max-w-5xl">
            <Stepper step={step} />            

            {step === 0 && (
                <StepSelect
                    customer={customer}
                    onCustomer={setCustomer}
                    start={start}
                    end={end}
                    onStart={setStart}
                    onEnd={setEnd}
                    onPick={pickAgreement}
                />
            )}            

            {step === 1 && agreement && customer && (
                <StepReadings
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

            {/* placeholder until the invoice preview endpoint exists */}
            {step === 2 && agreement && (
                <div className={`${card} space-y-3 p-5`}>
                    <p className="text-sm text-slate-500">The invoice review will load here once the preview endpoint is ready.</p>
                    <button type="button" className={btnSecondary} onClick={() => setStep(1)}>Back</button>
                </div>
            )}

            {/*
            {step === 1 && agreement && (
                <StepReadings ... />
            )}
            {step === 2 && agreement && customer && (
                <StepReview ... />
            )}
            */}

            {message && (
                <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
                    {message}
                </div>
            )}
        </div>
    );
}