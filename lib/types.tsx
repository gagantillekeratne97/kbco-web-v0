export type kpiSummery = { 
    invoicesList: { value: number; percentage: number},
    invoiceRevenue: { value: number; percentage: number };
    creditNotes: { value: number; percentage: number };
    activeMachines: { value: number; percentage: number };
    newInvoices: { value: number; percentage: number };    
};

export type kpiRevenueCard = { 
  value: number; 
  percentage: number;
}

// Pagination and invoice list types
export interface InvoiceRequestQuery { 
  query?: string, 
  fromDate?: string; 
  toDate: string; 
  page: number; 
  pageSize: number;    
  status: string;
  companyId: string; 
}

export type RevenueTrendPoint = { 
  months: string; 
  revenue: number; 
};

export interface PartsModel { 
  companyID: string; 
  productCode: string; 
  productDescription: string;
  productUnitPrice: number;
}

export interface ExcelResponse { 
  success: boolean; 
  totalRows: number; 
  successfullRows: number; 
  failedRows: number; 
  errors: string[]; 
  data: PartsModel[];
}

export interface LoginResponseModel { 
  statusCode: number; 
  message: string; 
  token: string; 
  userName: string; 
  userCode: string; 
  companyID: string;
  companyName: string;
}

export interface LoginRequestModel { 
  userName: string; 
  password: string; 
  companyID: string; 
}

export interface PaginatedResult<T> { 
  items: T[], 
  page: number,
  pageSize: number; 
  totalCount: number; 
  totalPages: number; 
}

export type InvoiceRevenueLists = { 
  invoiceNo: string; 
  invoiceDate: string; 
  creditNo: string; 
  invoiceReference: string; 
  creditNoteDate: string;   
  customerCode: string; 
  customerName: string; 
  agreementId: string; 
  totalCopies: number; 
  subTotal: number; 
  vatAmount: number; 
  ssclAmount: number; 
  netTotalAmount: number; 
  invoicePeriod: string; 
  repCode: string;   
  repName: string; 
  invoiceStatus: string; 
}

export type InvoiceLists = { 
  invoiceNo: string; 
  invoiceDate: string; 
  creditNo: string; 
  creditNoteDate: string;   
  customerCode: string; 
  customerName: string; 
  agreementId: string; 
  totalCopies: number; 
  subTotal: number; 
  vatAmount: number; 
  ssclAmount: number; 
  netTotalAmount: number; 
  invoicePeriod: string; 
  repCode: string;   
  repName: string; 
  invoiceStatus: string; 
}

export type RecentInvoices = { 
  invAutoNum: number; 
  invoiceNo: string; 
  invoiceDate: Date; 
  client: string; 
  totalInvoiceAmount: number; 
  status: "Credit Note" | "Cancelled Invoice" | "Receipted" | "Invoice Processed";
};

export type MachineStatusMetric = {
  count: number;
  total: number;
};

export type CreditNote = { 
  cnNo: string; 
  cnDate: string; 
  invoiceNo: string; 
  invoiceDate: string; 
  customerCode: string; 
  customerName: string; 
  creditNoteValue: number; 
  vatAmount: number; 
  ssclAmount: number; 
  creditNoteStatus: string;      
  crReason: string;     
  crBy: string;
  invTransactionStatus:string;
};

export type MachineStatusSummary = {
  newlyInstalled: MachineStatusMetric;
  returns: MachineStatusMetric;
  disposed: MachineStatusMetric;
};

export type InventoryItem = {
  itemCode: string;
  itemName: string;
  itemDescription: string;
  unitPrice: number;
};