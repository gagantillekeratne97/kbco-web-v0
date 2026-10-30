"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { searchCustomers } from "@/lib/apis";

export interface CustomerSearchResult {
    customerCode: string;
    customerName: string;
}

interface CustomerSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (customer: CustomerSearchResult) => void;
}

export default function ColorCustomerSearch({ value, onChange, onSelect }: CustomerSearchProps) {
    const [results, setResults] = useState<CustomerSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const justSelected = useRef(false);

    useEffect(() => {
        // the text changed because a row was picked, so skip the search
        if (justSelected.current) {
            justSelected.current = false;
            return;
        }

        if (value.trim().length < 1) {
            setResults([]);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const response = await searchCustomers(value);
                setResults(response.data || []);
                setShowResults(true);
            } catch (error) {
                console.error("Customer search failed:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [value]);

    const handleSelect = (customer: CustomerSearchResult) => {
        justSelected.current = true;
        onChange(customer.customerName);
        onSelect(customer);
        setShowResults(false);
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => {
                        if (results.length > 0) setShowResults(true);
                    }}
                    placeholder="Search customer code or name..."
                    autoComplete="off"
                    className="h-10 w-full rounded-md border bg-background pl-9 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
                />

                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-lg">
                    {results.map((customer) => (
                        <button
                            key={customer.customerCode}
                            type="button"
                            onClick={() => handleSelect(customer)}
                            className="flex w-full flex-col items-start px-4 py-3 text-left transition-colors hover:bg-accent"
                        >
                            <span className="font-medium">{customer.customerName}</span>
                            <span className="text-xs text-muted-foreground">{customer.customerCode}</span>
                        </button>
                    ))}
                </div>
            )}

            {showResults && !loading && value.trim().length >= 3 && results.length === 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground shadow-lg">
                    No customers found.
                </div>
            )}
        </div>
    );
}