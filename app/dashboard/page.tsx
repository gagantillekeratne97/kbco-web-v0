import { FileText, Receipt, Cpu, FilePlus2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import KpiCard from "@/components/KpiCard";
import RevenueChart from "@/components/RevenueChart";
import MachineStatusBars from "@/components/MachineStatusBars";
import RecentInvoicesTable from "@/components/RecentInvoicesTable";
import { formatCurrency } from "@/lib/utils";
import { getKpiSummery, getRecentInvoices, getMachineStatus, getRevenueTrend} from "@/lib/apis";

export default async function DashboardPage() {      
  const kpis = await getKpiSummery();
  const recentInvoices = await getRecentInvoices();
  const machineStatus = await getMachineStatus();  
  const revenueTrend = await getRevenueTrend(); 

  return (
    <div className="flex min-h-screen bg-surface font-display">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar/>

        <main className="flex-1 p-4 sm:p-6 space-y-6">
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
              value={kpis.activeMachines.value.toString()}
              deltaPct={kpis.activeMachines.percentage}
              icon={Cpu}
            />
          </section>

          {/* 2 & 3(bars). Revenue chart + machine status */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <RevenueChart data={revenueTrend}/>
            </div>
            <div>
              <MachineStatusBars data={machineStatus} />
            </div>
          </section>

          {/* 3. Recent invoices table */}
          <section>
            <RecentInvoicesTable invoices={recentInvoices} />
          </section>
        </main>
      </div>
    </div>
  );
}
