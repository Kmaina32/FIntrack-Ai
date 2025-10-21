import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from 'date-fns';

// A simple SVG logo as a string. In a real app, you might fetch this or have it stored differently.
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(88 52% 48%)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;


const addHeader = (doc: jsPDF) => {
    // It's tricky to directly render SVG in jsPDF without extra libraries or complex paths.
    // For simplicity, we'll just add the app name.
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FinTrack AI", 15, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Report Generated: ${format(new Date(), 'PPP')}`, 15, 26);
};

export const exportToPDF = (title: string, headers: string[], body: (string|number)[][]) => {
  const doc = new jsPDF();

  addHeader(doc);
  
  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: body,
    didDrawPage: (data) => {
      // You could add footers here if needed
    },
    headStyles: {
        fillColor: [78, 114, 87] // primary color
    },
    styles: {
        font: "helvetica",
        fontSize: 10
    }
  });

  doc.save(`${title.replace(/ /g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};

export const exportToExcel = (title: string, headers: string[], body: (string|number)[][]) => {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  // Auto-size columns
  const colWidths = headers.map((_, i) => ({
    wch: Math.max(
      headers[i].length,
      ...body.map(row => row[i]?.toString().length ?? 0)
    ) + 2
  }));
  worksheet["!cols"] = colWidths;

  XLSX.writeFile(workbook, `${title.replace(/ /g, '_')}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
};
