"use client"; 

import { 
    tableFeatures, 
    rowPaginationFeature, 
    createPaginatedRowModel, 
    type ColumnDef
} from "@tanstack/react-table";

import type { CreditNote } from "@/lib/types";

export const features = tableFeatures({
    rowPaginationFeature, 
    paginatedRowModel:
    createPaginatedRowModel()    
});

export const columns: ColumnDef<typeof features, CreditNote>[] = [
    { 
        accessorKey: "cnNo",
        header: "Credit Note No"
    }, 
    { 
        accessorKey: "cnDate",
        header: "Credit Note Date"
    },      
    { 
        accessorKey: "invoiceNo",
        header: "Invoice No"
    }, 
    { 
        accessorKey: "invoiceDate",
        header: "Invoice Date"
    }, 
    { 
        accessorKey: "customerCode",
        header: "Customer Code"
    }, 
    { 
        accessorKey: "customerName",
        header: "Customer Name"
    }, 
    { 
        accessorKey: "creditNoteValue",
        header: "Credit Value"
    }, 
    { 
        accessorKey: "vatAmount",
        header: "Vat Amount"
    },     
    { 
        accessorKey: "ssclAmount",
        header: "SSCL Amount"
    },     
    { 
        accessorKey: "creditNoteStatus",
        header: "Credit Note Status"
    },     
];