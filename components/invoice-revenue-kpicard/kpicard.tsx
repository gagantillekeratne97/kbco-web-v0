import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string;
  deltaPct?: number;
  icon: LucideIcon;
};

export default function KpiCard({ label, value, deltaPct, icon: Icon }: KpiCardProps) {
  const isPositive = (deltaPct ?? 0) >= 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
          <Icon size={17} className="text-orange-400" />
        </div>
      </div>

      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>

      {deltaPct !== undefined && (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-xs font-medium",
            isPositive ? "text-emerald-400" : "text-red-400"
          )}
        >
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{Math.abs(deltaPct)}% vs last month</span>
        </div>
      )}
    </div>
  );
}