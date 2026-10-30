"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { searchInvoices } from "@/lib/apis";

export interface InvoiceSearchResult {
    invoiceNo: string;
    customerCode: string;
    totalAmount: number;
}

interface InvoiceSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (invoice: InvoiceSearchResult) => void;
    onEnter: () => void;
}

export default function InvoiceSearch({
    value,
    onChange,
    onSelect,
    onEnter
}: InvoiceSearchProps) {
    const [results, setResults] = useState<InvoiceSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);    

    useEffect(() => {
        if (value.trim().length < 3) {
            setResults([]);
            setShowResults(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);                
                const response = await searchInvoices(value);

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

    const handleSelect = (invoice: InvoiceSearchResult) => {
        onChange(invoice.invoiceNo);
        onSelect(invoice);
        setShowResults(false);
    };

    return (
        <div className="relative w-full">
            {/* Search input */}
            <div className="relative">
                <Search
                    className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground"
                />

                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => {
                        if (results.length > 0) {
                            setShowResults(true);
                        }
                    }}
                    placeholder="Search invoice or last digits..."
                    className="w-full h-10 pr-10 text-sm border rounded-md outline-none bg-background pl-9 focus:ring-2 focus:ring-ring"
                />

                {loading && (
                    <Loader2
                        className="absolute w-4 h-4 -translate-y-1/2 right-3 top-1/2 animate-spin text-muted-foreground"
                    />
                )}
            </div>

            {/* Suggestions */}
            {showResults && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 overflow-y-auto overscroll-contain border rounded-md shadow-lg max-h-72 bg-popover scrollbar-thin">
                    {results.map((invoice) => (
                        <button
                            key={invoice.invoiceNo}
                            type="button"
                            onClick={() => handleSelect(invoice)}
                            className="flex flex-col items-start w-full px-4 py-3 text-left transition-colors hover:bg-accent"
                        >
                            <span className="font-medium">
                                {invoice.invoiceNo}
                            </span>

                            <span className="text-xs text-muted-foreground">
                                Customer: {invoice.customerCode}
                            </span>

                            <span className="text-xs text-muted-foreground">
                                LKR{" "}
                                {invoice.totalAmount.toLocaleString(
                                    "en-LK",
                                    {
                                        minimumFractionDigits: 2,
                                    }
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* No results */}
            {showResults &&
                !loading &&
                value.trim().length >= 3 &&
                results.length === 0 && (
                    <div
                        className="absolute z-50 w-full p-4 mt-1 text-sm text-center border rounded-md shadow-lg bg-popover text-muted-foreground"
                    >
                        No invoices found.
                    </div>
                )}
        </div>
    );
}