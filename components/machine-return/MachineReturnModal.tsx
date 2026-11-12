"use client";

import type { MachineReturnApprovalFinanceRequest } from "@/lib/types";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

/* ----------------------------- Types ----------------------------- */

export interface MachineReturnDetails {
  customerName: string;
  agreementCode?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  startMeterReading?: string;
  department?: string;
  address: string;
  contactPerson: string;
  model: string;
  serialNo: string;
  invoiceNo?: string;
  location: string;
  meterReading: string | number;
  handoverDate: string;
  noOfMachines: string;
  reasonForReturn: string;
}

type ApprovalStatus = "APPROVED" | "REJECTED";

interface MachineReturnModalProps {
  open: boolean;
  onClose: () => void;

  machineReturnID: string;
  approverID: string;
  companyId: string;

  details?: MachineReturnDetails;
  returnNo: string;

  onApprove: (data: MachineReturnApprovalFinanceRequest) => void | Promise<void>;
  onReject: (data: MachineReturnApprovalFinanceRequest) => void | Promise<void>;
}

interface FormState {
  farValue: string;
  assetCost: string;
  bookValue: string;
  writtenDownCost: string;
  debtorsAmount: string;
  debtorsDateTime: string;
  comment: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;
type MoneyKey = "farValue" | "assetCost" | "bookValue" | "writtenDownCost" | "debtorsAmount";

/* Money fields: one list drives both the inputs and the validation */
const MONEY_FIELDS: { key: MoneyKey; label: string; error: string }[] = [
  { key: "farValue", label: "FAR Value", error: "Enter a valid FAR value." },
  { key: "assetCost", label: "Asset Cost", error: "Enter the asset cost." },
  { key: "bookValue", label: "Book Value", error: "Enter the book value." },
  { key: "writtenDownCost", label: "Written Down Cost", error: "Enter the written down cost." },
  { key: "debtorsAmount", label: "Debtors Amount", error: "Enter the debtors amount." },
];

/* --------------------------- Helpers ----------------------------- */

/* Current local date and time in the format a datetime-local input expects */
const nowLocalInput = (): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const makeEmptyForm = (): FormState => ({
  farValue: "",
  assetCost: "",
  bookValue: "",
  writtenDownCost: "",
  debtorsAmount: "",
  debtorsDateTime: nowLocalInput(),
  comment: "",
});

const isValidAmount = (value: string): boolean =>
  value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;

/* Fallback only: the companyId prop is used first */
const getStoredCompanyId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("companyID") ?? sessionStorage.getItem("companyID");
};

/* --------------------------- Component --------------------------- */

