"use client";

import { useState } from "react";
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  Download
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { cn } from "@/lib/utils";

interface ImportSummary {
  total: number;
  failed: number;
}

interface ImportError {
  row: number;
  error: string;
}

interface ImportResponse {
  summary?: ImportSummary;
  errors?: ImportError[];
  error?: string;
}

export default function AdminImportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    failed: number;
    errors: ImportError[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".xls")) {
        setFile(selectedFile);
        setResults(null);
      } else {
        toast.error("Please select a valid Excel file (.xlsx)");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/import/products", {
        method: "POST",
        body: formData,
      });

      const data = await response.json() as ImportResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to upload");
      }

      setResults(data.summary ? { ...data.summary, errors: data.errors ?? [] } : null);
      toast.success("Import processed successfully");
      setFile(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred during import";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Product Template");

    worksheet.columns = [
      { header: "Name", key: "name", width: 30 },
      { header: "SKU", key: "sku", width: 15 },
      { header: "Price", key: "price", width: 12 },
    ];

    worksheet.addRow({ name: "Sample Product", sku: "SKU123", price: 99.99 });
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFF6FF' } // Light blue
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-import-template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-32">
      <div className="flex items-center gap-6">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bulk Data Import</h1>
          <p className="text-muted-foreground mt-1 font-medium text-sm">Upload Excel files to update your catalog in bulk.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3 space-y-8">
          <div className="premium-card bg-card">
            <div className="p-6 border-b border-border bg-primary/5">
              <h2 className="text-lg font-bold flex items-center gap-2 text-primary">
                <Upload className="h-5 w-5" />
                Product Catalog Import
              </h2>
              <p className="text-xs text-muted-foreground font-semibold mt-1">Upload an Excel file to create or update products.</p>
            </div>
            <div className="p-8 space-y-6">
              <div 
                className={cn(
                  "border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center transition-all duration-300",
                  file 
                    ? "border-primary bg-primary/5 shadow-inner" 
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                )}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <label 
                  htmlFor="file-upload"
                  className="flex flex-col items-center cursor-pointer text-center group"
                >
                  {file ? (
                    <>
                      <div className="bg-primary/20 p-4 rounded-full mb-4">
                        <FileSpreadsheet className="h-10 w-10 text-primary" />
                      </div>
                      <span className="font-bold text-foreground text-lg">{file.name}</span>
                      <span className="text-xs text-muted-foreground font-bold mt-1 uppercase">{(file.size / 1024).toFixed(1)} KB</span>
                    </>
                  ) : (
                    <>
                      <div className="bg-secondary p-4 rounded-full mb-4 group-hover:bg-primary/10 transition-colors">
                        <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary" />
                      </div>
                      <span className="text-base font-bold text-foreground">Click to upload or drag and drop</span>
                      <span className="text-xs text-muted-foreground font-semibold mt-1">Excel files (.xlsx) only</span>
                    </>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || isUploading}
                  className="bg-primary text-primary-foreground rounded-xl py-6 font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-base"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Start Import"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  className="border-border text-foreground hover:bg-secondary rounded-xl py-6 font-bold transition-all text-base"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Template
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="premium-card p-6 bg-card">
            <h3 className="text-base font-bold text-foreground mb-4">Import Guidelines</h3>
            <ul className="space-y-4">
              {[
                { label: "Unique Identifier", desc: "Use the SKU as the primary key." },
                { label: "Atomic Updates", desc: "Existing SKUs will be updated automatically." },
                { label: "New Creations", desc: "Unrecognized SKUs will create new entries." },
                { label: "Header Format", desc: "Required columns: Name, SKU, Price." }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-none">{item.label}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-amber-700 text-xs font-bold leading-relaxed">
                Large files may take a few seconds to process. Please do not refresh the page during upload.
              </p>
            </div>
          </div>
        </div>
      </div>

      {results && (
        <div className="premium-card overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="p-6 border-b border-border bg-emerald-50/30">
            <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              Import Summary
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="p-6 bg-secondary/50 rounded-2xl border border-border/50">
                <div className="text-3xl font-black text-foreground tabular-nums">{results.total}</div>
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Processed</div>
              </div>
              <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100/50">
                <div className="text-3xl font-black text-red-600 tabular-nums">{results.failed}</div>
                <div className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-1">Failed</div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground">Detailed Error Report</h3>
                <div className="rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary/50 text-muted-foreground text-[11px] font-black uppercase tracking-wider">
                        <th className="px-6 py-3 text-left">Row</th>
                        <th className="px-6 py-3 text-left">Issue Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border font-medium">
                      {results.errors.map((err, i) => (
                        <tr key={i} className="hover:bg-red-50/20 transition-colors">
                          <td className="px-6 py-4 text-foreground font-bold tabular-nums">Row #{err.row}</td>
                          <td className="px-6 py-4 text-red-600 text-xs font-bold">{err.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
