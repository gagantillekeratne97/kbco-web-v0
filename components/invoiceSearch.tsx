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
                    className="absolute left-3 top-1/2 h-4 w-4
                    -translate-y-1/2 text-muted-foreground"
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
                    className="
                        h-10 w-full rounded-md border
                        bg-background pl-9 pr-10
                        text-sm outline-none
                        focus:ring-2 focus:ring-ring
                    "
                />

                {loading && (
                    <Loader2
                        className="
                            absolute right-3 top-1/2
                            h-4 w-4 -translate-y-1/2
                            animate-spin text-muted-foreground
                        "
                    />
                )}
            </div>

            {/* Suggestions */}
            {showResults && results.length > 0 && (
                <div
                    className="
                        absolute z-50 mt-1 w-full
                        overflow-hidden rounded-md border
                        bg-popover shadow-lg
                    "
                >
                    {results.map((invoice) => (
                        <button
                            key={invoice.invoiceNo}
                            type="button"
                            onClick={() => handleSelect(invoice)}
                            className="
                                flex w-full flex-col
                                items-start px-4 py-3
                                text-left transition-colors
                                hover:bg-accent
                            "
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
                        className="
                            absolute z-50 mt-1 w-full
                            rounded-md border bg-popover
                            p-4 text-center
                            text-sm text-muted-foreground
                            shadow-lg
                        "
                    >
                        No invoices found.
                    </div>
                )}
        </div>
    );
}