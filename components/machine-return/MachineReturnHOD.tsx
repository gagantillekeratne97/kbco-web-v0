"use client";

import { useEffect, useRef, useState } from "react";

export interface MachineReturnsHodDetails {
  customerName: string;
  agreementCode?: string;
  invoiceDate?: string;
  department?: string;
  address: string;
  contactPerson: string;
  model: string;
  serialNo: string;
  invoiceNo?: string;
  location: string;
  meterReading: string | number;
  handoverDate: string;
  reasonForReturn: string;
}

export interface hodApprovalData {
  machineReturnID: string; 
  approverID: string;   
  comment: string;   
}

interface FormState {
  hodComment: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const makeEmptyForm = (): FormState => ({
  hodComment: "",
});

interface MachineReturnHODProps {
  open: boolean;
  details?: MachineReturnsHodDetails;
  onClose: () => void;
  onApprove: (data: hodApprovalData) => void | Promise<void>;
  onReject: (data: hodApprovalData) => void | Promise<void>;
  returnNo?: string;
}

/* Read-only field used in the details grid */
function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 break-words text-sm text-slate-900">
        {value !== undefined && value !== "" ? value : "—"}
      </dd>
    </div>
  );
}

export default function MachineReturnHOD({
  open,
  details,
  onClose,
  onApprove,
  onReject,
  returnNo,
}: MachineReturnHODProps) {
  const [form, setForm] = useState<FormState>(makeEmptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // Reset and focus every time the modal opens
  useEffect(() => {
    if (open) {
      setForm(makeEmptyForm());
      setErrors({});
      setBusy(false);
      setTimeout(() => commentRef.current?.focus(), 0);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  const getUserCode = (): string => { 
    const userCode = localStorage.getItem("userCode") || sessionStorage.getItem("userCode");
    
    if (!userCode) {
      throw new Error("User code not found.");
    }

    return userCode;
  };

  const submit = async (decision: "approve" | "reject") => {
    const comment = form.hodComment.trim();

    // A comment is required when rejecting
    if (decision === "reject" && !comment) {
      setErrors({ hodComment: "Please enter a comment when rejecting." });
      commentRef.current?.focus();
      return;
    }

    setErrors({});
    setBusy(true);

    try {      
      const userCode = getUserCode(); 
      const payload: hodApprovalData = {
        machineReturnID: returnNo ?? "",        
        comment: comment,
        approverID: userCode
      };

      if (decision === "approve") {
        await onApprove(payload);
      } else {
        await onReject(payload);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hod-approval-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl"
      >
        {/* HEADER */}
        <div className="border-b border-slate-200 px-6 py-4">
          <h2
            id="hod-approval-title"
            className="text-lg font-semibold text-slate-900"
          >
            HOD approval
          </h2>
          {returnNo && (
            <p className="mt-0.5 text-sm text-slate-500">Return {returnNo}</p>
          )}
        </div>

        {/* BODY */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-4">
          {details && (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Customer" value={details.customerName} />
              <Field label="Agreement code" value={details.agreementCode} />
              <Field label="Contact person" value={details.contactPerson} />
              <Field label="Location" value={details.location} />
              <Field label="Model" value={details.model} />
              <Field label="Serial no" value={details.serialNo} />
              <Field label="Invoice no" value={details.invoiceNo} />
              <Field label="Meter reading" value={details.meterReading} />
              <Field label="Handover date" value={details.handoverDate} />
              <Field label="Department" value={details.department} />
              <div className="sm:col-span-2">
                <Field label="Address" value={details.address} />
              </div>
              <div className="sm:col-span-2">
                <Field label="Reason for return" value={details.reasonForReturn} />
              </div>
            </dl>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="hodComment"
              className="text-sm font-medium text-slate-700"
            >
              HOD comment
            </label>
            <textarea
              id="hodComment"
              ref={commentRef}
              rows={4}
              value={form.hodComment}
              disabled={busy}
              onChange={(e) => {
                setForm({ hodComment: e.target.value });
                if (errors.hodComment) setErrors({});
              }}
              placeholder="Add your comment (required when rejecting)"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                errors.hodComment
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
              }`}
            />
            {errors.hodComment && (
              <p className="text-xs text-red-600">{errors.hodComment}</p>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => submit("reject")}
            disabled={busy}
            className="inline-flex h-10 items-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => submit("approve")}
            disabled={busy}
            className="inline-flex h-10 items-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Saving..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}