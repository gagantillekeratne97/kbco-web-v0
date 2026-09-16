"use client";

import { useEffect, useState } from "react";
import { FileText, Receipt, Cpu, FilePlus2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import KpiCard from "@/components/KpiCard";
import RevenueChart from "@/components/RevenueChart";
import MachineStatusBars from "@/components/MachineStatusBars";
import RecentInvoicesTable from "@/components/RecentInvoicesTable";
import { formatCurrency } from "@/lib/utils";
import {
  getKpiSummery,
  getRecentInvoices,
  getMachineStatus,
  getRevenueTrend,
} from "@/lib/apis";
import type {
  kpiSummery,
  RecentInvoices,
  MachineStatusSummary,
  RevenueTrendPoint,
} from "@/lib/types";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<kpiSummery | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoices[]>([]);
  const [machineStatus, setMachineStatus] = useState<MachineStatusSummary | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [kpiData, invoicesData, statusData, trendData] = await Promise.all([
          getKpiSummery(),
          getRecentInvoices(),
          getMachineStatus(),
          getRevenueTrend(),
        ]);

        setKpis(kpiData);
        setRecentInvoices(invoicesData);
        setMachineStatus(statusData);
        setRevenueTrend(trendData);

      } catch (err) {
        console.error(err);
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard data.";
        setError(message);

      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="flex min-h-screen bg-surface font-display">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 p-4 sm:p-6 space-y-6">

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading || !kpis || !machineStatus ? (
            <div className="p-6 text-sm text-slate-500">Loading dashboard...</div>
          ) : (
            <>
              {/* 1. KPI cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <KpiCard
                  label="Invoice revenue"
                  value={formatCurrency(kpis.invoiceRevenue.value)}
                  deltaPct={kpis.invoiceRevenue.percentage}
                  icon={FileText}
                />
                <KpiCard
                  label="Invoice List (Count)"
                  value={kpis.invoicesList.value.toString()}
                  deltaPct={kpis.invoicesList.percentage}
                  icon={FileText}
                />
                <KpiCard
                  label="Credit notes (Count)"
                  value={kpis.creditNotes.value.toString()}
                  deltaPct={kpis.creditNotes.percentage}
                  icon={Receipt}
                />
                <KpiCard
                  label="Credit Notes (Sum)"
                  value={formatCurrency(kpis.activeMachines.value)}
                  deltaPct={kpis.activeMachines.percentage}
                  icon={Cpu}
                />
              </section>

              {/* 2 & 3(bars). Revenue chart + machine status */}
              <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                  <RevenueChart data={revenueTrend} />
                </div>
                <div>
                  <MachineStatusBars data={machineStatus} />
                </div>
              </section>

              {/* 3. Recent invoices table */}
              <section>
                <RecentInvoicesTable invoices={recentInvoices} />
              </section>
            </>
          )}

        </main>
      </div>
    </div>
  );
}