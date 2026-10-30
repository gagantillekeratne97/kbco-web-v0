"use client";
import { rawConfigSchema } from "shadcn/schema";
import { MachineStatusSummary, RecentInvoices, kpiSummery, InventoryItem, InvoiceRequestQuery, PaginatedResult, InvoiceLists, CreditNote, LoginRequestModel, LoginResponseModel, RevenueTrendPoint, InvoiceRevenueLists, ExcelResponse, PartsModel, PendingInvoiceLists, creditNoteInfo, InternalConsumptionResponse, CreateCreditNoteRequest, creditNoteApiResponse, MachineListResponse, MachineList, CreatePartialCreditRequestPayload, Invoice, SaveMeterReadingPayload, InvoiceRequestParams, InvoicePreview, ProcessInvoiceResponse, MachineRecord, MachineReturnRequest, MachineReturnResponse, machineReturnReqDto, machineReturnResponseDto} from "./types";
import { CustomerSearchResult } from "@/components/bw-invoice/customerSearch";
import { promises } from "dns";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// safe helper to read companyID only in the browser
function getCompanyId(): string {
  if (typeof window === "undefined") {
    throw new Error("Company ID not found.");
  }

  const companyId =
    localStorage.getItem("companyID") ??
    sessionStorage.getItem("companyID");

  if (!companyId) {
    throw new Error("Company ID not found.");
  }

  return companyId;
}

function getUserName(): string { 
  if (typeof window === "undefined") { 
    throw new Error("Username not found.");
  }

  const username = localStorage.getItem("userName") ?? sessionStorage.getItem("userName"); 
  if (!username) {
    throw new Error("User name not found.");
  }

  return username;
}

// safe helper to read companyID only in the browser
function getUserRole(): string {
  if (typeof window === "undefined") {
    throw new Error("User Role not found.");
  }

  const userRole =
    localStorage.getItem("userRole") ??
    sessionStorage.getItem("userRole");

  if (!userRole) {
    throw new Error("User Role not found.");
  }

  return userRole;
}

export async function approveCreditNoteFinance(invoiceNumber: string, reason: string) 
{
  const userRole = getUserRole(); 
  const userName = getUserName();
  const response = await fetch(`${API_BASE}creditnote/finance-approved-cr`, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json"
    }, 
    body: JSON.stringify({
      invoiceNumber: invoiceNumber,
      appBy: userName, 
      reason: reason, 
      userRole: userRole
    })
  });

  if (!response.ok) {
    throw new Error("Something went wrong.");
  }
}

export async function approveCreditNoteHOD(
  invoiceNumber: string,   
  reason: string) 
{   
  debugger;
    const userRole = getUserRole();
    const userName = getUserName();

    const response = await fetch(`${API_BASE}creditnote/hod-approved-cr`, { 
      method: "POST", 
      headers: { 
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify({
        invoiceNumber: invoiceNumber, 
        appBy: userName, 
        reason: reason, 
        userRole: userRole       
      })
    });    

    if (!response.ok) { 
      throw new Error("Something went Wrong.");
    }       
}

export async function getCreditNoteInformation(invoiceNumber: string):Promise<creditNoteApiResponse> 
{ 
  var params = new URLSearchParams(); 
  params.append("creditNoteNumber", invoiceNumber);  
  const response = await fetch(`${API_BASE}creditNote/getCreditNoteInfor?${params.toString()}`);
  if (!response.ok) { 
    throw new Error("Something went wrong the response does not work.");    
  }

  return await response.json(); 
}

// get the machins master lists
export async function getMachineMasterLists(
  companyId: string,
  query: string = "",
  page: number = 1,
  pageSize: number = 10
): Promise<MachineListResponse<MachineList>> {
const params = new URLSearchParams({
  companyId,
  page: String(page),
  pageSize: String(pageSize),
});

if (query) params.set("query", query);

  debugger;

  const response = await fetch(
    `${API_BASE}reports/get-machines-lists?${params.toString()}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    // backend returns { status, message } on 400
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? `Request failed (${response.status})`);
  }

  return response.json();
}

// Internal Consumption 
export async function getInternalConsumption(
  comid: string,
  startDate: string, 
  endDate: string,
  search: string, 
  page: number, 
  pageSize: number    
):Promise<InternalConsumptionResponse> 
{ 
  const params = new URLSearchParams();   
  params.append("comId", comid); 
  params.append("startDate", startDate); 
  params.append("endDate", endDate);   
  params.append("page", page.toString()); 
  params.append("pageSize", pageSize.toString()); 
  
  if (search.trim()) { 
    params.append("search", search.trim());
  }

    const response = await fetch(
    `${API_BASE}reports/internal-consumption-lists?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to load internal consumption records.");
  }  

  return await response.json();
}

// Reads the response once and turns any failure into an Error with a useful message.
// Handles JSON bodies ({ message }), validation errors ({ title }) and plain text (e.g. NotFound("..."))
async function readResponse(response: Response, fallback: string) {
  const text = await response.text();

  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // not JSON, keep the raw text
  }

  if (!response.ok) {
    throw new Error(body?.message || body?.title || text || fallback);
  }

  return body;
}