const MachineReturnModal = ({
  open,
  onClose,
  machineReturnID,
  approverID,
  companyId,
  details,
  returnNo,
  onApprove,
  onReject,
}: MachineReturnModalProps) => {
  const [form, setForm] = useState<FormState>(makeEmptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [busyStatus, setBusyStatus] = useState<ApprovalStatus | null>(null);
  const [submitError, setSubmitError] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const busy = busyStatus !== null;

  // Reset and focus every time the modal opens
  useEffect(() => {
    if (!open) return;
    setForm(makeEmptyForm());
    setErrors({});
    setSubmitError("");
    setBusyStatus(null);
    const t = setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => clearTimeout(t);
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

  // All hooks are above this line, so returning early is safe
  if (!open) return null;

  const set =
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
    };

  const validate = (): boolean => {
    const er: FormErrors = {};

    for (const { key, error } of MONEY_FIELDS) {
      if (!isValidAmount(form[key])) er[key] = error;
    }
    if (!form.debtorsDateTime) {
      er.debtorsDateTime = "Enter the debtors date and time.";
    }

    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const buildPayload = (
    status: ApprovalStatus,
    resolvedCompanyId: string
  ): MachineReturnApprovalFinanceRequest => ({
    companyId: resolvedCompanyId,

    farValue: Number(form.farValue) || 0,
    assetCost: Number(form.assetCost) || 0,
    bookValue: Number(form.bookValue) || 0,
    writtenDownCost: Number(form.writtenDownCost) || 0,
    debtorsAmount: Number(form.debtorsAmount) || 0,

    debtorsDateTime: form.debtorsDateTime,

    approverDetails: {
      machineReturnID,
      approverID,
      status,
      comment: form.comment.trim(),
    },
  });

  const run = async (
    handler: (data: MachineReturnApprovalFinanceRequest) => void | Promise<void>,
    status: ApprovalStatus,
    needsValidation: boolean
  ) => {
    if (busy) return;
    setSubmitError("");

    if (needsValidation && !validate()) return;

    const resolvedCompanyId = companyId || getStoredCompanyId();
    if (!resolvedCompanyId) {
      setSubmitError("Company ID not found. Please sign in again.");
      return;
    }

    setBusyStatus(status);
    try {
      await handler(buildPayload(status, resolvedCompanyId));
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setBusyStatus(null);
    }
  };

  const inputClass = (error?: string) =>
    `w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition
     focus:ring-2 ${
       error
         ? "border-red-400 focus:ring-red-200"
         : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
     }`;

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
        aria-labelledby="return-approval-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-xl bg-white shadow-xl"
      >
        <div className="border-b border-slate-200 px-6 py-4">
          <h2
            id="return-approval-title"
            className="text-lg font-semibold text-slate-900"
          >
            Machine return approval
          </h2>
          {returnNo && (
            <p className="mt-0.5 text-sm text-slate-500">Return {returnNo}</p>
          )}
        </div>

        <div className="space-y-6 overflow-y-auto px-6 py-5">
          {details && (
            <section aria-labelledby="section-a-title">
              <h3
                id="section-a-title"
                className="mb-3 text-sm font-semibold text-slate-900"
              >
                Section A – Customer &amp; machine details
              </h3>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                <Detail label="Customer name" value={details.customerName} wide />
                <Detail label="Agreement code" value={details.agreementCode} />
                <Detail label="Address" value={details.address} wide />
                <Detail label="Contact person" value={details.contactPerson} />
                <Detail label="Model" value={details.model} />
                <Detail label="Serial no" value={details.serialNo} />
                <Detail label="Last Invoice no" value={details.invoiceNo} />
                <Detail label="Location" value={details.location} />
                <Detail label="No. of Machines" value={details.noOfMachines} />
                <Detail label="Last Meter reading" value={details.meterReading} />
                <Detail label="Handover date" value={details.handoverDate} />
                <Detail label="Reason for return" value={details.reasonForReturn} wide />
              </dl>
            </section>
          )}

          <div className="space-y-4">
            {MONEY_FIELDS.map(({ key, label }, index) => (
              <Field key={key} label={label} error={errors[key]} htmlFor={key}>
                <MoneyInput
                  id={key}
                  inputRef={index === 0 ? firstFieldRef : undefined}
                  value={form[key]}
                  onChange={set(key)}
                  className={inputClass(errors[key])}
                />
              </Field>
            ))}

            <Field
              label="Debtors Date and Time"
              error={errors.debtorsDateTime}
              htmlFor="debtorsDateTime"
            >
              <input
                id="debtorsDateTime"
                type="datetime-local"
                value={form.debtorsDateTime}
                onChange={set("debtorsDateTime")}
                className={inputClass(errors.debtorsDateTime)}
              />
            </Field>

            <Field label="Finance Comment" htmlFor="comment">
              <input
                id="comment"
                type="text"
                value={form.comment}
                onChange={set("comment")}
                placeholder="Enter your approval comments..."
                className={inputClass()}
              />
            </Field>
          </div>

          {submitError && (
            <p role="alert" className="text-sm text-red-600">
              {submitError}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 rounded-b-xl border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => run(onReject, "REJECTED", false)}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
          >
            {busyStatus === "REJECTED" ? "Processing..." : "Reject"}
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => run(onApprove, "APPROVED", true)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {busyStatus === "APPROVED" ? "Processing..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MachineReturnModal;

/* ------------------------ Small components ------------------------ */

interface DetailProps {
  label: string;
  value?: string | number;
  wide?: boolean; // span both columns
}

function Detail({ label, value, wide }: DetailProps) {
  const text =
    value === undefined || value === null || String(value).trim() === ""
      ? "-"
      : String(value);

  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-slate-900">
        {text}
      </dd>
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

type MoneyInputProps = InputHTMLAttributes<HTMLInputElement> & {
  inputRef?: Ref<HTMLInputElement>;
};

function MoneyInput({ className, inputRef, ...props }: MoneyInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">
        Rs.
      </span>
      <input
        ref={inputRef}
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        placeholder="0.00"
        {...props}
        className={`${className ?? ""} pl-10`}
      />
    </div>
  );
}