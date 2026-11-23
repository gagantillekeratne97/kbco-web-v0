"use client";

import { useEffect, useRef, useState } from "react";
import {searchMachines} from "@/lib/apis";
import { Search, Loader2, X, Cog } from "lucide-react";

const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

export interface CustomerSearchResult {
    customerCode: string;
    customerName: string;
    machinesCount: number;
}

interface CustomerSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (customer: CustomerSearchResult) => void;
    onEnter: () => void;
}

export default function TechCustomerSearch({
                                          value,
                                          onChange,
                                          onSelect,
                                          onEnter
                                      }: CustomerSearchProps) {
    const [results, setResults] = useState<CustomerSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
       const handleClicksOutside = (e: MouseEvent) => {
         if (containerRef.current && !containerRef.current.contains(e.target as Node))
         {
             setShowResults(false);
         }
       };

       document.addEventListener("mousedown", handleClicksOutside);
       return () => document.removeEventListener("mousedown", handleClicksOutside);
    }, []);

    useEffect(() => {
        if (value.trim().length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const response = await searchMachines(value);

                setResults(response.data || []);
                setShowResults(true);
            } catch (error) {
                console.error("Invoice search failed:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value]);

    const handleSelect = (customer: CustomerSearchResult) => {
        onChange(customer.customerCode);
        onSelect(customer);
        setShowResults(false);
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Search input */}
            <div className="relative">
                <Search className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none left-3 top-1/2 text-muted-foreground" />

                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => {
                        if (results.length > 0) {
                            setShowResults(true);
                        }
                    }}
                    placeholder="Search by customer name or code..."
                    className="w-full h-11 pr-10 text-sm transition-shadow border rounded-lg shadow-sm outline-none bg-background pl-9 placeholder:text-muted-foreground hover:border-foreground/30 focus:border-ring focus:ring-2 focus:ring-ring/30"
                />

                <div className="absolute -translate-y-1/2 right-3 top-1/2">
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                        value && (
                            <button
                                type="button"
                                aria-label="Clear search"
                                onClick={() => {
                                    onChange("");
                                    setShowResults(false);
                                }}
                                className="p-0.5 transition-colors rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Suggestions */}
            {showResults && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 overflow-hidden border shadow-xl rounded-xl bg-popover">
                    <div className="px-4 py-2 text-[11px] font-semibold tracking-wider uppercase border-b bg-muted/50 text-muted-foreground">
                        {results.length} {results.length === 1 ? "customer" : "customers"} found
                    </div>

                    <ul className="overflow-y-auto divide-y overscroll-contain max-h-72 scrollbar-thin">
                        {results.map((customer) => (
                            <li key={customer.customerCode}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(customer)}
                                    className="flex items-center w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
                                >
                                    {/* Avatar */}
                                    <div className="flex items-center justify-center rounded-full shrink-0 size-10 bg-primary/10 text-primary text-xs font-semibold">
                                        {getInitials(customer.customerName)}
                                    </div>

                                    {/* Name + code */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-foreground">
                                            {customer.customerName}
                                        </p>
                                        <p className="font-mono text-xs text-muted-foreground">
                                            {customer.customerCode}
                                        </p>
                                    </div>

                                    {/* Machines badge */}
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border rounded-full shrink-0 bg-muted text-muted-foreground">
                                <Cog className="w-3.5 h-3.5" />
                                        {customer.machinesCount}{" "}
                                        {customer.machinesCount === 1 ? "machine" : "machines"}
                            </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* No results */}
            {showResults &&
                !loading &&
                value.trim().length >= 2 &&
                results.length === 0 && (
                    <div className="absolute z-50 w-full px-4 py-8 mt-2 text-center border shadow-xl rounded-xl bg-popover">
                        <div className="flex items-center justify-center mx-auto mb-2 rounded-full size-10 bg-muted text-muted-foreground">
                            <Search className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No customers found</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Try a different name or customer code.
                        </p>
                    </div>
                )}
        </div>
    );
}