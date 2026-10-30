"use client";
import MachineReturnWorkflow from "@/components/MachineReturnWorkflow";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { searchMachine, submitMachineReturns } from "@/lib/apis";
import { useEffect, useState } from "react";

export default function MachineReturnPage() {    
    const [companyId, setCompanyId] = useState<string | null>(null);

    const getCompanyId = (): string => { 
    const companyId = localStorage.getItem("companyID") || sessionStorage.getItem("companyID");
    
    if (!companyId) {
      throw new Error("Company ID not found.");
    }

    return companyId;
    };
  
    useEffect(() => { 
        var companyId = getCompanyId();
        setCompanyId(companyId);        
    });    

    return (
        <div className="flex min-h-screen bg-surface font-display">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar title="Machine Return" />

                <main className="flex-1 p-4 md:p-6">                                          
                      <MachineReturnWorkflow
                          onSearch={async (q) => { 
                            if (!companyId) { 
                                throw new Error("No company Selected.");
                            }
                            return searchMachine({q, companyId});
                          }}
                           onSubmit={async (request) => {
                               await submitMachineReturns(request);
                           }}
                      />                                        
                </main>
            </div>
        </div>
    );
}