export async function getColorInvoicePreview(params: InvoiceRequestParams): Promise<InvoicePreview> {
  debugger;
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();

  const response = await fetch(`${API_BASE}invoice/color-invoice-preview?${query}`);
  return readResponse(response, "Failed to load the color invoice preview.");
}

// Step 3: calculate the invoice from the saved readings, saves nothing
export async function getInvoicePreview(params: InvoiceRequestParams): Promise<InvoicePreview> {
  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();

  const response = await fetch(`${API_BASE}invoice/invoice-preview?${query}`);
  return readResponse(response, "Failed to load the invoice preview.");
}

// Step 3: create the invoice
export async function processInvoice(payload: InvoiceRequestParams): Promise<ProcessInvoiceResponse> {
  const response = await fetch(`${API_BASE}invoice/process-invoice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return readResponse(response, "Failed to process the invoice.");
}

//start syncing data to the system
export async function processRecords(parts: PartsModel[]) {
  const response = await fetch(`${API_BASE}parts/process-data`, {
    method: "POST", 
    headers: { 
      "Content-Type": "application/json"
    }, 
    body: JSON.stringify(parts)
  });

  const result = await response.json(); 
  
   if (!response.ok) {
    throw new Error(
      result.message || "Failed to process parts."
    );
  }

  return result;
}

export async function uploadItemsExcel(file: File, companyID: string):
 Promise<ExcelResponse> {   
  const formData = new FormData(); 
  formData.append("file", file);
  formData.append("companyID", companyID);

  const response = await fetch(`${API_BASE}parts/upload`, { method: "POST", body: formData});
  const result = await response.json(); 
  if (!response.ok)
  {
    throw new Error(result.errors?.join(", ") || "Failed to upload Excel file.");
  }

  return result;
}

export async function getRevenueTrend(monthsBack = 7): Promise<RevenueTrendPoint[]> {
  const response = await fetch(`${API_BASE}reports/revenue-trend?monthsBack=${monthsBack}`, {
    cache: "no-store"
  });

  if (!response.ok){ 
    throw new Error(`Failed to fetch Revenue Trend: ${response.status} ${response.statusText}`);
  }

  return response.json(); 
}

// Login api function 
export async function loginUser(payload: LoginRequestModel) : Promise<LoginResponseModel> {  
  const response = await fetch( `${API_BASE}account/login-user`, 
    { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(payload) 
  });

  const data: LoginResponseModel = await response.json(); 
  console.log(data);
  if (!response.ok) {
    throw new Error(
      data.message || "Login Failed"
    );    
  }

  if (data.statusCode !== 200) {
    throw new Error(data.message || "Invalid Username or Password");
  }

  return data;
}

export async function getKpiSummery(): Promise<kpiSummery> {
  const companyId = getCompanyId();

  const response = await fetch(
    `${API_BASE}reports/kpis?companyId=${encodeURIComponent(companyId)}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch KPI summary: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return data as kpiSummery;
}

// Credit note list report 
//function 

export async function getCreditNoteLists(params: InvoiceRequestQuery): Promise<PaginatedResult<CreditNote>> { 
  const searchParams = new URLSearchParams(); 
  
  if (params.query) {
    searchParams.set("query", params.query);
  }

  if (params.fromDate) {
    searchParams.set("fromDate", params.fromDate);
  }

  if (params.toDate) {
    searchParams.set("toDate", params.toDate);
  } 

  searchParams.set("page", params.page.toString());

  searchParams.set(
    "pageSize",
    params.pageSize.toString()
  );  

  searchParams.set("companyId", params.companyId.toString())

  const response = await fetch(
    `${API_BASE}reports/credit-note-lists?${searchParams.toString()}`    
  );

  if (!response.ok) { 
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}

//Cancelled invoice list report 
export async function getCancelledInvoiceLists(params: InvoiceRequestQuery): Promise<PaginatedResult<InvoiceLists>> { 
  const searchParams = new URLSearchParams(); 
  
  if (params.query) {
    searchParams.set("query", params.query);
  }

  if (params.fromDate) {
    searchParams.set("fromDate", params.fromDate);
  }

  if (params.toDate) {
    searchParams.set("toDate", params.toDate);
  } 

  searchParams.set("page", params.page.toString());

  searchParams.set(
    "pageSize",
    params.pageSize.toString()
  );

  searchParams.set("companyId", params.companyId);

  const response = await fetch(
    `${API_BASE}reports/cancelled-invoice-lists?${searchParams.toString()}`    
  );

  if (!response.ok) { 
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}

export const getColorMeterSheet = async(companyId: string, customerCode: string, agreementId: string,
  periodStart: string, periodEnd: string, userName: string
) => { 
  const params = new URLSearchParams({ companyID: companyId, customerCode, agreementId, periodStart, periodEnd, userName });
    const response = await fetch(`${API_BASE}invoice/get-color-meter-sheets?${params}`);
    const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.data || "Failed to load the meter sheet.");
  }
  
  return result;    
}

// get meter reading sheets 
export const getMeterSheet = async (companyId: string, customerCode: string, agreementId: string, 
  periodStart: string, periodEnd: string, userName: string
) => {   
    const params = new URLSearchParams({ companyID: companyId, customerCode, agreementId, periodStart, periodEnd, userName });
    const response = await fetch(`${API_BASE}invoice/get-meter-sheets?${params}`);
    const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.data || "Failed to load the meter sheet.");
  }
  
  return result;    
}

