"use client"; 

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export interface ReturnApprovalData {
  far: string;
  assetCost: number;
  writtenDownCost: number;
  debtorsAmount: number;
  debtorsDateTime: string; // local time, format "yyyy-MM-ddTHH:mm"
}

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

interface MachineReturnModalProps {
  open: boolean;
  details?: MachineReturnDetails; // Section A, shown as read-only labels
  onClose: () => void;
  onApprove: (data: ReturnApprovalData) => void | Promise<void>;
  onReject: (data: ReturnApprovalData) => void | Promise<void>;
  returnNo?: string; // e.g. "001/RTN/12"
}

interface FormState {
  far: string;
  assetCost: string;
  writtenDownCost: string;
  debtorsAmount: string;
  debtorsDateTime: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

/* Current local date and time in the format a datetime-local input expects */
const nowLocalInput = (): string => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const makeEmptyForm = (): FormState => ({
  far: "",
  assetCost: "",
  writtenDownCost: "",
  debtorsAmount: "",
  debtorsDateTime: nowLocalInput(), // defaults to now, user can change it
});

export default function MachineReturnModal({
  open,
  details,
  onClose,
  onApprove,
  onReject,
  returnNo,
}: MachineReturnModalProps) {
  const [form, setForm] = useState<FormState>(makeEmptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);
  const farRef = useRef<HTMLInputElement>(null);

  // Reset and focus every time the modal opens
  useEffect(() => {
    if (open) {
      setForm(makeEmptyForm());
      setErrors({});
      setBusy(false);
      setTimeout(() => farRef.current?.focus(), 0);
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

  const set =
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
    };

  const validate = (): boolean => {
    const er: FormErrors = {};
    if (!form.far.trim()) er.far = "Enter the FAR value.";
    if (form.assetCost === "" || Number(form.assetCost) < 0)
      er.assetCost = "Enter the asset cost.";
    if (form.writtenDownCost === "" || Number(form.writtenDownCost) < 0)
      er.writtenDownCost = "Enter the written down cost.";
    if (form.debtorsAmount === "" || Number(form.debtorsAmount) < 0)
      er.debtorsAmount = "Enter the debtors amount.";
    if (!form.debtorsDateTime)
      er.debtorsDateTime = "Enter the debtors date and time.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const payload = (): ReturnApprovalData => ({
    far: form.far.trim(),
    assetCost: Number(form.assetCost),
    writtenDownCost: Number(form.writtenDownCost),
    debtorsAmount: Number(form.debtorsAmount),
    debtorsDateTime: form.debtorsDateTime,
  });

  const run = async (
    handler: (data: ReturnApprovalData) => void | Promise<void>,
    needsValidation: boolean
  ) => {
    if (needsValidation && !validate()) return;
    setBusy(true);
    try {
      await handler(payload());
    } finally {
      setBusy(false);
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
                <Detail
                  label="Reason for return"
                  value={details.reasonForReturn}
                  wide
                />
              </dl>
            </section>
          )}

          <div className="space-y-4">
            <Field label="FAR" error={errors.far} htmlFor="far">
              <input
                id="far"
                ref={farRef}
                type="text"
                value={form.far}
                onChange={set("far")}
                placeholder="Enter FAR value"
                className={inputClass(errors.far)}
              />
            </Field>

            {/* Asset cost + written down cost, side by side */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Asset cost"
                error={errors.assetCost}
                htmlFor="assetCost"
              >
                <MoneyInput
                  id="assetCost"
                  value={form.assetCost}
                  onChange={set("assetCost")}
                  className={inputClass(errors.assetCost)}
                />
              </Field>

              <Field
                label="Written down cost"
                error={errors.writtenDownCost}
                htmlFor="writtenDownCost"
              >
                <MoneyInput
                  id="writtenDownCost"
                  value={form.writtenDownCost}
                  onChange={set("writtenDownCost")}
                  className={inputClass(errors.writtenDownCost)}
                />
              </Field>
            </div>

            {/* Debtors amount + date and time, side by side */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Debtors amount"
                error={errors.debtorsAmount}
                htmlFor="debtorsAmount"
              >
                <MoneyInput
                  id="debtorsAmount"
                  value={form.debtorsAmount}
                  onChange={set("debtorsAmount")}
                  className={inputClass(errors.debtorsAmount)}
                />
              </Field>

              <Field
                label="Debtors date and time"
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
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 rounded-b-xl border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => run(onReject, false)}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(onApprove, true)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

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

function MoneyInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-500">
        Rs.
      </span>
      <input
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