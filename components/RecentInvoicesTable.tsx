import { MoreHorizontal } from "lucide-react";
import { RecentInvoices } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

const statusStyles: Record<RecentInvoices["status"], string> = {
  "Credit Note": "bg-danger-soft text-danger",
  "Cancelled Invoice": "bg-orange-soft text-orange",
  "Receipted": "bg-surface-soft text-muted",
  "Invoice Processed": "bg-success-soft text-success",
};

export default function RecentInvoicesTable({ invoices }: { invoices: RecentInvoices[] }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-navy-text">
            Recent invoices
          </h2>
          <p className="text-xs text-muted mt-0.5">Latest 6 transactions</p>
        </div>
        <button className="text-sm font-medium text-orange hover:text-orange-hover transition-colors">
          View all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-700 border-b border-border">
              <th className="px-5 py-3 font-medium">Invoice #</th>
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>  
          <tbody>
            {invoices.map((inv) => (
              <tr
                key={inv.invAutoNum}
                className="border-b border-border last:border-0 hover:bg-surface/60 transition-colors"
              >
                <td className="px-5 py-3.5 font-medium text-navy-text">
                  {inv.invoiceNo}
                </td>
                <td className="px-5 py-3.5 text-ink">{inv.client}</td>
                <td className="px-5 py-3.5 text-gray-700">
                  {new Date(inv.invoiceDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-3.5 text-ink">
                  {formatCurrency(inv.totalInvoiceAmount)}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={cn(
                      "inline-flex px-2.5 py-1 rounded-full text-xs font-medium",
                      statusStyles[inv.status]
                    )}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button className="text-gray-700 hover:text-navy-text transition-colors">
                    <MoreHorizontal size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
