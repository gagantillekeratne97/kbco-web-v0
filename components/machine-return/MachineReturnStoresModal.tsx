"use client";

import { useEffect, useState } from "react";
import {
    X,
    Hash,
    User,
    MapPin,
    Barcode,
    Printer,
    Phone,
    Truck,
    Building2,
    CalendarDays,
    CheckCircle2,
    XCircle,
    LoaderCircle,
} from "lucide-react";
import { getCompanyName} from "@/lib/apis";
import {printMachineCollectionNote} from "@/lib/pdf/machineCollectionNote";
import {format} from "node:url";
import {machineReturnReqDto} from "@/lib/types";

// @/lib/types
export interface MachineReturnApprovalStoresRequest {
    machineReturnID: string;
    approverID: string;
    status: "APPROVED" | "REJECTED";
    comment?: string;
}

/** The only data sent to the controller. */
export interface MachineReturnStoresForm {
    machineReturnId: string;
    approverID: string;
    status: "APPROVED" | "REJECTED";
    comment?: string; // optional
}

/** Display-only data shown to the stores approver. */
export interface MachineReturnStoresDetails {
    returnDate: string;
    machineRefNumber?: string;
    serialNo?: string;
    model?: string;
    customerCode?: string;
    customerName?: string;
    address?: string;
    contactPerson?: string;
    contactNumber?: string;
    pickUpLocation?: string;
    requestDate?: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    machineReturnID: string;
    approverID: string;
    details?: MachineReturnStoresDetails;
    /** Should throw on failure so the error can be shown inside the dialog. */
    onSubmit: (data: MachineReturnApprovalStoresRequest) => Promise<void> | void;
}

function Info({
                  label,
                  icon: Icon,
                  value,
                  wide,
              }: {
    label: string;
    icon?: React.ElementType;
    value?: string;
    wide?: boolean;
}) {
    return (
        <div className={wide ? "sm:col-span-2" : undefined}>
            <dt className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
                {label}
            </dt>
            <dd className="break-words text-sm text-slate-900">
                {value && value.trim() !== "" ? (
                    value
                ) : (
                    <span className="text-slate-300">—</span>
                )}
            </dd>
        </div>
    );
}

function Section({
                     title,
                     icon: Icon,
                     children,
                 }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Icon className="h-4 w-4 text-blue-600" />
                {title}
            </h3>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                {children}
            </dl>
        </section>
    );
}

const formatDateTime = (value?: string) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

export default function MachineReturnStoresModal({
                                                     open,
                                                     onClose,
                                                     machineReturnID,
                                                     approverID,
                                                     details,
                                                     onSubmit,
                                                 }: Props) {
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState<"APPROVED" | "REJECTED" | null>(
        null
    );
    const [error, setError] = useState("");
    const [printing, setPrinting] = useState(false);

    function getCompanyId(): string {
        if (typeof window === "undefined") {
            throw new Error("Company ID not found.");
        }

        const companyId =
            localStorage.getItem("companyID") ??
            sessionStorage.getItem("companyID");

        if (!companyId) {
            throw new Error("Company ID not found.");
        }

        return companyId;
    }

    const handlePrinting = async () => {
        debugger;
        setError("");
        setPrinting(true);
        try {
            let companyName = "";
            let companyId = getCompanyId();
            companyName = await getCompanyName(companyId);
            await printMachineCollectionNote({
                returnId: machineReturnID,
                requestDate: formatDateTime(details?.returnDate),
                companyName,
                details
            });
        }
        catch (error) {
            console.error("Collection note failed:", error);
            setError("Could not generate the collection note. Please try again.");
        } finally {
            setPrinting(false);
        }
    }

    // Reset whenever the modal opens for a (new) return
    useEffect(() => {
        if (open) {
            setComment("");
            setError("");
            setSubmitting(null);
        }
    }, [open, machineReturnID]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) =>
            e.key === "Escape" && !submitting && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose, submitting]);

    if (!open) return null;

    const decide = async (status: "APPROVED" | "REJECTED") => {
        setError("");
        setSubmitting(status);

        const payload: MachineReturnApprovalStoresRequest = {
            machineReturnID,
            approverID,
            status,
            ...(comment.trim() ? { comment: comment.trim() } : {}),
        };

        try {
            await onSubmit(payload);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong. Please try again."
            );
            setSubmitting(null);
        }
    };

    const busy = submitting !== null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mrs-title"
        >
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <header className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
                    <div>
                        <h2 id="mrs-title" className="text-lg font-semibold text-slate-900">
                            Machine Return – Stores Approval
                        </h2>
                        <p className="text-sm text-slate-500">
                            Return ID{" "}
                            <span className="font-medium text-slate-700">{machineReturnID}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </header>

                {/* Body */}
                <div className="space-y-4 overflow-y-auto px-6 py-5">
                    <Section title="Reference" icon={Hash}>
                        <Info label="P-Number" icon={Hash} value={details?.machineRefNumber} />
                        <Info label="Q-Number" icon={Hash} value={details?.machineRefNumber} />
                        <Info
                            label="Return Request Date"
                            icon={CalendarDays}
                            value={formatDateTime(details?.returnDate)}
                        />
                    </Section>

                    <Section title="Customer Details" icon={Building2}>
                        <Info label="Customer Code" value={details?.customerCode} />
                        <Info label="Customer Name" value={details?.customerName} />
                        <Info label="Customer Address" value={details?.address} wide />
                    </Section>

                    <Section title="Machine" icon={Printer}>
                        <Info label="Serial Number" icon={Barcode} value={details?.serialNo} />
                        <Info label="Machine Model" icon={Printer} value={details?.model} />
                    </Section>

                    <Section title="Contact Details" icon={User}>
                        <Info label="Contact Person" icon={User} value={details?.contactPerson} />
                        <Info label="Contact Number" icon={Phone} value={details?.contactNumber} />
                    </Section>

                    <Section title="Pick Up" icon={Truck}>
                        <Info
                            label="Pick Up Location (Machine Location)"
                            icon={MapPin}
                            value={details?.pickUpLocation}
                            wide
                        />
                    </Section>

                    {/* Approver input */}
                    <section>
                        <label
                            htmlFor="mrs-comment"
                            className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                            Comment <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <textarea
                            id="mrs-comment"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={busy}
                            placeholder="Add a comment for this decision..."
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                        />
                    </section>

                    {error && (
                        <p
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                        >
                            {error}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={handlePrinting}
                        disabled={busy || printing}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                        {printing ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                            <Printer className="h-4 w-4" />
                        )}
                        Print Collection Note
                    </button>

                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={busy}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={() => decide("REJECTED")}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                        >
                            {submitting === "REJECTED" ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <XCircle className="h-4 w-4" />
                            )}
                            Reject
                        </button>

                        <button
                            type="button"
                            onClick={() => decide("APPROVED")}
                            disabled={busy}
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {submitting === "APPROVED" ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4" />
                            )}
                            Approve
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}