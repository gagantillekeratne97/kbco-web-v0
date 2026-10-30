"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import type { Invoice } from "@/lib/types";

/**
 * Tax invoice PDF that reproduces the Crystal Reports layout
 * (e.g. 26SEP_FDOC_00259.pdf).
 *
 * The reference PDF is US Letter (612 x 792 pt), so everything is drawn in
 * points with coordinates measured from the reference. All "top" values are
 * the top of the text box measured from the top of the page.
 *
 * Fonts in the reference:
 *   - Courier New (bold labels 8pt, values 8.4pt)  -> jsPDF "courier"
 *   - Arial (title, notes, signature block)         -> jsPDF "helvetica"
 */

export type DocumentVariant = "invoice" | "creditNote";

interface InvoicePDFProps {
  invoice: Invoice;
  /** Changes the printed title and labels. Defaults to a tax invoice. */
  variant?: DocumentVariant;
}

// Wording that changes between the two documents. The label lengths matter:
// they have to fit before the value column, so keep them about this long.
const DOC_TEXT: Record<
  DocumentVariant,
  { title: string; dateLabel: string; numberLabel: string; name: string; referenceNumber?: string; }
> = {
  invoice: {
    title: "TAX INVOICE",
    dateLabel: "Date Of Invoice :",
    numberLabel: "Tax Invoice No :",
    name: "Invoice",
  },
  creditNote: {
    title: "CREDIT NOTE",
    dateLabel: "Credit Note Date :",
    numberLabel: "Credit Note No :",
    referenceNumber: "Invoice Reference :",
    name: "Credit Note",    
  },
};

// ---------------------------------------------------------------------------
// Page geometry (points)
// ---------------------------------------------------------------------------
const PAGE_W = 612;
const PAGE_H = 792;
const LEFT = 24;
const RIGHT = 588;
const LINE_H = 9.6; // line pitch used by wrapped values
const BOTTOM_LIMIT = PAGE_H - 36;

// Distance from the glyph-box top to the baseline, as a fraction of font size.
const BASE = { courier: 0.7, helvetica: 0.788 } as const;

type Face = keyof typeof BASE;

interface TextOpts {
  face?: Face;
  bold?: boolean;
  size?: number;
  align?: "left" | "center" | "right";
}

// ---------------------------------------------------------------------------
// Formatters
// ---------------------------------------------------------------------------
const money = (value: number) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fixed2 = (value: number) => Number(value || 0).toFixed(2);

/** MM/DD/YYYY or MM-DD-YYYY. Already formatted values only get the separator swapped. */
const formatDate = (value: string | undefined, sep: "/" | "-") => {
  if (!value) return "";

  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(value)) {
    return value.replace(/[-/]/g, sep);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const mm = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getUTCDate()).padStart(2, "0");

  return [mm, dd, parsed.getUTCFullYear()].join(sep);
};

