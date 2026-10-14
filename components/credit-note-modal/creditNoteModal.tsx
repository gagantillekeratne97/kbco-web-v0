"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { creditNoteInfo } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { getCreditNoteInformation } from "@/lib/apis";
import { toast } from "sonner";
import { Check, FileText, Loader2, X } from "lucide-react";

type CreditNoteModalProps = {
    isOpen: boolean;
    onClose: () => void;
    invoiceNumber: string;
    /** Called when the reviewer approves, with an optional comment. Throw/reject to keep the modal open. */
    onApprove?: (invoiceNumber: string, comment: string) => Promise<void> | void;
    /** Called when the reviewer rejects, with the reason they typed. */
    onReject?: (invoiceNumber: string, reason: string) => Promise<void> | void;
};

const formatNumber = (value: unknown) => {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString() : "-";
};

export default function CreditNoteModal({
    isOpen,
    onClose,
    invoiceNumber,
    onApprove,
    onReject,
}: CreditNoteModalProps) {
    const [invoiceInfo, setInvoiceInfo] = useState<creditNoteInfo>();
    const [isLoading, setIsLoading] = useState(false);
    // request currently in flight
    const [action, setAction] = useState<"approve" | "reject" | null>(null);
    // which comment panel is open (null = just viewing)
    const [mode, setMode] = useState<"approve" | "reject" | null>(null);
    // one comment box shared by both modes; cleared when the mode changes
    const [comment, setComment] = useState("");

    const isBusy = action !== null;

    useEffect(() => {
        if (!isOpen) return;

        // reset review state every time the modal opens
        setMode(null);
        setComment("");
        setAction(null);

        const loadInformation = async () => {
            setIsLoading(true);
            try {
                const result = await getCreditNoteInformation(invoiceNumber);
                setInvoiceInfo(result.data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load credit note information.");
            } finally {
                setIsLoading(false);
            }
        };

        loadInformation();
    }, [isOpen, invoiceNumber]);

    const items = invoiceInfo?.invoiceItems ?? [];

    // customer is the same on every row of a credit note, so read it from the first
    const customer = useMemo(() => {
        const first = items[0];
        if (!first) return null;
        return { code: first.custCode, name: first.invAdd1 };
    }, [items]);

    const openMode = (next: "approve" | "reject") => {
        setMode(next);
        setComment("");
    };

    const closeMode = () => {
        setMode(null);
        setComment("");
    };

    const handleConfirmApprove = async () => {
        if (!onApprove) return;
        setAction("approve");
        try {
            // the approval comment is optional
            await onApprove(invoiceNumber, comment.trim());
            toast.success(`Credit note ${invoiceNumber} approved.`);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Could not approve the credit note. Try again.");
        } finally {
            setAction(null);
        }
    };

    const handleConfirmReject = async () => {
        if (!onReject) return;
        if (!comment.trim()) {
            toast.error("Enter a reason before rejecting.");
            return;
        }
        setAction("reject");
        try {
            await onReject(invoiceNumber, comment.trim());
            toast.success(`Credit note ${invoiceNumber} rejected.`);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Could not reject the credit note. Try again.");
        } finally {
            setAction(null);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && !isBusy) onClose();
            }}
        >
            <DialogContent className="flex max-h-[90vh] w-[95vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
                {/* Header */}
                <DialogHeader className="border-b border-slate-200 bg-white px-6 py-5 text-left">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold text-slate-900">
                                Credit note review
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500">
                                Check the items below, then approve or reject this credit note.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-6 py-5">
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading credit note…</span>
                        </div>
                    ) : (
                        <div className="min-w-0 space-y-5">
                            {/* Summary */}
                            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
                                <SummaryCell
                                    label="Credit note no."
                                    value={invoiceInfo?.invoiceNumber ?? invoiceNumber}
                                    mono
                                />
                                <SummaryCell
                                    label="Reference invoice"
                                    value={invoiceInfo?.invoiceReference}
                                    mono
                                />
                                <SummaryCell
                                    label="Customer"
                                    value={
                                        customer
                                            ? `${customer.name ?? "-"} (${customer.code ?? "-"})`
                                            : undefined
                                    }
                                />
                                <SummaryCell label="Items" value={String(items.length)} />
                            </dl>

                            {/* Items table */}
                            <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                                    <h3 className="text-sm font-semibold text-slate-900">
                                        Credit note items
                                    </h3>
                                    <span className="text-xs text-slate-500">
                                        {items.length} {items.length === 1 ? "item" : "items"}
                                    </span>
                                </div>

                                <div className="max-h-[380px] max-w-full overflow-auto">
                                    <table className="w-full min-w-[960px] text-sm">
                                        <thead className="sticky top-0 z-10 bg-slate-100 text-xs font-medium text-slate-600">
                                            <tr>
                                                <Th>Customer code</Th>
                                                <Th className="min-w-48">Customer name</Th>
                                                <Th className="min-w-48">Machine location</Th>
                                                <Th>Serial number</Th>
                                                <Th>Machine model</Th>
                                                <Th align="right">Start MR</Th>
                                                <Th align="right">End MR</Th>
                                                <Th align="right">Invoice copies</Th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {items.length ? (
                                                items.map((item, index) => (
                                                    <tr
                                                        key={`${item.invoiceNumber}-${index}`}
                                                        className="hover:bg-slate-50"
                                                    >
                                                        <Td nowrap>{item.custCode}</Td>
                                                        <Td>{item.invAdd1}</Td>
                                                        <Td>{item.mLoc}</Td>
                                                        <Td nowrap mono>
                                                            {item.serialNumber}
                                                        </Td>
                                                        <Td nowrap strong>
                                                            {item.machineModel}
                                                        </Td>
                                                        <Td nowrap align="right" num>
                                                            {formatNumber(item.startMr)}
                                                        </Td>
                                                        <Td nowrap align="right" num>
                                                            {formatNumber(item.endMr)}
                                                        </Td>
                                                        <Td nowrap align="right" num>
                                                            {/* rename to match your creditNoteInfo item type */}
                                                            {formatNumber((item as any).invoiceCopies)}
                                                        </Td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={8}
                                                        className="px-4 py-12 text-center text-sm text-slate-500"
                                                    >
                                                        No items found for this credit note.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Rejection reason */}
                            {mode && (
                                <section
                                    className={`rounded-lg border p-4 ${
                                        mode === "reject"
                                            ? "border-red-200 bg-red-50/60"
                                            : "border-emerald-200 bg-emerald-50/60"
                                    }`}
                                >
                                    <label
                                        htmlFor="review-comment"
                                        className={`text-sm font-medium ${
                                            mode === "reject" ? "text-red-900" : "text-emerald-900"
                                        }`}
                                    >
                                        {mode === "reject"
                                            ? "Reason for rejection"
                                            : "Approval comment (optional)"}
                                    </label>
                                    <p
                                        className={`mt-0.5 text-xs ${
                                            mode === "reject" ? "text-red-800/80" : "text-emerald-800/80"
                                        }`}
                                    >
                                        This is saved with the credit note.
                                    </p>
                                    <textarea
                                        id="review-comment"
                                        autoFocus
                                        rows={3}
                                        maxLength={500}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        disabled={isBusy}
                                        placeholder={
                                            mode === "reject"
                                                ? "For example: wrong meter readings on the second item."
                                                : "For example: verified against the meter reading sheet."
                                        }
                                        className={`mt-3 w-full resize-none rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                                            mode === "reject"
                                                ? "border-red-200 focus:border-red-400 focus:ring-red-200"
                                                : "border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200"
                                        }`}
                                    />
                                    <p className="mt-1 text-right text-xs text-slate-500">
                                        {comment.length}/500
                                    </p>
                                </section>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                    {mode === "reject" ? (
                        <>
                            <Button variant="ghost" onClick={closeMode} disabled={isBusy}>
                                Back
                            </Button>
                            <Button
                                onClick={handleConfirmReject}
                                disabled={isBusy || !comment.trim()}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                {action === "reject" ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="mr-2 h-4 w-4" />
                                )}
                                Reject credit note
                            </Button>
                        </>
                    ) : mode === "approve" ? (
                        <>
                            <Button variant="ghost" onClick={closeMode} disabled={isBusy}>
                                Back
                            </Button>
                            <Button
                                onClick={handleConfirmApprove}
                                disabled={isBusy}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                {action === "approve" ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="mr-2 h-4 w-4" />
                                )}
                                Approve credit note
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={onClose} disabled={isBusy}>
                                Close
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => openMode("reject")}
                                disabled={isBusy || isLoading || !items.length}
                                className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                            <Button
                                onClick={() => openMode("approve")}
                                disabled={isBusy || isLoading || !items.length}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ---------- small presentational helpers ---------- */

function SummaryCell({
    label,
    value,
    mono,
}: {
    label: string;
    value?: string;
    mono?: boolean;
}) {
    return (
        <div className="min-w-0 bg-white px-4 py-3">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd
                className={`mt-1 truncate text-sm font-medium text-slate-900 ${
                    mono ? "font-mono" : ""
                }`}
                title={value}
            >
                {value || "-"}
            </dd>
        </div>
    );
}

function Th({
    children,
    align = "left",
    className = "",
}: {
    children: React.ReactNode;
    align?: "left" | "right";
    className?: string;
}) {
    return (
        <th
            className={`whitespace-nowrap px-4 py-2.5 ${
                align === "right" ? "text-right" : "text-left"
            } ${className}`}
        >
            {children}
        </th>
    );
}

function Td({
    children,
    align = "left",
    nowrap,
    mono,
    strong,
    num,
}: {
    children: React.ReactNode;
    align?: "left" | "right";
    nowrap?: boolean;
    mono?: boolean;
    strong?: boolean;
    num?: boolean;
}) {
    return (
        <td
            className={[
                "px-4 py-3 text-slate-700",
                align === "right" ? "text-right" : "text-left",
                nowrap ? "whitespace-nowrap" : "",
                mono ? "font-mono text-[13px]" : "",
                strong ? "font-medium text-slate-900" : "",
                num ? "tabular-nums" : "",
            ].join(" ")}
        >
            {children}
        </td>
    );
}