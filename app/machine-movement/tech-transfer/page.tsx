"use client";

import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import TechCustomerSearch, {
    CustomerSearchResult,
} from "@/components/tech-transfer/TechCustomerSearch";
import TechSearch, {
    TechSearchResult,
} from "@/components/tech-transfer/TechSearch";
import {useState} from "react";
import TechnicianSearchInput from "@/components/tech-transfer/TechnicianSearchInput";
import {transferMachineTech} from "@/lib/apis";

export default function TechTransferPage() {
    const [newTechCode, setNewTechCode] = useState("");
    const [newTech, setNewTech] = useState<TechSearchResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [customerCode, setCustomerCode] = useState("");
    const [selectedCustomer, setSelectedCustomer] =
        useState<CustomerSearchResult | null>(null);

    const [techSearch, setTechSearch] = useState("");
    const [selectedTech, setSelectedTech] = useState<TechSearchResult | null>(null);

    const handleNewTechCodeChange = (value: string) => {
        setNewTechCode(value);
        setNewTech(null); // typing again invalidates the earlier choice
        setMessage(null);
    };

    const handleSelectNewTech = (tech: TechSearchResult) => {
        setNewTech(tech);
        setNewTechCode(tech.techCode);
    };

    const handleUpdate = async () => {
        if (!selectedCustomer || !newTech) return;

        const confirmed = window.confirm(
            `Transfer ${selectedCustomer.machinesCount} machine(s) of ${selectedCustomer.customerName} to ${newTech.techName}?`
        );
        if (!confirmed) return;

        try {
            setIsSubmitting(true);
            setMessage(null);
            // TODO: call the real transfer API
            await transferMachineTech(selectedCustomer.customerCode, newTech.techCode);
            // await transferMachinesTech(selectedCustomer.customerCode, newTech.techCode);
            setMessage({
                type: "success",
                text: `Machines transferred to ${newTech.techName}.`,
            });
        } catch (error) {
            console.error("Tech transfer failed:", error);
            setMessage({ type: "error", text: "Transfer failed. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectCustomer = (customer: CustomerSearchResult) => {
        setSelectedCustomer(customer);
        setCustomerCode(customer.customerCode);
        // A different customer means the old technician choice no longer applies
        setTechSearch("");
        setSelectedTech(null);
    };

    const handleCustomerChange = (value: string) => {
        setCustomerCode(value);
        // Typing again invalidates the previously selected customer
        if (selectedCustomer && value !== selectedCustomer.customerCode) {
            setSelectedCustomer(null);
            setTechSearch("");
            setSelectedTech(null);
        }
    };

    const handleSelectTech = (tech: TechSearchResult) => {
        setSelectedTech(tech);
        setTechSearch(tech.techName);
    };

    const handleTechChange = (value: string) => {
        setTechSearch(value);
        // Typing again invalidates the previously selected technician
        setSelectedTech(null);
    };

    const handleClear = () => {
        setCustomerCode("");
        setSelectedCustomer(null);
        setTechSearch("");
        setSelectedTech(null);
        setNewTechCode("");
        setNewTech(null);
        setMessage(null);
    };

    return (
        <div className="flex min-h-screen bg-surface font-display">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar title="Machine Bulk Tech Transfer" />
                <main className="m-5 space-y-6">
                    {/* ================= SEARCH CARD ================= */}
                    <div className="p-5 bg-white border shadow-sm rounded-xl border-slate-200">
                        <h2 className="mb-1 text-base font-semibold text-slate-800">
                            Search Customer &amp; Technician
                        </h2>
                        <p className="mb-4 text-sm text-slate-500">
                            Select a customer first, then choose the technician
                            the customer&apos;s machines will be transferred to.
                        </p>

                        <div className="grid gap-4 md:grid-cols-2">
                            {/* ---------- Customer search ---------- */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Customer Code
                                </label>
                                <TechCustomerSearch
                                    value={customerCode}
                                    onChange={handleCustomerChange}
                                    onEnter={() => null}
                                    onSelect={handleSelectCustomer}
                                />
                            </div>

                            {/* ---------- Technician search ---------- */}
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Technician
                                </label>
                                <TechSearch
                                    value={techSearch}
                                    onChange={handleTechChange}
                                    onEnter={() => null}
                                    onSelect={handleSelectTech}
                                    disabled={!selectedCustomer}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                type="button"
                                disabled={!selectedCustomer || !selectedTech}
                                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Search
                            </button>

                            <button
                                type="button"
                                onClick={handleClear}
                                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* ================= SUMMARY CARD ================= */}
                    <div className="p-5 bg-white border shadow-sm rounded-xl border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-semibold text-slate-800">
                                Machine Tech Summary Info
                            </h2>
                            {selectedCustomer && (
                                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700">
                                    {selectedCustomer.customerName}
                                </span>
                            )}
                        </div>

                        {!selectedCustomer ? (
                            <div className="px-4 py-10 text-center border border-dashed rounded-lg border-slate-300 bg-slate-50">
                                <p className="text-sm font-medium text-slate-700">
                                    No customer selected
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Search and select a customer to see the summary.
                                </p>
                            </div>
                        ) : (
                            <dl className="grid gap-4 sm:grid-cols-3">
                                <SummaryItem
                                    label="Total Machines"
                                    value={String(selectedCustomer.machinesCount)}
                                />
                                <SummaryItem
                                    label="Tech Code"
                                    value={selectedTech?.techCode ?? "—"}
                                    mono
                                />
                                <SummaryItem
                                    label="Tech Name"
                                    value={selectedTech?.techName ?? "—"}
                                />
                            </dl>
                        )}
                    </div>
                    {/* ================= TRANSFER TECHNICIAN CARD ================= */}
                    <div className="p-5 bg-white border shadow-sm rounded-xl border-slate-200">
                        <h2 className="mb-1 text-base font-semibold text-slate-800">
                            Transfer Technician Information
                        </h2>
                        <p className="mb-4 text-sm text-slate-500">
                            Enter the technician code the machines will be transferred to.
                        </p>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="newTechCode"
                                    className="block mb-2 text-sm font-medium text-slate-700"
                                >
                                    Tech Code
                                </label>
                                <TechnicianSearchInput
                                    value={newTechCode}
                                    selectedCode={newTech?.techCode}
                                    onChange={handleNewTechCodeChange}
                                    onSelect={handleSelectNewTech}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="newTechName"
                                    className="block mb-2 text-sm font-medium text-slate-700"
                                >
                                    Tech Name
                                </label>
                                <input
                                    id="newTechName"
                                    type="text"
                                    value={newTech?.techName ?? ""}
                                    readOnly
                                    placeholder="Filled automatically"
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {message && (
                            <p
                                className={`mt-4 rounded-lg px-3.5 py-2.5 text-sm ${
                                    message.type === "success"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-red-50 text-red-700"
                                }`}
                            >
                                {message.text}
                            </p>
                        )}

                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={handleUpdate}
                                disabled={!selectedCustomer || !newTech || isSubmitting}
                                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

function SummaryItem({
                         label,
                         value,
                         mono = false,
                     }: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="p-4 border rounded-lg border-slate-200 bg-slate-50">
            <dt className="text-xs font-semibold tracking-wider uppercase text-slate-500">
                {label}
            </dt>
            <dd
                className={`mt-1 truncate text-lg font-semibold text-slate-900 ${
                    mono ? "font-mono" : ""
                }`}
            >
                {value}
            </dd>
        </div>
    );
}