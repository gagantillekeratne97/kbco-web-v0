export type kpiSummery = { 
    invoicesList: { value: number; percentage: number},
    invoiceRevenueWithoutTax : { value: number; percentage: number}, 
    invoiceRevenue: { value: number; percentage: number };
    creditNotes: { value: number; percentage: number };
    activeMachines: { value: number; percentage: number };
    newInvoices: { value: number; percentage: number };        
};

export interface InvoicePreview {
  status: number;
  master: {
    billingMethod: string | null;
    invAdd1: string | null;
    invAdd2: string | null;
    invAdd3: string | null;
    rentalVal: number | null;
    adjustment: number | null;
  };
  details: {
    serialNo: string;
    makeModel: string | null;
    pNo: number | string | null;
    mLoc: string | null;
    startMr: number | null;
    endMr: number | null;
    invCopies: number | null;
    waistage: number | null;
  }[];
  bw: unknown[];
  calc: {
    invoiceValue: number;
    nbt: number;
    vat: number;
    net: number;
    slabs: { range1: number; range2: number; rate: number; breakup: number | null }[];
  };
}

export interface InvoiceRequestParams {
  companyId: string;
  customerCode: string;
  agreementId: string;
  periodStart: string;
  periodEnd: string;
  invoiceDate: string;
  discount: number;
  userCode: string;
  userName: string;
}

export interface ProcessInvoiceResponse {
  status: number;
  invoiceNo: string;
  afterCreditNote: boolean;
  message: string;
}

export interface SaveMeterReadingRow {
  serial: string;
  endReading: number;
  waistage: number;
}

export interface SaveMeterReadingPayload {
  companyId: string;
  customerCode: string;
  agreementId: string;
  periodStart: string;          // "yyyy-MM-dd"
  periodEnd: string;            // "yyyy-MM-dd"
  userName: string;
  adjustment: number | null;
  rows: SaveMeterReadingRow[];
}

export interface SaveMeterReadingResponse {
  status: number;
  mrId?: string;
  message: string;
}

// type interfaces for invoice document pdf generating. 

export interface InvoiceParty {
  tin: string;
  name: string;
  address: string;
  telephoneNo?: string;
}

export interface MachineRecord {
    pNumber: string;
    serialNumber: string;
    machineModel: string;
    customerCode: string;
    customerName: string;
    customerAddress: string;
    /** used to prefill the form; the user can change them */
    contactPerson?: string;
    contactPhone?: string;
    machineLocation?: string;
};

export interface MachineReturnRequest {
    companyId: string;
    pNumber: string;
    serialNumber: string;
    machineModel: string;
    customerCode: string;
    customerName: string;
    customerAddress: string;
    contactPerson: string;
    contactPhone: string;
    pickupLocation: string;
    returnReason: string;
    returnComment: string;
};

// machine return query dto 
export interface machineReturnReqDto { 
  query?: string, 
  fromDate?: string; 
  toDate: string; 
  page: number; 
  pageSize: number;    
  status: string;
  companyId: string; 
}

// machine return table columns 
export interface machineReturnResponseDto { 
  returnId: string; 
  date: string; 
  pnumber: string;
  agreementCode?: string;
  address?: string;
  contactPerson?: string;
  noOfMachines: string;
  model?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  startMeterReading: string;
  location?: string;
  meterReading?: number;
  serialNumber: string;
  partNumber: string;
  customerName: string; 
  returnReason: string; 
  department: string; 
  installationDate: string; 
  status: string; 
}

export interface MachineReturnResponse { 
  status: string; 
  message: string; 
}

export interface InvoiceItem {
  serialNumber: string;
  description: string;
  location: string;
  startMR: number;
  endMR: number;
  copies: number;
  rate: number;
  amount: number;
}

export interface InvoiceRateSlabs { 
  range: string;  
  rate: number;
  copies: number;
  amount: number; 
}

export interface InvoiceFinancialDetails {
  totalCountOfCopies: number;
  totalValueOfSupply: number;
  discount: number;
  sscl: number;
  taxAmount: number;
  totalAmountValue: number;
}

export interface Invoice {
  invoiceNo: string;
  invoiceDate: string;
  dateOfSupply: string;
  invoicePeriod: string;
  poNo?: string;
  invoiceReference: string; 

