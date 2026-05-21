"use client";

import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Download,
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
      if (
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".xls")
      ) {
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

      const data = (await response.json()) as ImportResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to upload");
      }

      setResults(
        data.summary ? { ...data.summary, errors: data.errors ?? [] } : null,
      );
      toast.success("Import processed successfully");
      setFile(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An error occurred during import";
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
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFF6FF" }, // Light blue
    };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-import-template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8 pb-32">
      <div className="flex items-center gap-6">
        <Link href="/admin">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-secondary rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Bulk Data Import
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Upload Excel files to update your catalog in bulk.
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        <div className="space-y-8 md:col-span-3">
          <div className="premium-card bg-card">
            <div className="border-border bg-primary/5 border-b p-6">
              <h2 className="text-primary flex items-center gap-2 text-lg font-bold">
                <Upload className="h-5 w-5" />
                Product Catalog Import
              </h2>
              <p className="text-muted-foreground mt-1 text-xs font-semibold">
                Upload an Excel file to create or update products.
              </p>
            </div>
            <div className="space-y-6 p-8">
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-300",
                  file
                    ? "border-primary bg-primary/5 shadow-inner"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50",
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
                  className="group flex cursor-pointer flex-col items-center text-center"
                >
                  {file ? (
                    <>
                      <div className="bg-primary/20 mb-4 rounded-full p-4">
                        <FileSpreadsheet className="text-primary h-10 w-10" />
                      </div>
                      <span className="text-foreground text-lg font-bold">
                        {file.name}
                      </span>
                      <span className="text-muted-foreground mt-1 text-xs font-bold uppercase">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="bg-secondary group-hover:bg-primary/10 mb-4 rounded-full p-4 transition-colors">
                        <Upload className="text-muted-foreground group-hover:text-primary h-10 w-10" />
                      </div>
                      <span className="text-foreground text-base font-bold">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-muted-foreground mt-1 text-xs font-semibold">
                        Excel files (.xlsx) only
                      </span>
                    </>
                  )}
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
                <Button
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  className="bg-primary text-primary-foreground shadow-primary/20 rounded-xl py-6 text-base font-bold shadow-lg transition-all hover:opacity-90"
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
                  className="border-border text-foreground hover:bg-secondary rounded-xl py-6 text-base font-bold transition-all"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Template
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 md:col-span-2">
          <div className="premium-card bg-card p-6">
            <h3 className="text-foreground mb-4 text-base font-bold">
              Import Guidelines
            </h3>
            <ul className="space-y-4">
              {[
                {
                  label: "Unique Identifier",
                  desc: "Use the SKU as the primary key.",
                },
                {
                  label: "Atomic Updates",
                  desc: "Existing SKUs will be updated automatically.",
                },
                {
                  label: "New Creations",
                  desc: "Unrecognized SKUs will create new entries.",
                },
                {
                  label: "Header Format",
                  desc: "Required columns: Name, SKU, Price.",
                },
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <div className="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-foreground text-sm leading-none font-bold">
                      {item.label}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs font-medium">
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3 rounded-xl border border-amber-100/50 bg-amber-50/50 p-4">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-xs leading-relaxed font-bold text-amber-700">
                Large files may take a few seconds to process. Please do not
                refresh the page during upload.
              </p>
            </div>
          </div>
        </div>
      </div>

      {results && (
        <div className="premium-card animate-in fade-in slide-in-from-bottom-8 overflow-hidden duration-700">
          <div className="border-border border-b bg-emerald-50/30 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
              Import Summary
            </h2>
          </div>
          <div className="p-8">
            <div className="mb-10 grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="bg-secondary/50 border-border/50 rounded-2xl border p-6">
                <div className="text-foreground text-3xl font-black tabular-nums">
                  {results.total}
                </div>
                <div className="text-muted-foreground mt-1 text-[10px] font-black tracking-widest uppercase">
                  Processed
                </div>
              </div>
              <div className="rounded-2xl border border-red-100/50 bg-red-50/50 p-6">
                <div className="text-3xl font-black text-red-600 tabular-nums">
                  {results.failed}
                </div>
                <div className="mt-1 text-[10px] font-black tracking-widest text-red-500 uppercase">
                  Failed
                </div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-foreground text-base font-bold">
                  Detailed Error Report
                </h3>
                <div className="border-border overflow-hidden rounded-2xl border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-secondary/50 text-muted-foreground text-[11px] font-black tracking-wider uppercase">
                        <th className="px-6 py-3 text-left">Row</th>
                        <th className="px-6 py-3 text-left">
                          Issue Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-border divide-y font-medium">
                      {results.errors.map((err, i) => (
                        <tr
                          key={i}
                          className="transition-colors hover:bg-red-50/20"
                        >
                          <td className="text-foreground px-6 py-4 font-bold tabular-nums">
                            Row #{err.row}
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-red-600">
                            {err.error}
                          </td>
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
