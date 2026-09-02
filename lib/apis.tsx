import { rawConfigSchema } from "shadcn/schema";
import { MachineStatusSummary, RecentInvoices, kpiSummery, InventoryItem, InvoiceRequestQuery, PaginatedResult, InvoiceLists, CreditNote, LoginRequestModel, LoginResponseModel, RevenueTrendPoint} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

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
export async function loginUser(payload: LoginRequestModel): Promise<LoginResponseModel> { 
  const response = await fetch(`${API_BASE}account/login-user`, {
    method: "POST", 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify(payload)
  });  

  if (!response.ok) {
    // Even non-2xx responses from your API return a LoginResponseModel body,
    // so try to parse it before falling back to a generic error.
    try {
      return (await response.json()) as LoginResponseModel;
    } catch {
      throw new Error(`Login request failed with status ${response.status}`);
    }
  }

  return (await response.json()) as LoginResponseModel;
}

export async function getKpiSummery(): Promise<kpiSummery> {       
    const response = await fetch(`${API_BASE}reports/kpis`, { 
        cache: "no-store", // Disable caching for fresh data on each request
    });        

     if (!response.ok) {
        throw new Error(`Failed to fetch KPI summary: ${response.status} ${response.statusText}`);        
    } 

    const data = await response.json();

    console.log("RAW API RESPONSE:", JSON.stringify(data, null, 2)); // 👈 temp debug

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

  const response = await fetch(
    `${API_BASE}reports/cancelled-invoice-lists?${searchParams.toString()}`    
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

  const response = await fetch(
    `${API_BASE}reports/invoice-lists?${searchParams.toString()}`    
  );

  if (!response.ok) { 
    throw new Error("Failed to fetch customers");
  }

  return response.json();
}


export async function getMachineStatus(): Promise<MachineStatusSummary> {
  const res = await fetch(`${API_BASE}reports/status-summary`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load machine status: ${res.status} ${res.statusText}`);
  }

  return res.json();
}


export async function getRecentInvoices(take = 6): Promise<RecentInvoices[]> {
  const res = await fetch(`${API_BASE}reports/recent-invoices?take=${take}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to load recent invoices: ${res.status} ${res.statusText}`);
  }

  return res.json();
}