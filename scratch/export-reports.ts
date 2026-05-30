import fs from "fs";
import path from "path";

async function generateSampleExports() {
  const reportsDir = path.join(process.cwd(), ".temp-reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Sample CSV
  const dummyCSV = `Date,Order,Revenue\n2026-05-30,ORD-001,150.00\n`;
  const csvPath = path.join(reportsDir, "sample_report.csv");
  fs.writeFileSync(csvPath, dummyCSV);

  // Sample PDF (base64 decoded)
  const dummyPDF = `%PDF-1.4\n1 0 obj\n<< /Title (Report) >>\nendobj\n`;
  const pdfPath = path.join(reportsDir, "sample_report.pdf");
  fs.writeFileSync(pdfPath, dummyPDF);

  console.log("Sample exports generated successfully in .temp-reports/");
}

generateSampleExports().catch(console.error);