// get agreement Details 
export const getCustomerAgreements = async (companyId: string, customerCode: string, periodStart: string, periodEnd: string) => {
  const params = new URLSearchParams({ companyId, customerCode, periodStart,  periodEnd});
  const response = await fetch(`${API_BASE}invoice/get-customer-agreements?${params}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.data || "Failed to load agreements.");
  }

  return result;
}

// search customer code or customer name suggestions function 
export const searchCustomers = async (query: string) => {
  const response = await fetch(`${API_BASE}creditnote/customer-search?query=${encodeURIComponent(query)}`);

  const result = await response.json(); 

  if (!response.ok) { 
    throw new Error(result?.data || "Failed to search customers.");
  }

  return result as { status: number; data: CustomerSearchResult[] };
}

// search machines by serial number or pnumber 

export const searchMachines = async (query: string) => { 
  const companyID = getCompanyId(); 
  const response = await fetch(
    `${API_BASE}machinemovement/search-machine?query=${encodeURIComponent(query)}&companyId=${encodeURIComponent(companyID)}`
  );

  const result = await response.json(); 

  if (!response.ok) { 
    throw new Error(result?.data || "Failed to search machines");
  }

  return result; 
}

// search invoice number suggestions function
export const searchInvoices = async (query: string) => {
  debugger;    
  const companyID = getCompanyId();
    const response = await fetch(
        `${API_BASE}creditnote/invoice-search?query=${encodeURIComponent(query)}&companyId=${encodeURIComponent(companyID)}`
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result?.data || "Failed to search invoices."
        );
    }

    return result;
};

// These functions are for machine searching in machine return page 

export async function searchMachine(params: {
  q: string;
  companyId: string;
}): Promise<MachineRecord[]> {
  debugger;
  const query = new URLSearchParams(params).toString();

  const response = await fetch(`${API_BASE}machinemovement/search?${query}`, {
    headers: { Accept: "application/json" },
    // credentials: "include",                   // if you authenticate with cookies
    // headers: { Authorization: `Bearer ${token}` },  // if you use a bearer token
  });

  if (!response.ok) {
    // surface the server's message (e.g. 400/404/409) to the caller
    const message = await response.text().catch(() => "");
    throw new Error(message || `Search failed (${response.status})`);
  }

  return (await response.json()) as MachineRecord[];
}

// This function is the machine return submit function 
export const submitMachineReturns = async (payload: MachineReturnRequest) => { 
  debugger;
  const response = await fetch(`${API_BASE}machinemovement/submit-return-request`, { 
    method: "POST", 
    headers: { 
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json(); 

  if (!response.ok) { 
    throw new Error(data.message || "Failed to create machine return.");
  }

  return data;
}

export async function getInvoiceNumber(params: {
  companyId: string;
  customerCode: string;
  agreementId: string;
  periodStart: string;
  periodEnd: string;
}): Promise<string> {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}invoice/invoice-number?${query}`);
  const result = await readResponse(response, "Failed to find the invoice.");
  return result.invoiceNo;
}

