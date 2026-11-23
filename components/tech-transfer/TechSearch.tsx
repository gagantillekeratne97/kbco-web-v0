"use client";

import {useEffect, useRef, useState} from "react";
import {Loader2, Search, X} from "lucide-react";
import {searchTechnicians} from "@/lib/apis";

export interface TechSearchResult {
    techCode: string;
    techName: string;
}

interface TechSearchProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (technician: TechSearchResult) => void;
    onEnter: () => void;
    disabled?: boolean;
}

const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

export default function TechSearch({
                                       value,
                                       onChange,
                                       onSelect,
                                       onEnter,
                                       disabled = false,
                                   }: TechSearchProps) {
    const [results, setResults] = useState<TechSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounced search (ignores outdated responses)
    useEffect(() => {
        if (disabled || value.trim().length < 2) {
            setResults([]);
            setShowResults(false);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const response = await searchTechnicians(value);
                if (cancelled) return;
                setResults(response.data || []);
                setShowResults(true);
            } catch (error) {
                if (cancelled) return;
                console.error("Technician search failed:", error);
                setResults([]);
                setShowResults(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [value, disabled]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (technician: TechSearchResult) => {
        onSelect(technician);
        setShowResults(false);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Search input */}
            <div className="relative">
                <Search className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none left-3 top-1/2 text-muted-foreground" />

                <input
                    type="text"
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => {
                        if (results.length > 0) setShowResults(true);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") onEnter();
                        if (e.key === "Escape") setShowResults(false);
                    }}
                    placeholder={
                        disabled
                            ? "Select a customer first"
                            : "Search by technician name or code..."
                    }
                    className="w-full h-11 pr-10 text-sm transition-shadow border rounded-lg shadow-sm outline-none bg-background pl-9 placeholder:text-muted-foreground hover:border-foreground/30 focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="absolute -translate-y-1/2 right-3 top-1/2">
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                        value &&
                        !disabled && (
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
                        {results.length}{" "}
                        {results.length === 1 ? "technician" : "technicians"} found
                    </div>

                    <ul className="overflow-y-auto divide-y overscroll-contain max-h-72 scrollbar-thin">
                        {results.map((technician) => (
                            <li key={technician.techCode}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(technician)}
                                    className="flex items-center w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-accent focus:bg-accent focus:outline-none"
                                >
                                    {/* Avatar */}
                                    <div className="flex items-center justify-center text-xs font-semibold rounded-full shrink-0 size-10 bg-primary/10 text-primary">
                                        {getInitials(technician.techName)}
                                    </div>

                                    {/* Name + code */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate text-foreground">
                                            {technician.techName}
                                        </p>
                                        <p className="font-mono text-xs text-muted-foreground">
                                            {technician.techCode}
                                        </p>
                                    </div>
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
                        <p className="text-sm font-medium text-foreground">
                            No technicians found
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Try a different name or technician code.
                        </p>
                    </div>
                )}
        </div>
    );
}