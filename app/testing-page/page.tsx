import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MachineSearch from "@/components/machine-return/machineSearch";

export default function testingPage() {
  return (
    <div className="flex min-h-screen bg-surface font-display">
      <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col"> 
            <Topbar title="Testing page"/>
          <main className="flex-1 p-4 md:p-6">                                    
            {/* <MachineSearch /> */}
          </main>
        </div>
    </div>
  );
}