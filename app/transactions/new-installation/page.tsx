import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function NewInstallationPage() { 
    return (
        <main className="flex min-h-screen bg-surface font-display">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar title="New Installation"/> 
                <div className="m-5 space-y-6">

            {/* Search Form */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                    <h2>Search Machine</h2>
                </div>
            </div>    
        </div>
            </div>            
        </main>
    ); 
}