// ---------------------------------------------------------------------------
// PDF builder
// ---------------------------------------------------------------------------
export function buildInvoicePDF(
  invoice: Invoice,
  variant: DocumentVariant = "invoice"
): jsPDF {
  const text = DOC_TEXT[variant];

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const supplier = invoice.supplier;
  const purchaser = invoice.purchaser;
  const summary = invoice.financialDetails;

  // ---- drawing helpers ----------------------------------------------------

  const txt = (text: string, x: number, top: number, o: TextOpts = {}) => {
    const { face = "courier", bold = false, size = 8.4, align = "left" } = o;

    doc.setFont(face, bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(0, 0, 0);
    doc.text(text, x, top + size * BASE[face], { align });
  };

  const wrap = (value: string, width: number, size = 8.4): string[] => {
    doc.setFont("courier", "normal");
    doc.setFontSize(size);
    return value ? (doc.splitTextToSize(value, width) as string[]) : [];
  };

  /** Draws wrapped Courier text, returns the number of lines drawn. */
  const wrapped = (
    value: string | number | undefined,
    x: number,
    top: number,
    width: number,
    size = 8.4
  ) => {
    const lines = wrap(String(value ?? ""), width, size);
    lines.forEach((line, i) => txt(line, x, top + i * LINE_H, { size }));
    return lines.length;
  };

  const rule = (x1: number, x2: number, y: number, width = 1) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(width);
    doc.line(x1, y, x2, y);
  };

  const dotted = (x1: number, x2: number, y: number) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.setLineDashPattern([0.5, 1.6], 0);
    doc.line(x1, y, x2, y);
    doc.setLineDashPattern([], 0);
  };

  // =========================================================================
  // TITLE
  // (top ~84pt and bottom ~130pt are left clear for the company letterhead)
  // =========================================================================
  txt(text.title, 312, 84.1, { face: "helvetica", bold: true, size: 8.8, align: "center" });

  // =========================================================================
  // HEADER FIELDS (two columns)
  // Values wrap at 130pt. If a value wraps beyond its normal line count,
  // everything below it in that column moves down.
  // =========================================================================
  const VALUE_W = 130;
  const COL = {
    L: { label: 24, value: 120 },
    R: { label: 348, value: 456 },
  } as const;

  const shift = { L: 0, R: 0 };

  const field = (
    side: "L" | "R",
    label: string,
    labelTop: number,
    valueTop: number,
    value: string | number | undefined,
    normalLines = 1
  ) => {
    txt(label, COL[side].label, labelTop + shift[side], { bold: true, size: 8 });

    const used = wrapped(value, COL[side].value, valueTop + shift[side], VALUE_W);
    shift[side] += Math.max(0, used - normalLines) * LINE_H;
  };

  // left column
  field("L", text.dateLabel, 107.6, 107.0, formatDate(invoice.invoiceDate, "/"));
  field("L", "Supplier's TIN :", 125.6, 125.0, supplier.tin);
  field("L", "Supplier's Name :", 149.6, 150.0, supplier.name, 2);
  field("L", "Address :", 173.6, 172.9, supplier.address, 2);
  field("L", "Telephone No:", 191.6, 192.0, supplier.telephoneNo || "");
  field("L", "Date Of Supply :", 215.6, 220.0, formatDate(invoice.dateOfSupply, "-"));
  field("L", "Po No :", 245.6, 240.0, invoice.poNo || "");
  field("L", "Invoice Period :", 263.6, 263.0, invoice.invoicePeriod);

  // right column
  // right column
  field("R", text.numberLabel, 107.6, 107.0, invoice.invoiceNo); 
  // credit notes only: show the original invoice, then push the rest of the column down
  if (text.referenceNumber) {
    field("R", text.referenceNumber, 125.6, 125.0, invoice.invoiceReference);
    shift.R += 18; // one row (same pitch as the TIN row), keeps everything below from overlapping
  }
  field("R", "Purchaser's TIN :", 125.6, 125.0, purchaser.tin);
  // ...the rest stays unchanged
  field("R", "Purchaser's TIN :", 125.6, 125.0, purchaser.tin);
  field("R", "Purchaser's Name :", 149.6, 150.9, purchaser.name, 2);
  field("R", "Address :", 173.6, 175.9, purchaser.address, 2);
  field("R", "Telephone No :", 203.6, 202.0, purchaser.telephoneNo || "");
  field("R", "Customer Code :", 227.6, 225.0, invoice.customerCode);
  field("R", "Place of Supply :", 251.6, 250.9, invoice.placeOfSupply, 4);

  // =========================================================================
  // ITEM TABLE (manual so it matches the Crystal look: two rules, no grid)
  // =========================================================================
  const labelTops: Record<number, number> = {};

  const drawTableHeader = (top: number) => {
    const o = { bold: true, size: 7 };

    rule(LEFT, RIGHT, top, 1);
    txt("Serial Number", 30, top + 2.3, o);
    txt("(Reference)", 30, top + 11.4, o);
    txt("Description", 114, top + 2.3, o);
    txt("Location", 228, top + 2.3, o);
    txt("Start MR", 445.2, top + 2.3, { ...o, align: "center" });
    txt("End MR", 521.4, top + 2.3, { ...o, align: "center" });
    txt("Copies", 569.4, top + 2.3, { ...o, align: "center" });
    rule(LEFT, RIGHT, top + 18, 1);

    return top + 18;
  };

  const tableTop = 305.6 + Math.max(shift.L, shift.R);
  labelTops[1] = tableTop - LINE_H;

  let y = drawTableHeader(tableTop);

  invoice.items.forEach((item) => {
    const serialLines = wrap(String(item.serialNumber ?? ""), 56);
    const descLines = wrap(String(item.description ?? ""), 120);
    const locLines = wrap(String(item.location ?? ""), 190);

    const lineCount = Math.max(serialLines.length, descLines.length, locLines.length, 1);
    const rowH = lineCount * LINE_H + 7.2;

    if (y + rowH > BOTTOM_LIMIT - 20) {
      doc.addPage();
      labelTops[doc.getNumberOfPages()] = 40 - LINE_H;
      y = drawTableHeader(40);
    }

    const top = y + 4;

    serialLines.forEach((l, i) => txt(l, 24, top + i * LINE_H));
    descLines.forEach((l, i) => txt(l, 84, top + i * LINE_H));
    locLines.forEach((l, i) => txt(l, 228, top + i * LINE_H));

    txt(String(item.startMR ?? ""), 443.4, top, { align: "center" });
    txt(String(item.endMR ?? ""), 517.1, top, { align: "center" });
    txt(String(item.copies ?? ""), 567.6, top, { align: "center" });

    y += rowH;
  });

  // =========================================================================
  // RATE BOX + TOTALS + NOTES + SIGNATURE BLOCK
  // Everything below is laid out relative to blockTop (350pt in the reference)
  // so the whole block can move together, or jump to a fresh page.
  // =========================================================================
  const REF_TOP = 350;
  const BLOCK_H = 310;

  let blockTop = y;

  if (blockTop + BLOCK_H > BOTTOM_LIMIT) {
    doc.addPage();
    blockTop = 60;
  }

  const Y = (refY: number) => refY - REF_TOP + blockTop;

  // ---- rate box -----------------------------------------------------------
  // Rate slabs come from the backend (one row per range:
  // range / rate / billed copies / amount), not from the item rows.
  const rateRows = invoice.rateSlabs ?? [];

  const boxH = 42.9 + Math.max(0, rateRows.length - 1) * 13;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.rect(22.5, Y(350), 321, boxH);

  const underlined = (label: string, x: number, w: number, top: number, lineY: number) => {
    txt(label, x, top, { bold: true, size: 7.9 });
    doc.setFillColor(0, 0, 0);
    doc.rect(x, lineY, w, 0.8, "F");
  };

  underlined("range", 27, 23.8, Y(364.4), Y(371.9));
  underlined("rate", 160.7, 19, Y(365.4), Y(372.8));
  underlined("Copies", 204, 28.5, Y(365.4), Y(372.8));
  underlined("Total Amount", 264, 57, Y(365.4), Y(372.8));

  rateRows.forEach((row, i) => {
    const rowShift = i * 13;

    txt(String(row.range), 27, Y(376.9) + rowShift);
    txt(fixed2(row.rate), 160.7, Y(378.7) + rowShift);
    txt(String(row.copies), 204, Y(378.7) + rowShift);
    txt(fixed2(row.amount), 264, Y(376.9) + rowShift);
  });

  // ---- totals -------------------------------------------------------------
  const labelRight = 492.4;
  const valueRight = 582.1;

  // Each value shares its label's baseline. The sizes differ (labels 7.9,
  // values 8.4 to 9.4), so the value's top is shifted to keep them on one line.
  const LABEL_SIZE = 7.9;

  const totals: { label: string; value: string; labelTop: number; size: number; bold?: boolean }[] = [
    { label: "Total Count of Copies", value: String(summary.totalCountOfCopies ?? 0), labelTop: 365.4, size: 8.4 },
    { label: "Total Value of Supply:", value: money(summary.totalValueOfSupply), labelTop: 383.4, size: 9.4 },
    { label: "Discount", value: money(summary.discount), labelTop: 401.4, size: 9.4 },
    { label: "SSCL", value: money(summary.sscl), labelTop: 419.4, size: 9.4 },
    { label: "Tax Amount", value: money(summary.taxAmount), labelTop: 437.4, size: 9.4 },
    { label: "Total Amount Value", value: money(summary.totalAmountValue), labelTop: 461.4, size: 8.8, bold: true },
  ];

  totals.forEach((t) => {
    const valueTop = t.labelTop + (LABEL_SIZE - t.size) * BASE.courier;

    txt(t.label, labelRight, Y(t.labelTop), { bold: true, size: LABEL_SIZE, align: "right" });
    txt(t.value, valueRight, Y(valueTop), { bold: t.bold, size: t.size, align: "right" });
  });

  rule(504, 582, Y(458), 1); // above the final amount
  rule(504, 582, Y(479), 1); // double underline
  rule(504, 582, Y(481), 1);

  // ---- payment notes (Arial) ---------------------------------------------
  // Line 1 mixes sizes: the supplier name is larger and bold.
  const NOTE_SIZE = 7.2;
  const noteBaseline = (top: number) => top + NOTE_SIZE * BASE.helvetica;

  const segments: { t: string; bold?: boolean; size: number }[] = [
    { t: '(1). All cheques to be Drawn In Favour of "', size: NOTE_SIZE },
    { t: supplier.name.replace(/\.\s*$/, ""), bold: true, size: 8.8 },
    { t: ".", bold: true, size: 7 },
    { t: '"', size: NOTE_SIZE },
    { t: " and Crossed ", size: NOTE_SIZE },
    { t: "ACCOUNT PAYEE", bold: true, size: 7 },
  ];

  let noteX = 21.2;
  segments.forEach((s) => {
    doc.setFont("helvetica", s.bold ? "bold" : "normal");
    doc.setFontSize(s.size);
    doc.setTextColor(0, 0, 0);
    doc.text(s.t, noteX, noteBaseline(Y(517.0)));
    noteX += doc.getTextWidth(s.t);
  });

  const notes: [string, number][] = [
    ["(2). Please indicate invoice number with payment and obtain an official receipt .", 526.8],
    ["(3). Interest at 2% per month will be charged on OVERDUE ACCOUNTS.", 536.1],
    ["(4). In order to maintain uninterrupted services, please ensure prompt settlement of dues.", 545.3],
  ];

  notes.forEach(([text, top]) =>
    txt(text, 21.2, Y(top), { face: "helvetica", size: NOTE_SIZE })
  );

  // ---- receipt confirmation + signature block ------------------------------
  const sig = { face: "helvetica" as const, size: 8.1 };

  txt("Received the invoice", 24, Y(569.6), { face: "helvetica", bold: true, size: 7.8 });
  txt("Details checked and found correct.", 24, Y(580.4), { face: "helvetica", bold: true, size: 7.8 });
  txt(supplier.name, RIGHT, Y(581.3), { face: "helvetica", bold: true, size: 6.9, align: "right" });

  // The reference staggers labels and dotted lines between the two columns;
  // the offsets below are copied as-is.
  txt("Name", 30, Y(605.0), sig);
  txt(":", 84, Y(605.0), sig);
  dotted(90, 179.8, Y(611.0));

  txt("N.I.C.No :", 186, Y(617.0), sig);
  dotted(252, 341.8, Y(629.0));

  txt("Designation :", 30, Y(623.0), sig);
  dotted(90, 179.8, Y(629.0));

  txt("Date :", 186, Y(635.0), sig);
  dotted(252, 341.8, Y(654.8));

  txt("Signature :", 30, Y(641.0), sig);
  dotted(90, 179.8, Y(654.4));

  dotted(462, 583.8, Y(626.4));
  txt("Authorized Signatory", 582, Y(640.9), { face: "helvetica", size: 7.2, align: "right" });

  // =========================================================================
  // "Page n of N" (sits just above the item table header)
  // =========================================================================
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    txt(`Page ${page} of ${pageCount}`, 584, labelTops[page] ?? 30, {
      bold: true,
      size: 7.9,
      align: "right",
    });
  }

  return doc;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function InvoicePDF({
  invoice,
  variant = "invoice",
}: InvoicePDFProps) {
  const [loading, setLoading] = useState(false);

  const generatePDF = (action: "preview" | "download") => {
    setLoading(true);

    try {
      const doc = buildInvoicePDF(invoice, variant);

      const filename = `${(invoice.invoiceNo || "invoice").replace(
        /[^a-zA-Z0-9-_]/g,
        "_"
      )}.pdf`;

      if (action === "download") {
        doc.save(filename);
      } else {
        const url = URL.createObjectURL(doc.output("blob"));
        const popup = window.open(url, "_blank");

        if (popup) {
          window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } else {
          URL.revokeObjectURL(url);
          alert("Please allow pop-ups to preview the PDF.");
        }
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Could not generate the invoice PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        disabled={loading}
        onClick={() => generatePDF("preview")}
        className="rounded-md border border-gray-400 bg-white px-4 py-2 text-sm text-black hover:bg-gray-100 disabled:opacity-50"
      >
        {loading ? "Generating..." : `Preview ${DOC_TEXT[variant].name}`}
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => generatePDF("download")}
        className="rounded-md border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
      >
        Download {DOC_TEXT[variant].name}
      </button>
    </div>
  );
}