export const getInvoiceLayoutDetails = async (
  invoiceNumber: string,
  companyId: string
): Promise<Invoice> => {
  const params = new URLSearchParams({
    invoiceNumber: invoiceNumber.trim(),
    companyId: companyId.trim(),
  });

  const response = await fetch(
    `${API_BASE}invoice/invoice-document?${params.toString()}`
  );

  // A 404 from NotFound() can have an empty body, so don't assume JSON.
  const text = await response.text();
  const result = text ? JSON.parse(text) : null;

  if (!response.ok) {
  throw new Error(
    result?.message || result?.title || "Failed to load invoice details"
  );
  }

  if (!result?.data) {
    throw new Error("Invoice not found");
  }

  return result.data as Invoice;  
};

export const createPartialCreditNote = async (payload: CreatePartialCreditRequestPayload) => { 
  const response = await fetch(
    `${API_BASE}creditnote/createPartialCreditnote`, {
      method: "POST", 
      headers: { 
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify(payload)
    }
  );

  const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create credit note.");
    }

    return data;
}

// save color meter reading
export const saveColorMeterReading = async (request: SaveMeterReadingPayload) => {
  const response = await fetch(
    `${API_BASE}invoice/save-color-meter-reading`, {
      method: "POST", 
      headers: { 
        "Content-Type": "application/json",
      }, 
      body: JSON.stringify(request)
    }
  );

  const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create credit note.");
    }

    return data;
}

// save meter reading 
export const saveMeterReading = async (request: SaveMeterReadingPayload) => { 
  debugger;
  const response = await fetch(
    `${API_BASE}invoice/save-meter-reading`, 
    {
      method: "POST", 
      headers: { 
        "Content-Type": "application/json",
      }, 
      body: JSON.stringify(request)
    }    
  );

  const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create credit note.");
    }

    return data;
}

// Create credit note function 
export const createCreditNote = async (request: CreateCreditNoteRequest) => 
{
    const response = await fetch(
        `${API_BASE}creditnote/createCreditNote`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        }        
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create credit note.");
    }

    return data;
}

export async function getInvoiceCustomerInformation(
  invoiceNumber: string
): Promise<creditNoteInfo> {
  console.log("Fetching customer information for invoice:", invoiceNumber);
  const response = await fetch(    
    `${API_BASE}creditnote/getinvoiceInfor?invoiceNumber=${encodeURIComponent(invoiceNumber)}`
  );

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    // Controller sends the real message in `data` on BadRequest
    throw new Error(
      typeof json?.data === "string" && json.data
        ? json.data
        : "Failed to get information. Please check the invoice number."
    );
  }

  if (!json?.data) {
    throw new Error("No customer information found for this invoice.");
  }

  return json.data as creditNoteInfo; // unwrap { status, data }
}

