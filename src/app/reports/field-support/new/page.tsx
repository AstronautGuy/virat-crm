"use client";

import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewFieldSupportReportPage() {
  const router = useRouter();
  const { data: branches = [] } = api.inventory.getBranches.useQuery();

  const [branchId, setBranchId] = useState("");
  const [month, setMonth] = useState("");

  const [totalPoint, setTotalPoint] = useState("");
  const [totalCust, setTotalCust] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  const [items, setItems] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      srName: "",
      orderNo: "",
      customerName: "",
      product: "",
      unit: "",
      advanceAmount: "",
      adc: "",
    }))
  );

  const createReport = api.fieldSupport.create.useMutation({
    onSuccess: () => {
      toast.success("Field support report saved successfully!");
      router.push("/reports/field-support");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create report");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId || !month) {
      toast.error("Please select branch and enter month");
      return;
    }

    // Filter out completely empty rows
    const filledItems = items.filter(
      (item) =>
        item.srName ||
        item.orderNo ||
        item.customerName ||
        item.product ||
        item.unit ||
        item.advanceAmount ||
        item.adc
    );

    createReport.mutate({
      branchId: parseInt(branchId),
      month,
      totalPoint,
      totalCust,
      totalAmount,
      items: filledItems,
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value } as any;
    setItems(newItems);
  };

  return (
    <DashboardLayout>
      <FeatureGate featureKey="field-support">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-8 pb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/reports/field-support"
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
                  <FileText className="h-8 w-8 text-indigo-600" />
                  <span>New Field Support Report</span>
                </h1>
                <p className="mt-2 text-lg text-gray-500">
                  Fill in the details for TM & Above field support.
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={createReport.isPending}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              {createReport.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Save Report
            </button>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Report Metadata
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-gray-700">Month</label>
                <input
                  type="text"
                  placeholder="e.g. July-26"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  Branch
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 uppercase text-gray-500 text-xs">
                <tr>
                  <th className="px-2 py-3 border">SL</th>
                  <th className="px-2 py-3 border">SR/GL NAME</th>
                  <th className="px-2 py-3 border">ORDER NO.</th>
                  <th className="px-2 py-3 border">CUSTOMER NAME</th>
                  <th className="px-2 py-3 border">PRODUCT</th>
                  <th className="px-2 py-3 border">UNIT</th>
                  <th className="px-2 py-3 border">ADVANCE AMOUNT</th>
                  <th className="px-2 py-3 border">A/D/C</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1 border text-center font-bold">{item.id}</td>
                    <td className="p-0 border">
                      <input
                        type="text"
                        value={item.srName}
                        onChange={(e) => updateItem(idx, "srName", e.target.value)}
                        className="w-full border-0 px-2 py-2 text-sm focus:ring-1 focus:ring-inset focus:ring-indigo-600"
                      />
                    </td>
                    <td className="p-0 border">
                      <input
                        type="text"
                        value={item.orderNo}
                        onChange={(e) => updateItem(idx, "orderNo", e.target.value)}
                        className="w-full border-0 px-2 py-2 text-sm focus:ring-1 focus:ring-inset focus:ring-indigo-600"
                      />
                    </td>
                    <td className="p-0 border">
                      <input
                        type="text"
                        value={item.customerName}
                        onChange={(e) => updateItem(idx, "customerName", e.target.value)}
                        className="w-full border-0 px-2 py-2 text-sm focus:ring-1 focus:ring-inset focus:ring-indigo-600"
                      />
                    </td>
                    <td className="p-0 border">
                      <input
                        type="text"
                        value={item.product}
                        onChange={(e) => updateItem(idx, "product", e.target.value)}
                        className="w-full border-0 px-2 py-2 text-sm focus:ring-1 focus:ring-inset focus:ring-indigo-600"
                      />
                    </td>
                    <td className="p-0 border">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateItem(idx, "unit", e.target.value)}
                        className="w-full border-0 px-2 py-2 text-sm focus:ring-1 focus:ring-inset focus:ring-indigo-600"
                      />
                    </td>
                    <td className="p-0 border">
                      <input
                        type="text"
                        value={item.advanceAmount}
                        onChange={(e) => updateItem(idx, "advanceAmount", e.target.value)}
                        className="w-full border-0 px-2 py-2 text-sm focus:ring-1 focus:ring-inset focus:ring-indigo-600"
                      />
                    </td>
                    <td className="p-0 border">
                      <input
                        type="text"
                        value={item.adc}
                        onChange={(e) => updateItem(idx, "adc", e.target.value)}
                        className="w-full border-0 px-2 py-2 text-sm focus:ring-1 focus:ring-inset focus:ring-indigo-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Summary</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-gray-700">POINT</label>
                <input
                  type="text"
                  value={totalPoint}
                  onChange={(e) => setTotalPoint(e.target.value)}
                  className="rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-gray-700">CUST</label>
                <input
                  type="text"
                  value={totalCust}
                  onChange={(e) => setTotalCust(e.target.value)}
                  className="rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-gray-700">AMOUNT</label>
                <input
                  type="text"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="rounded-xl border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </form>
      </FeatureGate>
    </DashboardLayout>
  );
}
