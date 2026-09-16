"use client";
import { rawConfigSchema } from "shadcn/schema";
import { MachineStatusSummary, RecentInvoices, kpiSummery, InventoryItem, InvoiceRequestQuery, PaginatedResult, InvoiceLists, CreditNote, LoginRequestModel, LoginResponseModel, RevenueTrendPoint, InvoiceRevenueLists, ExcelResponse, PartsModel} from "./types";
import { error } from "console";

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

// get total items kpi card amount


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

  const response = await fetch(
    `${API_BASE}reports/invoice-lists?${searchParams.toString()}`    
  );

  if (!response.ok) { 
    throw new Error("Failed to fetch customers");
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