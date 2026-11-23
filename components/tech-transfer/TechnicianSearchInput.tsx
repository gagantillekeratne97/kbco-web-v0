"use client";

import {useEffect, useRef, useState} from "react";
import {Loader2} from "lucide-react";
import {searchTechnicians} from "@/lib/apis";
import type {TechSearchResult} from "@/components/tech-transfer/TechSearch";

interface TechCodeInputProps {
    value: string;
    selectedCode?: string; // code of the technician already chosen, if any
    onChange: (value: string) => void;
    onSelect: (technician: TechSearchResult) => void;
}

export default function TechCodeInput({
                                          value,
                                          selectedCode,
                                          onChange,
                                          onSelect,
                                      }: TechCodeInputProps) {
    const [results, setResults] = useState<TechSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Don't search for short text, or right after a suggestion was picked
        if (value.trim().length < 2 || value === selectedCode) {
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
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [value, selectedCode]);

    // Close the suggestions when clicking outside
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

    return (
        <div ref={containerRef} className="relative">
            <input
                id="newTechCode"
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => results.length > 0 && setShowResults(true)}
                onKeyDown={(e) => e.key === "Escape" && setShowResults(false)}
                placeholder="Type tech code..."
                autoComplete="off"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 font-mono text-sm text-slate-900 shadow-sm outline-none transition placeholder:font-sans placeholder:text-slate-400 hover:border-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />

            {loading && (
                <Loader2 className="absolute w-4 h-4 -translate-y-1/2 right-3 top-1/2 animate-spin text-slate-400" />
            )}

            {showResults && (
                <ul className="absolute z-50 w-full mt-1 overflow-y-auto bg-white border rounded-lg shadow-lg max-h-60 border-slate-200">
                    {results.length === 0 ? (
                        <li className="px-3.5 py-3 text-sm text-center text-slate-500">
                            No technicians found
                        </li>
                    ) : (
                        results.map((tech) => (
                            <li key={tech.techCode}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onSelect(tech);
                                        setShowResults(false);
                                    }}
                                    className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-indigo-50"
                                >
                                    <span className="font-mono font-medium text-slate-900">
                                        {tech.techCode}
                                    </span>
                                    <span className="text-xs truncate text-slate-500">
                                        {tech.techName}
                                    </span>
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}