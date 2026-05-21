import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface SalesExportData {
  orderNumber: string;
  customerName: string | null;
  invoiceAmount: string | number;
  balanceAmount: string | number;
  status: string;
  date: Date | string;
  branchName: string;
  userName: string;
}

export async function generateSalesXLSX(
  data: SalesExportData[],
  filename: string,
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Sales Report");

  // Define Columns
  sheet.columns = [
    { header: "Order #", key: "orderNumber", width: 15 },
    { header: "Customer", key: "customerName", width: 25 },
    { header: "Amount", key: "invoiceAmount", width: 15 },
    { header: "Balance", key: "balanceAmount", width: 15 },
    { header: "Status", key: "status", width: 12 },
    { header: "Date", key: "date", width: 20 },
    { header: "Branch", key: "branchName", width: 20 },
    { header: "Employee", key: "userName", width: 20 },
  ];

  // Styling Header
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "F3F4F6" },
  };

  // Add Data
  data.forEach((item) => {
    sheet.addRow({
      ...item,
      date:
        item.date instanceof Date
          ? item.date.toLocaleString()
          : String(item.date),
      invoiceAmount:
        typeof item.invoiceAmount === "string"
          ? parseFloat(item.invoiceAmount)
          : item.invoiceAmount,
      balanceAmount:
        typeof item.balanceAmount === "string"
          ? parseFloat(item.balanceAmount)
          : item.balanceAmount,
    });
  });

  // Formatting Currency Columns
  sheet.getColumn("invoiceAmount").numFmt = '"₹"#,##0.00';
  sheet.getColumn("balanceAmount").numFmt = '"₹"#,##0.00';

  // Generate and Save
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
}

interface AttendanceExportData {
  userName: string;
  date: string;
  recordedAt: Date | string;
}

export async function generateAttendanceXLSX(
  data: AttendanceExportData[],
  filename: string,
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Attendance Report");

  sheet.columns = [
    { header: "Employee", key: "userName", width: 25 },
    { header: "Date", key: "date", width: 15 },
    { header: "Recorded At", key: "recordedAt", width: 20 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "F3F4F6" },
  };

  data.forEach((item) => {
    sheet.addRow({
      ...item,
      recordedAt:
        item.recordedAt instanceof Date
          ? item.recordedAt.toLocaleString()
          : String(item.recordedAt),
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${filename}.xlsx`);
}
