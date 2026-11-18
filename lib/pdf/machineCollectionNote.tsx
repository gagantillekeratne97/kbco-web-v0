import type { MachineReturnStoresDetails } from "@/components/machine-return/MachineReturnStoresModal";

interface PrintArgs {
    returnId: string;
    requestDate: string; // already formatted for display
    details?: MachineReturnStoresDetails;
    companyName: string;
}

type Field = { label: string; value?: string; wide?: boolean };

const dash = (v?: string) => (v && v.trim() !== "" ? v.trim() : "-");

export async function printMachineCollectionNote({
                                                     returnId,
                                                     requestDate,
                                                     details: d,
                                                     companyName,
                                                 }: PrintArgs) {
    // Loaded on demand so jsPDF stays out of the main bundle (and SSR)
    debugger;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const M = 15;
    const contentW = pageW - M * 2;
    const colGap = 6;
    const colW = (contentW - colGap) / 2;
    let y = M;

    /* ---------- helpers ---------- */

    const ensureSpace = (h: number) => {
        if (y + h > pageH - M) {
            doc.addPage();
            y = M;
        }
    };

    const section = (title: string) => {
        ensureSpace(16);
        y += 3;
        doc.setFillColor(241, 245, 249);
        doc.rect(M, y, contentW, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(title.toUpperCase(), M + 2, y + 4.8);
        y += 11;
    };

    const fields = (items: Field[]) => {
        // Pair non-wide fields two per row; wide fields get a full row
        const rows: Field[][] = [];
        for (let i = 0; i < items.length; i++) {
            const f = items[i];
            const next = items[i + 1];
            if (!f.wide && next && !next.wide) {
                rows.push([f, next]);
                i++;
            } else {
                rows.push([f]);
            }
        }

        for (const row of rows) {
            const widthOf = (f: Field) => (f.wide || row.length === 1 ? contentW : colW);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            const lines = row.map((f) =>
                doc.splitTextToSize(dash(f.value), widthOf(f)) as string[]
            );
            const rowH = 4 + Math.max(...lines.map((l) => l.length)) * 4.6 + 3;

            ensureSpace(rowH);

            row.forEach((f, idx) => {
                const x = M + idx * (colW + colGap);

                doc.setFont("helvetica", "normal");
                doc.setFontSize(8);
                doc.setTextColor(100, 116, 139);
                doc.text(f.label.toUpperCase(), x, y);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(15, 23, 42);
                doc.text(lines[idx], x, y + 4.6);
            });

            y += rowH;
        }
    };

    /* ---------- header ---------- */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42);
    doc.text(companyName, M, y + 5);

    doc.setFontSize(13);
    doc.text("MACHINE COLLECTION NOTE", pageW - M, y + 5, { align: "right" });

    y += 10;
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.6);
    doc.line(M, y, pageW - M, y);
    y += 2;

    /* ---------- body ---------- */

    section("Reference");
    fields([
        { label: "Machine Return ID", value: returnId },
        { label: "Return Request Date", value: requestDate },
        { label: "P-Number", value: d?.machineRefNumber },
    ]);

    section("Customer Details");
    fields([
        { label: "Customer Code", value: d?.customerCode },
        { label: "Customer Name", value: d?.customerName },
        { label: "Customer Address", value: d?.address, wide: true },
    ]);

    section("Machine");
    fields([
        { label: "Serial Number", value: d?.serialNo },
        { label: "Machine Model", value: d?.model },
    ]);

    section("Contact Details");
    fields([
        { label: "Contact Person", value: d?.contactPerson },
        { label: "Contact Number", value: d?.contactNumber },
    ]);

    section("Pick Up");
    fields([
        { label: "Pick Up Location (Machine Location)", value: d?.pickUpLocation, wide: true },
    ]);

    /* ---------- signatures ---------- */

    ensureSpace(45);
    y += 18;

    const sigW = (contentW - 2 * colGap) / 3;
    const sigs = ["Collected By", "Customer Representative", "Stores Received By"];

    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.3);

    sigs.forEach((label, i) => {
        const x = M + i * (sigW + colGap);
        doc.line(x, y, x + sigW, y);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(label, x, y + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("Name:", x, y + 11);
        doc.text("Date:", x, y + 17);
    });

    /* ---------- footer (every page) ---------- */

    const printedOn = new Date().toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`Printed on ${printedOn}`, M, pageH - 8);
        doc.text(`Page ${p} of ${pageCount}`, pageW - M, pageH - 8, { align: "right" });
    }

    /* ---------- open print dialog (fallback: download) ---------- */

    doc.autoPrint();
    const url = String(doc.output("bloburl"));
    const win = window.open(url, "_blank");

    if (!win) {
        doc.save(`Machine-Collection-${returnId}.pdf`);
    }
}