// Invoice Cancelled Report 
export async function getCancelledKpiTotal() { 
  const companyId = getCompanyId(); 

  const response = await fetch(
    `${API_BASE}reports/revenue-cancelled-kpi?companyId=${encodeURIComponent(companyId)}`, 
    { 
      method: "GET", 
      headers: { 
        "Content-Type": "application/json",         
      }, 
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch invoice revenue KPI.");
  }

  return response.json();
}

// Invoice Revenue Report 
// KPIS function
export async function getRevenueKpiTotal() {
  const companyId = getCompanyId();

  const response = await fetch(
    `${API_BASE}reports/invoice-revenue-kpi-cards?companyId=${encodeURIComponent(companyId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch invoice revenue KPI.");
  }

  return response.json();
}

// function 
export async function getInvoiceRevenueLists(params: InvoiceRequestQuery): Promise<PaginatedResult<InvoiceRevenueLists>> {     
  const searchParams = new URLSearchParams();   
  if (params.query) {
    searchParams.set("query", params.query);
  }

  if (params.fromDate) {
    searchParams.set("fromDate", params.fromDate);
  }

  if (params.toDate) {
    searchParams.set("toDate", params.toDate);
  } 

  searchParams.set("page", params.page.toString());

  searchParams.set(
    "pageSize",
    params.pageSize.toString()
  );

  searchParams.set("companyId", params.companyId.toString());

  searchParams.set("invoiceStatus", params.status.toString());

  const response = await fetch(
    `${API_BASE}reports/invoice-revenue-lists?${searchParams.toString()}`    
  );

  if (!response.ok) { 
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}

//Invoice Pending List Report 

export async function getPendingInvoiceList(params: InvoiceRequestQuery): Promise<PaginatedResult<PendingInvoiceLists>> {
  const searchParams = new URLSearchParams(); 
  
  if (params.query) {
    searchParams.set("query", params.query);
  }

  if (params.fromDate) {
    searchParams.set("fromDate", params.fromDate);
  }

  if (params.toDate) {
    searchParams.set("toDate", params.toDate);
  } 

  searchParams.set("page", params.page.toString());

  searchParams.set(
    "pageSize",
    params.pageSize.toString()
  );

  searchParams.set("companyId", params.companyId);

  const response = await fetch(
    `${API_BASE}reports/pending-invoice-lists?${searchParams.toString()}`    
  );

  if (!response.ok) { 
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}

// Invoice list report 
// function 

export async function getInvoiceLists(params: InvoiceRequestQuery): Promise<PaginatedResult<InvoiceLists>> { 
  const searchParams = new URLSearchParams(); 
  
  if (params.query) {
    searchParams.set("query", params.query);
  }

  if (params.fromDate) {
    searchParams.set("fromDate", params.fromDate);
  }

  if (params.toDate) {
    searchParams.set("toDate", params.toDate);
  } 

  searchParams.set("page", params.page.toString());

  searchParams.set(
    "pageSize",
    params.pageSize.toString()
  );

  searchParams.set("companyId", params.companyId);
  console.log(params.status);
  searchParams.set("invoiceStatus", params.status);

  const response = await fetch(
    `${API_BASE}reports/invoice-lists?${searchParams.toString()}`    
  );

  if (!response.ok) { 
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}

export async function getMachineReturnLists(params: machineReturnReqDto): Promise<PaginatedResult<machineReturnResponseDto>> {
  debugger;
  const searchParams = new URLSearchParams(); 
  
  if (params.query) {
    searchParams.set("query", params.query);
  }

  if (params.fromDate) {
    searchParams.set("fromDate", params.fromDate);
  }

  if (params.toDate) {
    searchParams.set("toDate", params.toDate);
  } 

  searchParams.set("page", params.page.toString());

  searchParams.set(
    "pageSize",
    params.pageSize.toString()
  );

  searchParams.set("companyId", params.companyId);
  console.log(params.status);
  searchParams.set("invoiceStatus", params.status);

  const response = await fetch(
    `${API_BASE}MachineMovement/get-machine-returns?${searchParams.toString()}`    
  );

  if (!response.ok) { 
    throw new Error("Failed to fetch Machine returns.");
  }

  return response.json();
}

export async function getMachineStatus(): Promise<MachineStatusSummary> {
  const companyId = getCompanyId();

  const res = await fetch(
    `${API_BASE}reports/status-summary?companyId=${encodeURIComponent(companyId)}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to load machine status: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}


export async function getRecentInvoices(take = 6): Promise<RecentInvoices[]> {
  const companyId = getCompanyId();

  const res = await fetch(`${API_BASE}reports/recent-invoices?take=${take}&companyId=${companyId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load recent invoices: ${res.status} ${res.statusText}`);
  }

  return res.json();
}