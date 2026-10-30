"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Barcode,
    Building2,
    Check,
    CheckCircle2,
    ClipboardList,
    Hash,
    Loader2,
    MapPin,
    MessageSquare,
    PackageSearch,
    Phone,
    Printer,
    Search,
    Truck,
    User,
} from "lucide-react";
import { MachineRecord, MachineReturnRequest } from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */



type Props = {
    /** Replace with your real API call. Return every machine that matches. */
    onSearch?: (query: string) => Promise<MachineRecord[]>;
    /** Replace with your real submit call. Throw to show an error toast. */
    onSubmit?: (request: MachineReturnRequest) => Promise<void> | void;
};

/* ------------------------------------------------------------------ */
/* Demo data so the page renders before the API is wired up.           */
/* Delete this and pass `onSearch` instead.                            */
/* ------------------------------------------------------------------ */

const DEMO_MACHINES: MachineRecord[] = [
    {
        pNumber: "P-10452",
        serialNumber: "C317R303474",
        machineModel: "MP 3555",
        customerCode: "8",
        customerName: "HOVAEL CONSTRUCTION",
        customerAddress: "Orugodawatta, Colombo",
        contactPerson: "Nimal Perera",
        contactPhone: "0771234567",
        machineLocation: "ORUGODAWATTA - MARKETING",
    },
    {
        pNumber: "P-10453",
        serialNumber: "E338M450110",
        machineModel: "MP 2501SP",
        customerCode: "8",
        customerName: "HOVAEL CONSTRUCTION",
        customerAddress: "Orugodawatta, Colombo",
        contactPerson: "Kamal Silva",
        contactPhone: "0712345678",
        machineLocation: "ORUGODAWATTA - HR",
    },
];

const demoSearch = async (query: string): Promise<MachineRecord[]> => {
    await new Promise((r) => setTimeout(r, 500));
    const q = query.trim().toUpperCase();
    return DEMO_MACHINES.filter(
        (m) =>
            m.pNumber.toUpperCase() === q ||
            m.serialNumber.toUpperCase() === q
    );
};

/* ------------------------------------------------------------------ */
/* Workflow                                                            */
/* ------------------------------------------------------------------ */

const STEPS = ["Find machine", "Pickup details", "Review & submit"] as const;

const PHONE_PATTERN = /^[0-9+\-\s()]{7,15}$/;

// Edit this list to match the reasons your company uses.
// The saved value is the text itself, so keep the wording stable once you go live.
const RETURN_REASONS = [
    "Contract ended",
    "Upgrade / replacement",
    "Faulty or repeated breakdowns",
    "Low usage",
    "Customer closing or relocating",
    "Other",
] as const;

const COMMENT_MAX = 500;

