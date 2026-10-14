// Types + MOCK DATA. Each mock below becomes an API call in the backend stage.

export type AgreementStatus = "invoiced" | "saved" | "unsaved";

export interface Customer {
    id: string;
    name: string;
}

export interface Machine {
    serial: string;
    model: string;
    dept: string;
    start: number;
}

export interface Agreement {
    id: string;
    name: string;
    address: string;
    status: AgreementStatus;
    billing: string;
    slab: string;
    period: string;
    rep: string;
    rental: number;
    machines: Machine[];
}

export interface ReadingInput {
    end: string;
    waste: string;
}

export type Readings = Record<string, ReadingInput>;

export interface Slab {
    upTo: number | null; // cumulative upper limit, null = no limit
    rate: number;
}

// Placeholder rules: confirm the real ones before the backend stage.
export const SLABS: Slab[] = [
    { upTo: 2000, rate: 3.0 },
    { upTo: null, rate: 2.5 },
];
export const VAT_RATE = 0.18;
export const SSCL_RATE = 0.025;

export const CUSTOMERS: Customer[] = [
    { id: "C0012", name: "ABC Traders (Pvt) Ltd" },
    { id: "C0045", name: "ABC Printers" },
    { id: "C0107", name: "Lanka Hardware Stores" },
];

export const AGREEMENTS: Record<string, Agreement[]> = {
    C0012: [
        {
            id: "AG-1021", name: "Head Office", address: "No 12, Galle Road, Colombo 03", status: "unsaved",
            billing: "Commitment", slab: "Tiered", period: "Monthly", rep: "R014", rental: 15000,
            machines: [
                { serial: "E7391234", model: "Ricoh MP 3055", dept: "Admin", start: 41200 },
                { serial: "E7391877", model: "Ricoh MP 2555", dept: "Accounts", start: 18540 },
                { serial: "E7392011", model: "Ricoh MP 301", dept: "HR", start: 9015 },
            ],
        },
        {
            id: "AG-1034", name: "Warehouse", address: "Industrial Zone, Ja-Ela", status: "invoiced",
            billing: "Actual", slab: "Flat", period: "Monthly", rep: "R014", rental: 8000,
            machines: [{ serial: "E7399001", model: "Ricoh MP 2014", dept: "Stores", start: 5200 }],
        },
    ],
    C0045: [
        {
            id: "AG-2007", name: "Main Press", address: "45 Temple Road, Kandy", status: "saved",
            billing: "Commitment", slab: "Tiered", period: "Monthly", rep: "R021", rental: 12000,
            machines: [
                { serial: "K5521188", model: "Konica C360", dept: "Press", start: 76010 },
                { serial: "K5521190", model: "Konica C250", dept: "Design", start: 30120 },
            ],
        },
    ],
    C0107: [
        {
            id: "AG-3002", name: "Showroom", address: "88 High Level Rd, Nugegoda", status: "unsaved",
            billing: "Rental", slab: "Flat", period: "Monthly", rep: "R009", rental: 9500,
            machines: [{ serial: "S2210455", model: "Sharp MX-3050", dept: "Sales", start: 12880 }],
        },
    ],
};