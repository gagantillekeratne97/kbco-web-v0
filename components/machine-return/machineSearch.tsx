
"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { suggestMachines } from "@/lib/apis";

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
  onEnter,
}: machineSearchProps) {
  const [results, setResults] = useState<machineSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!value.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
        debugger;
      try {
        setLoading(true);
        console.log(value);
        const data = await suggestMachines(
          value.trim(),
          controller.signal
        );

        console.log("Suggestions received:", data);

        setResults(Array.isArray(data) ? data : []);
        setShowResults(true);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setResults([]);
          setShowResults(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setShowResults(false);
              onEnter();
            }

            if (e.key === "Escape") {
              setShowResults(false);
            }
          }}
          placeholder="Search machine P Number or Serial Number"
          autoComplete="off"
          className="w-full h-10 pl-9 pr-10 text-sm border rounded-md outline-none bg-background focus:ring-2 focus:ring-ring"
        />

        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
        )}
      </div>

      {showResults && value.trim() !== "" && (
        <div className="absolute left-0 top-full z-[100] mt-1 w-full max-h-72 overflow-y-auto rounded-md border bg-white shadow-xl">

          {results.length > 0 ? (
            results.map((machine, index) => (
              <button
                key={`${machine.serialNumber}-${index}`}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(machine.pnumber);
                  setShowResults(false);
                  onSelect(machine);
                }}
                className="flex w-full flex-col items-start gap-1 border-b px-4 py-3 text-left hover:bg-slate-100 last:border-0"
              >
                <span className="font-semibold text-sm text-slate-900">
                  {machine.pnumber}
                </span>

                <span className="text-xs text-slate-500">
                  Serial Number: {machine.serialNumber}
                </span>

                <span className="text-xs text-slate-500">
                  Customer: {machine.customerName}
                </span>
              </button>
            ))
          ) : !loading ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No matching machines found.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
