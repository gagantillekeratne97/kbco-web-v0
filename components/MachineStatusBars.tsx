import { PackagePlus, PackageMinus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MachineStatusSummary } from "@/lib/types";



export default function MachineStatusBars({ data }: { data: MachineStatusSummary }) {

  const rows = [
  {
    key: "newlyInstalled",
    label: "New installed machines",
    icon: PackagePlus,
    barColor: "bg-orange",
    data: data.newlyInstalled,
  },
  {
    key: "returns",
    label: "Machine returns",
    icon: PackageMinus,
    barColor: "bg-navy",
    data: data.returns,
  },
  {
    key: "disposed",
    label: "Disposed machines",
    icon: Trash2,
    barColor: "bg-danger",
    data: data.disposed,
  },
] as const;

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card h-full">
      <h2 className="text-base font-semibold text-navy-text">Machine status</h2>
      <p className="text-xs text-muted mt-0.5 mb-5">This month</p>

      <div className="space-y-5">
        {rows.map(({ key, label, icon: Icon, barColor, data }) => {
          const pct = Math.round((data.count / data.total) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-surface flex items-center justify-center">
                    <Icon size={14} className="text-navy-text" />
                  </div>
                  <span className="text-sm text-ink">{label}</span>
                </div>
                <span className="text-sm font-semibold text-navy-text">
                  {data.count}
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className={cn("h-full rounded-full", barColor)}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
