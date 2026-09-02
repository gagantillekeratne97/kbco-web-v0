"use client"; 

import {
  tableFeatures,
  rowPaginationFeature,   
  createPaginatedRowModel,
  type ColumnDef,
} from "@tanstack/react-table";

import type { InvoiceLists } from "@/lib/types";

export const features = tableFeatures({
    rowPaginationFeature, 
    paginatedRowModel: 
    createPaginatedRowModel() 
});

export const columns: ColumnDef<typeof features, InvoiceLists>[] = [
    { 
        accessorKey: "invoiceNo",
        header: "Invoice No"
    }, 
    { 
        accessorKey: "invoiceDate", 
        header: "Invoice Date"
    },      
    { 
        accessorKey: "creditNo", 
        header: "Credit No"
    }, 
    { 
        accessorKey: "creditNoteDate", 
        header: "Credit Date"
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
        accessorKey: "agreementId", 
        header: "Agreement Id"
    },
    { 
        accessorKey: "totalCopies", 
        header: "Total Copies"
    }, 
    { 
        accessorKey: "subTotal", 
        header: "Sub Total"
    }, 
    { 
        accessorKey: "vatAmount", 
        header: "Vat Amount"
    },     
    { 
        accessorKey: "ssclAmount", 
        header: "Sscl Amount"
    },
    { 
        accessorKey: "invoicePeriod", 
        header: "Invoice Period"
    }, 
    { 
        accessorKey: "repCode", 
        header: "Rep Code"
    }, 
    { 
        accessorKey: "repName", 
        header: "Rep Name"
    }, 
    { 
        accessorKey: "invoiceStatus", 
        header: "Invoice Status"
    }
];