export default function MachineReturnWorkflow({
    onSearch = demoSearch,
    onSubmit,
}: Props) {
    const [step, setStep] = useState(0);

    // step 1
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<MachineRecord[] | null>(null);
    const [machine, setMachine] = useState<MachineRecord | null>(null);

    // step 2
    const [contactPerson, setContactPerson] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [pickupLocation, setPickupLocation] = useState("");
    const [returnReason, setReturnReason] = useState("");
    const [returnComment, setReturnComment] = useState("");
    const [touched, setTouched] = useState(false);

    // step 3
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    /* ---------------- search ---------------- */

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        setResults(null);
        setMachine(null);
        try {
            const found = await onSearch(query.trim());
            setResults(found);
            if (found.length === 1) selectMachine(found[0]);
        } catch (error) {
            console.error(error);
            toast.error("Search failed. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    const selectMachine = (m: MachineRecord) => {
        setMachine(m);
        setContactPerson(m.contactPerson ?? "");
        setContactPhone(m.contactPhone ?? "");
        setPickupLocation(m.machineLocation ?? "");
        setTouched(false);
    };

    /* ---------------- validation ---------------- */

    const errors = {
        contactPerson: contactPerson.trim() ? "" : "Enter a contact person.",
        contactPhone: !contactPhone.trim()
            ? "Enter a contact number."
            : PHONE_PATTERN.test(contactPhone.trim())
              ? ""
              : "Enter a valid phone number.",
        pickupLocation: pickupLocation.trim() ? "" : "Enter the pickup location.",
        returnReason: returnReason ? "" : "Select a reason for the return.",
        // a comment is optional, except when the reason is "Other"
        returnComment:
            returnReason === "Other" && !returnComment.trim()
                ? "Please describe the reason."
                : "",
    };
    const hasErrors = Object.values(errors).some(Boolean);

    const goFromDetails = () => {
        setTouched(true);
        if (!hasErrors) setStep(2);
    };

    /* ---------------- submit ---------------- */

    const getCompanyId = (): string => { 
    const companyId = localStorage.getItem("companyID") || sessionStorage.getItem("companyID");
    
    if (!companyId) {
      throw new Error("Company ID not found.");
    }

    return companyId;
  };

    const handleSubmit = async () => {
        const companyId = getCompanyId();
        if (!machine) return;
        setIsSubmitting(true);
        try {
            await onSubmit?.({
                companyId: companyId,
                pNumber: machine.pNumber,
                serialNumber: machine.serialNumber,
                machineModel: machine.machineModel,
                customerCode: machine.customerCode,
                customerName: machine.customerName,
                customerAddress: machine.customerAddress,
                contactPerson: contactPerson.trim(),
                contactPhone: contactPhone.trim(),
                pickupLocation: pickupLocation.trim(),
                returnReason,
                returnComment: returnComment.trim(),
            });
            setSubmitted(true);
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error && error.message
                    ? error.message
                    : "Could not submit the return request. Try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setStep(0);
        setQuery("");
        setResults(null);
        setMachine(null);
        setContactPerson("");
        setContactPhone("");
        setPickupLocation("");
        setReturnReason("");
        setReturnComment("");
        setTouched(false);
        setSubmitted(false);
    };

    /* ---------------- success ---------------- */

    if (submitted && machine) {
        return (
            <div className="mx-auto max-w-3xl">
                <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <h2 className="mt-5 text-xl font-semibold text-slate-900">
                        Return request submitted
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                        {machine.machineModel} (serial {machine.serialNumber}) from{" "}
                        {machine.customerName} is queued for pickup.
                    </p>
                    <Button onClick={reset} className="mt-6">
                        Start another return
                    </Button>
                </div>
            </div>
        );
    }

    /* ---------------- layout ---------------- */

    return (
        <div className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                            <Truck className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-slate-900">
                                Machine return request
                            </h1>
                            <p className="text-sm text-slate-500">
                                Find the machine, confirm pickup details, then submit.
                            </p>
                        </div>
                    </div>

                    <Stepper current={step} />
                </div>

                {/* Body */}
                <div className="bg-slate-50 px-6 py-6">
                    {step === 0 && (
                        <div className="space-y-5">
                            {/* Search */}
                            <div className="rounded-lg border border-slate-200 bg-white p-4">
                                <label
                                    htmlFor="machine-search"
                                    className="text-sm font-medium text-slate-900"
                                >
                                    Search by P-number or serial number
                                </label>
                                <div className="mt-2 flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="machine-search"
                                            autoFocus
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                            placeholder="e.g. P-10452 or C317R303474"
                                            className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSearch}
                                        disabled={isSearching || !query.trim()}
                                    >
                                        {isSearching ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="mr-2 h-4 w-4" />
                                        )}
                                        Search
                                    </Button>
                                </div>
                            </div>

                            {/* Empty / not found */}
                            {results === null && !isSearching && (
                                <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                                    <PackageSearch className="h-8 w-8" />
                                    <p className="text-sm">
                                        Machine details will appear here after you search.
                                    </p>
                                </div>
                            )}

                            {results && results.length === 0 && (
                                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <p>
                                        No machine found for &ldquo;{query.trim()}&rdquo;. Check the
                                        P-number or serial number and try again.
                                    </p>
                                </div>
                            )}

                            {/* Several matches: pick one */}
                            {results && results.length > 1 && (
                                <div className="rounded-lg border border-slate-200 bg-white">
                                    <p className="border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-900">
                                        {results.length} machines found. Select one.
                                    </p>
                                    <ul className="divide-y divide-slate-100">
                                        {results.map((m) => (
                                            <li key={m.serialNumber}>
                                                <button
                                                    type="button"
                                                    onClick={() => selectMachine(m)}
                                                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-slate-50 ${
                                                        machine?.serialNumber === m.serialNumber
                                                            ? "bg-slate-50"
                                                            : ""
                                                    }`}
                                                >
                                                    <span>
                                                        <span className="font-medium text-slate-900">
                                                            {m.machineModel}
                                                        </span>
                                                        <span className="ml-2 font-mono text-[13px] text-slate-500">
                                                            {m.serialNumber}
                                                        </span>
                                                    </span>
                                                    {machine?.serialNumber === m.serialNumber && (
                                                        <Check className="h-4 w-4 text-emerald-600" />
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Selected machine */}
                            {machine && <MachineSummary machine={machine} />}
                        </div>
                    )}

                    {step === 1 && machine && (
                        <div className="space-y-5">
                            <MachineSummary machine={machine} compact />

                            <div className="rounded-lg border border-slate-200 bg-white p-5">
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Reason for return
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Why is this machine being returned?
                                </p>

                                <div className="mt-4">
                                    <label
                                        htmlFor="return-reason"
                                        className="text-sm font-medium text-slate-900"
                                    >
                                        Return reason
                                    </label>
                                    <div className="relative mt-1.5">
                                        <ClipboardList className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <select
                                            id="return-reason"
                                            value={returnReason}
                                            onChange={(e) => setReturnReason(e.target.value)}
                                            className={`h-10 w-full appearance-none rounded-md border bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 ${
                                                returnReason ? "text-slate-900" : "text-slate-400"
                                            } ${
                                                touched && errors.returnReason
                                                    ? "border-red-400 focus:ring-red-100"
                                                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                                            }`}
                                        >
                                            <option value="">Select a reason</option>
                                            {RETURN_REASONS.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {touched && errors.returnReason && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.returnReason}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <label
                                        htmlFor="return-comment"
                                        className="text-sm font-medium text-slate-900"
                                    >
                                        Comment{" "}
                                        <span className="font-normal text-slate-500">
                                            {returnReason === "Other" ? "(required)" : "(optional)"}
                                        </span>
                                    </label>
                                    <div className="relative mt-1.5">
                                        <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <textarea
                                            id="return-comment"
                                            rows={3}
                                            maxLength={COMMENT_MAX}
                                            value={returnComment}
                                            onChange={(e) => setReturnComment(e.target.value)}
                                            placeholder="Anything the pickup team or the reviewer should know"
                                            className={`w-full resize-none rounded-md border bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                                                touched && errors.returnComment
                                                    ? "border-red-400 focus:ring-red-100"
                                                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                                            }`}
                                        />
                                    </div>
                                    <div className="mt-1 flex justify-between text-xs">
                                        <span className="text-red-600">
                                            {touched && errors.returnComment}
                                        </span>
                                        <span className="text-slate-500">
                                            {returnComment.length}/{COMMENT_MAX}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white p-5">
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Contact and pickup
                                </h2>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Who should the driver contact, and where is the machine?
                                </p>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <Field
                                        id="contact-person"
                                        label="Contact person"
                                        icon={<User className="h-4 w-4" />}
                                        value={contactPerson}
                                        onChange={setContactPerson}
                                        error={touched ? errors.contactPerson : ""}
                                        placeholder="Full name"
                                    />
                                    <Field
                                        id="contact-phone"
                                        label="Contact number"
                                        icon={<Phone className="h-4 w-4" />}
                                        value={contactPhone}
                                        onChange={setContactPhone}
                                        error={touched ? errors.contactPhone : ""}
                                        placeholder="07X XXX XXXX"
                                        type="tel"
                                    />
                                </div>

                                <div className="mt-4">
                                    <label
                                        htmlFor="pickup-location"
                                        className="text-sm font-medium text-slate-900"
                                    >
                                        Pickup location
                                    </label>
                                    <div className="relative mt-1.5">
                                        <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <textarea
                                            id="pickup-location"
                                            rows={3}
                                            value={pickupLocation}
                                            onChange={(e) => setPickupLocation(e.target.value)}
                                            placeholder="Building, floor, department and any access notes"
                                            className={`w-full resize-none rounded-md border bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                                                touched && errors.pickupLocation
                                                    ? "border-red-400 focus:ring-red-100"
                                                    : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                                            }`}
                                        />
                                    </div>
                                    {touched && errors.pickupLocation && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.pickupLocation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && machine && (
                        <div className="space-y-5">
                            <MachineSummary machine={machine} />

                            <section className="rounded-lg border border-slate-200 bg-white p-5">
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Contact and pickup
                                </h2>
                                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <Info icon={<User />} label="Contact person" value={contactPerson} />
                                    <Info icon={<Phone />} label="Contact number" value={contactPhone} />
                                    <div className="sm:col-span-2">
                                        <Info icon={<MapPin />} label="Pickup location" value={pickupLocation} />
                                    </div>
                                    <Info icon={<ClipboardList />} label="Return reason" value={returnReason} />
                                    <div className="sm:col-span-2">
                                        <Info icon={<MessageSquare />} label="Comment" value={returnComment} />
                                    </div>
                                </dl>
                            </section>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
                    <Button
                        variant="ghost"
                        onClick={() => setStep((s) => Math.max(0, s - 1))}
                        disabled={step === 0 || isSubmitting}
                        className={step === 0 ? "invisible" : ""}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    {step === 0 && (
                        <Button onClick={() => setStep(1)} disabled={!machine}>
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    {step === 1 && (
                        <Button onClick={goFromDetails}>
                            Review
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    {step === 2 && (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="mr-2 h-4 w-4" />
                            )}
                            Submit return request
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

function Stepper({ current }: { current: number }) {
    return (
        <ol className="mt-6 flex items-center">
            {STEPS.map((label, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <li key={label} className="flex flex-1 items-center last:flex-none">
                        <div className="flex items-center gap-2">
                            <span
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                    done
                                        ? "bg-emerald-600 text-white"
                                        : active
                                          ? "bg-slate-900 text-white"
                                          : "bg-slate-200 text-slate-500"
                                }`}
                            >
                                {done ? <Check className="h-4 w-4" /> : i + 1}
                            </span>
                            <span
                                className={`hidden text-sm sm:inline ${
                                    active ? "font-medium text-slate-900" : "text-slate-500"
                                }`}
                            >
                                {label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div
                                className={`mx-3 h-px flex-1 ${
                                    done ? "bg-emerald-600" : "bg-slate-200"
                                }`}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

function MachineSummary({
    machine,
    compact,
}: {
    machine: MachineRecord;
    compact?: boolean;
}) {
    return (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-900">
                {compact ? "Selected machine" : "Machine and customer"}
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                <Info icon={<Hash />} label="P-number" value={machine.pNumber} mono />
                <Info icon={<Barcode />} label="Serial number" value={machine.serialNumber} mono />
                <Info icon={<Printer />} label="Machine model" value={machine.machineModel} />
            </dl>

            {!compact && (
                <>
                    <div className="my-4 border-t border-slate-100" />
                    <dl className="grid gap-4 sm:grid-cols-3">
                        <Info icon={<Hash />} label="Customer code" value={machine.customerCode} />
                        <div className="sm:col-span-2">
                            <Info icon={<Building2 />} label="Customer name" value={machine.customerName} />
                        </div>
                        <div className="sm:col-span-3">
                            <Info icon={<MapPin />} label="Customer address" value={machine.customerAddress} />
                        </div>
                    </dl>
                </>
            )}
        </section>
    );
}

function Info({
    icon,
    label,
    value,
    mono,
}: {
    icon: React.ReactElement;
    label: string;
    value?: string;
    mono?: boolean;
}) {
    return (
        <div className="min-w-0">
            <dt className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
                {label}
            </dt>
            <dd
                className={`mt-1 break-words text-sm font-medium text-slate-900 ${
                    mono ? "font-mono text-[13px]" : ""
                }`}
            >
                {value || "-"}
            </dd>
        </div>
    );
}

function Field({
    id,
    label,
    icon,
    value,
    onChange,
    error,
    placeholder,
    type = "text",
}: {
    id: string;
    label: string;
    icon: React.ReactElement;
    value: string;
    onChange: (v: string) => void;
    error?: string;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div>
            <label htmlFor={id} className="text-sm font-medium text-slate-900">
                {label}
            </label>
            <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {icon}
                </span>
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`h-10 w-full rounded-md border bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                        error
                            ? "border-red-400 focus:ring-red-100"
                            : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
                    }`}
                />
            </div>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}