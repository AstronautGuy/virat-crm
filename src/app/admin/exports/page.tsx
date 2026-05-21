"use client";

import { Download, Package, Users, IndianRupee, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ExportsPage() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (type: string, endpoint: string) => {
    try {
      setIsExporting(type);

      // Instead of an invisible iframe, we use a fetch request to handle authorization
      // and process the blob, which gives us better error handling and loading states.
      const response = await fetch(endpoint, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Convert to blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to trigger download
      const link = document.createElement("a");
      link.href = url;
      // Get filename from Content-Disposition header if possible
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${type}-export.xlsx`;
      if (contentDisposition?.includes("filename=")) {
        filename = (
          contentDisposition.split("filename=")[1] ?? filename
        ).replace(/"/g, "");
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to export ${type}:`, error);
      alert(`Failed to generate ${type} export. Please try again.`);
    } finally {
      setIsExporting(null);
    }
  };

  const exportCards = [
    {
      id: "inventory",
      title: "Inventory Master",
      description:
        "Complete product list with current stock levels across all branches.",
      icon: <Package className="h-6 w-6 text-indigo-500" />,
      endpoint: "/api/export/inventory",
      color: "bg-indigo-50 border-indigo-100",
    },
    {
      id: "sales",
      title: "Sales & Orders",
      description:
        "Detailed breakdown of all orders, invoice amounts, and balances.",
      icon: <IndianRupee className="h-6 w-6 text-emerald-500" />,
      endpoint: "/api/export/sales",
      color: "bg-emerald-50 border-emerald-100",
    },
    {
      id: "customers",
      title: "Customer Directory",
      description:
        "List of all registered customers, GST details, and assigned managers.",
      icon: <Users className="h-6 w-6 text-blue-500" />,
      endpoint: "/api/export/customers",
      color: "bg-blue-50 border-blue-100",
    },
  ];

  return (
    <div className="flex h-full flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Bulk Exports
        </h1>
        <p className="mt-1 text-slate-500">
          Generate high-performance Excel reports for business intelligence.
        </p>
      </header>

      <main className="max-w-5xl flex-1 p-6 md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exportCards.map((card) => (
            <div
              key={card.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex-1 p-6">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${card.color}`}
                >
                  {card.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {card.description}
                </p>
              </div>

              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button
                  onClick={() => handleExport(card.id, card.endpoint)}
                  disabled={isExporting !== null}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                >
                  {isExporting === card.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-blue-100 bg-blue-50 p-6 text-sm text-blue-800">
          <div className="flex items-start gap-3">
            <div className="p-1">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="mb-1 font-semibold text-blue-900">
                High-Performance Exports
              </p>
              <p className="leading-relaxed opacity-90">
                These reports are generated natively on the server and streamed
                directly to your browser. This ensures maximum stability even
                when downloading thousands of records simultaneously.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
