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
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = (contentDisposition.split("filename=")[1] ?? filename).replace(/"/g, "");
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
      description: "Complete product list with current stock levels across all branches.",
      icon: <Package className="w-6 h-6 text-indigo-500" />,
      endpoint: "/api/export/inventory",
      color: "bg-indigo-50 border-indigo-100",
    },
    {
      id: "sales",
      title: "Sales & Orders",
      description: "Detailed breakdown of all orders, invoice amounts, and balances.",
      icon: <IndianRupee className="w-6 h-6 text-emerald-500" />,
      endpoint: "/api/export/sales",
      color: "bg-emerald-50 border-emerald-100",
    },
    {
      id: "customers",
      title: "Customer Directory",
      description: "List of all registered customers, GST details, and assigned managers.",
      icon: <Users className="w-6 h-6 text-blue-500" />,
      endpoint: "/api/export/customers",
      color: "bg-blue-50 border-blue-100",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="px-6 py-8 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bulk Exports</h1>
        <p className="text-slate-500 mt-1">Generate high-performance Excel reports for business intelligence.</p>
      </header>

      <main className="p-6 md:p-8 flex-1 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exportCards.map((card) => (
            <div 
              key={card.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md"
            >
              <div className="p-6 flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${card.color}`}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => handleExport(card.id, card.endpoint)}
                  disabled={isExporting !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isExporting === card.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
          <div className="flex items-start gap-3">
            <div className="p-1">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold mb-1 text-blue-900">High-Performance Exports</p>
              <p className="leading-relaxed opacity-90">
                These reports are generated natively on the server and streamed directly to your browser. 
                This ensures maximum stability even when downloading thousands of records simultaneously.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
