import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface SalesExportData {
  orderNumber: string;
  customerName: string | null;
  invoiceAmount: string | number;
  balanceAmount: string | number;
  status: string;
  date: Date | string;
  branchName: string;
  userName: string;
}

export function generateSalesPDF(data: SalesExportData[], filename: string) {
  const doc = new jsPDF("landscape");
  
  doc.setFontSize(20);
  doc.text("Virat CRM - Intelligence Report (Sales)", 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  const tableColumn = ["Order #", "Customer", "Amount (Rs)", "Balance (Rs)", "Status", "Date", "Branch", "Employee"];
  const tableRows: any[][] = [];
  
  data.forEach((item) => {
    const row = [
      item.orderNumber,
      item.customerName || "N/A",
      item.invoiceAmount,
      item.balanceAmount,
      item.status,
      item.date instanceof Date ? item.date.toLocaleDateString() : new Date(item.date).toLocaleDateString(),
      item.branchName,
      item.userName,
    ];
    tableRows.push(row);
  });
  
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 36,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] }
  });
  
  doc.save(`${filename}.pdf`);
}

export interface AttendanceExportData {
  userName: string;
  date: string;
  slab: string;
  latitude: string | number;
  longitude: string | number;
  recordedAt: Date | string;
}

export function generateAttendancePDF(data: AttendanceExportData[], filename: string) {
  const doc = new jsPDF("landscape");
  
  doc.setFontSize(20);
  doc.text("Virat CRM - Intelligence Report (Attendance)", 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  const tableColumn = ["Employee", "Date", "Time Slab", "Latitude", "Longitude", "Recorded At"];
  const tableRows: any[][] = [];
  
  data.forEach((item) => {
    const row = [
      item.userName,
      item.date,
      item.slab,
      item.latitude,
      item.longitude,
      item.recordedAt instanceof Date ? item.recordedAt.toLocaleString() : new Date(item.recordedAt).toLocaleString(),
    ];
    tableRows.push(row);
  });
  
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 36,
    theme: "striped",
    headStyles: { fillColor: [147, 51, 234] }
  });
  
  doc.save(`${filename}.pdf`);
}
