"use client";
import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { searchInvoices } from "@/lib/apis";

export interface machineSearchResult { 
    serialNumber: string; 
    pnumber: string;
    customerName: string;
}

interface machineSearchProps { 
    value: string; 
    onChange: (value: string) => void; 
    onSelect: (machine: machineSearchResult) => void;
    onEnter: () => void;
}

export default function MachineSearch({
    value, 
    onChange, 
    onSelect, 
    onEnter
}: machineSearchProps) {
    const [results, setResults] = useState<machineSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResult, setShowResult] = useState(false);

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"/>                

                <input 
                type="text" 
                placeholder="Search machine Serial No Or P Number"
                className="w-full h-10 pr-10 text-sm border rounded-md outline-none bg-background pl-9 focus:ring-2 focus:ring-ring"/>

                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </span>
            </div>

            <div className="absolute z-50 w-full mt-1 overflow-y-auto overscroll-contain border rounded-md shadow-lg max-h-72 bg-popover scrollbar-thin">
                <button className="flex flex-col items-start w-full px-4 py-3 text-left transition-colors hover:bg-accent">
                    <span className="font-medium">
                        E998239M32
                    </span>                    
                    <span className="text-xs text-muted-foreground">
                        P Number: P0289
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Customer: Gagan Tillekeratne
                    </span>
                </button>
            </div>
       </div>
    );
}