  supplier: InvoiceParty;
  purchaser: InvoiceParty;

  customerCode: string;
  placeOfSupply: string;

  items: InvoiceItem[];
  rateSlabs: InvoiceRateSlabs[];

  financialDetails: InvoiceFinancialDetails;
}

// invoice generating pdf. 

export type CustomerAgreement = {
  agreementId: string; 
  agreementName: string; 
  billingMethod: string; 
  machineCount: number; 
  status: "invoiced" | "saved" | "unsaved";
}

// meterreading sheet machines

export interface MeterSheetMachine {    
    serial: string;
    model: string;
    machineRef: string;
    machineLocation: string;
    startReading: number;
    endReading: number | null;
    copies: number;
    waistage: number | null;
}

export interface MeterSheet {
    status: "invoiced" | "saved" | "unsaved";
    agreement: {
        customerType: string;
        billingMethod: string;
        slabMethod: string;
        billingPeriod: number;
        agreementStart: string | null;
        agreementEnd: string | null;
        invoiceStatus: string;
        machineType: string;
        rentalPrice: number;
        repCode: string;
    };
    location: { name: string; address1: string; address2: string };
    adjustment: number | null;
    machines: MeterSheetMachine[];
}

export type kpiRevenueCard = { 
  value: number; 
  percentage: number;
}

// Create Credit Note Request
export interface CreateCreditNoteRequest {
  invoiceNumber: string;
  creditNoteDate: string;
  companyId: string;
  reason: string;
} 

export interface CreatePartialCreditRequestPayload { 
  invoiceNumber: string; 
  creditNoteDate: string; 
  companyId: string; 
  reason: string; 
  creditAmount: number; 
  items: {
    serialNumber: string; 
    startMr: number | null; 
    endMr: number | null; 
    invoiceCopies: number | null 
  }[];  
}

// Internal Consumption DTO 
export interface InternalConsumptionDto { 
  comId: string; 
  irNumber: string; 
  irDate: string; 
  area: string; 
  copies: number; 
  pnumber: string; 
  pnType: string; 
  pdescription: string; 
  pnPrice: number; 
  machineModel: string;   
  qty: number; 
  currentMr: number;     
  customerName: string; 
  techName: string; 
  serialNumber: string;  
  isBackup: string;
}

// Internal Request 
export interface InternalConsumptionResponse { 
   status: number;
  data: InternalConsumptionDto[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
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

export interface MachineList {
  machineId: string;
  machineModel: string; 
  companyId: string;
}

export interface MachineListResponse<T>{ 
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface LoginResponseModel { 
  statusCode: number; 
  message: string; 
  token: string; 
  userName: string; 
  userCode: string; 
  userRole: string; 
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

export type PendingInvoiceLists = {               
  customerCode: string;
  agreementCode: string;   
  customerName: string; 
  invNo: string; 
  invDate: string; 
  invPeriodStart: string;
  invPeriodEnd: string;                         
  renewalStatus: string;
}

export type invoiceItem = {
  serialNumber: string;
  agId: string;
  custCode: string;
  period_start: string;
  period_end: string;
  pnumber: string;
  invoiceNumber: string;
  machineModel: string;
  invAdd1: string;
  invAdd2: string;
  invAdd3: string;
  mLoc: string;
  billingMethod: string;
  startMr: number;
  endMr: number;
  invoiceCopies: number;
};

export type creditNoteInfo = {
  customerCode: string;
  customerName: string;
  customerAddress: string;
  invoiceReference: string;

  creditNoteStatus: string; 

  invoiceNumber: string; // this is refering to the credit note number.
  invoiceDate: string;

  subTotal: number;
  tax: number;
  ssclAmount: number;
  total: number;  // Total invoice amount.

  invoiceItems: invoiceItem[];
};

export type creditNoteApproveDto = { 
  appBy: string; 
  reason: string; 
  invoiceNumber: string; 
}

export type creditNoteApiResponse = { 
  status: number;  
  data: creditNoteInfo;   
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
  invoiceReference: string;
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
  hodCrComment: string; 
  financeComment: string; 
  approvedBy: string; 
  approvedDate: string; 
  financeAppBy: string; 
  financeAppDate: string; 
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