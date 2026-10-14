"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import BWInvoiceWizard from "@/components/bw-invoice/BWInvoiceWizard";

export default function BWInvoicePage() {
    return (
        <div className="flex min-h-screen bg-surface font-display">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar title="B/W Invoice Process"/>
                <main className="flex-1 p-4 md:p-6">
                    <BWInvoiceWizard />
                </main>
            </div>            
        </div>
    );
}