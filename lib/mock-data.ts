import { InventoryItem } from "./types";
// Placeholder data shaped like what your ASP.NET Core Web API should return.
// Replace each of these with a fetch()/react-query call to your endpoints, e.g.
//   GET /api/dashboard/kpis
//   GET /api/dashboard/revenue-trend?range=30d
//   GET /api/invoices/recent
//   GET /api/machines/status-summary

export type Invoice = {
  id: string;
  invoiceNo: string;
  client: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue" | "Draft";
};

export const inventoryItems: InventoryItem[] = [
  { id: "1", sku: "MTR-0021", name: "Drive Motor 2HP", category: "Motors", quantity: 42, unit: "pcs", location: "Warehouse A", status: "In Stock", lastUpdated: "2026-07-30" },
  { id: "2", sku: "BLT-0104", name: "Conveyor Belt 5m", category: "Belts", quantity: 6, unit: "pcs", location: "Warehouse B", status: "Low Stock", lastUpdated: "2026-07-28" },
  { id: "3", sku: "SNS-0339", name: "Proximity Sensor", category: "Sensors", quantity: 0, unit: "pcs", location: "Warehouse A", status: "Out of Stock", lastUpdated: "2026-07-25" },
  { id: "4", sku: "FLT-0087", name: "Hydraulic Filter", category: "Filters", quantity: 118, unit: "pcs", location: "Warehouse C", status: "In Stock", lastUpdated: "2026-08-01" },
  { id: "5", sku: "BRG-0012", name: "Ball Bearing 6203", category: "Bearings", quantity: 15, unit: "pcs", location: "Warehouse A", status: "Low Stock", lastUpdated: "2026-07-29" },
  { id: "6", sku: "CBL-0450", name: "Power Cable 3-core", category: "Cables", quantity: 260, unit: "m", location: "Warehouse B", status: "In Stock", lastUpdated: "2026-07-31" },
  { id: "7", sku: "VLV-0203", name: "Solenoid Valve", category: "Valves", quantity: 3, unit: "pcs", location: "Warehouse C", status: "Low Stock", lastUpdated: "2026-07-22" },
  { id: "8", sku: "PNL-0017", name: "Control Panel Unit", category: "Electronics", quantity: 0, unit: "pcs", location: "Warehouse A", status: "Out of Stock", lastUpdated: "2026-07-15" },
];

export const recentInvoices: Invoice[] = [
  { id: "1", invoiceNo: "INV-2041", client: "Colombo Textiles Ltd", date: "2026-08-01", amount: 128500, status: "Paid" },
  { id: "2", invoiceNo: "INV-2040", client: "Kandy Steel Works", date: "2026-07-31", amount: 64200, status: "Pending" },
  { id: "3", invoiceNo: "INV-2039", client: "Galle Beverages Co", date: "2026-07-30", amount: 212000, status: "Overdue" },
  { id: "4", invoiceNo: "INV-2038", client: "Negombo Fisheries", date: "2026-07-29", amount: 45900, status: "Paid" },
  { id: "5", invoiceNo: "INV-2037", client: "Jaffna AgroTech", date: "2026-07-28", amount: 98750, status: "Draft" },
  { id: "6", invoiceNo: "INV-2036", client: "Matara Ceramics", date: "2026-07-27", amount: 156300, status: "Paid" },
];

export const revenueTrend = [
  { month: "Feb", revenue: 182000 },
  { month: "Mar", revenue: 210500 },
  { month: "Apr", revenue: 198000 },
  { month: "May", revenue: 245800 },
  { month: "Jun", revenue: 231200 },
  { month: "Jul", revenue: 268900 },
  { month: "Aug", revenue: 254000 },
];

export const machineStatus = {
  newlyInstalled: { count: 34, total: 60 },
  returns: { count: 9, total: 60 },
  disposed: { count: 5, total: 60 },
};

export const kpis = {
  invoiceRevenue: { value: 1284500, deltaPct: 8.2 },
  creditNotes: { value: 42, deltaPct: -3.1 },
  activeMachines: { value: 318, deltaPct: 4.6 },
  newInvoices: { value: 27, deltaPct: 12.4 },
};
