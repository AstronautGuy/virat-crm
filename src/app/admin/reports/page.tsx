"use client";

import { FeatureGate } from "@/app/_components/auth/FeatureGate";

import { useState } from "react";
import { api } from "@/trpc/react";
import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { 
  BarChart3, 
  Download, 
  Users, 
  User as UserIcon, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSalesXLSX, generateAttendanceXLSX } from "@/lib/excel";
import { type LucideIcon } from "lucide-react";

interface YearlyStat {
  year: number;
  revenue: number;
  orders: number;
  visits: number;
}

const PRESETS = [
  { value: "today", label: "Daily" },
  { value: "30d", label: "Monthly" },
  { value: "quarter", label: "Quarterly" },
  { value: "year", label: "Yearly" },
  { value: "all", label: "Lifetime" },
] as const;

const SCOPES = [
  { value: "individual", label: "Individual", icon: UserIcon },
  { value: "team", label: "Immediate Team", icon: Users },
  { value: "management", label: "Full Subtree", icon: Layers },
] as const;

export default function ReportsPage() {
  const [preset, setPreset] = useState<"today" | "7d" | "30d" | "quarter" | "year" | "all">("30d");
  const [scope, setScope] = useState<"individual" | "team" | "management" | "branch">("individual");
  const [targetId, setTargetId] = useState<string | null>(null);

  const { data: selectableUsers } = api.reports.getSelectableUsers.useQuery();
  const { data: reportData, isLoading } = api.reports.getReportData.useQuery(
    { 
      preset, 
      scope, 
      targetId: targetId ?? undefined 
    },
    { enabled: !!scope }
  );

  const handleDownloadSales = async () => {
    if (!reportData?.sales) return;
    const filename = `Sales_Report_${scope}_${preset}_${new Date().toISOString().split('T')[0]}`;
    await generateSalesXLSX(reportData.sales, filename);
  };

  const handleDownloadAttendance = async () => {
    if (!reportData?.attendance) return;
    const filename = `Attendance_Report_${scope}_${preset}_${new Date().toISOString().split('T')[0]}`;
    await generateAttendanceXLSX(reportData.attendance, filename);
  };

  return (
    <DashboardLayout>
      <FeatureGate featureKey="reports">
        <div className="flex flex-col space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Intelligence Reports</h1>
          <p className="mt-2 text-lg text-gray-500">Generate and export deep-dive performance insights.</p>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Frequency Selection */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-blue-600 font-semibold">
              <Calendar className="w-5 h-5" />
              <span>Timeframe</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPreset(p.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    preset === p.value 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scope Selection */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-purple-600 font-semibold">
              <Layers className="w-5 h-5" />
              <span>Reporting Scope</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SCOPES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setScope(s.value)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    scope === s.value 
                      ? "bg-purple-600 text-white shadow-md shadow-purple-100" 
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <s.icon className="w-4 h-4" />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Selection */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-green-600 font-semibold">
              <Users className="w-5 h-5" />
              <span>Target Entity</span>
            </div>
            <select
              onChange={(e) => setTargetId(e.target.value || null)}
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="">Current User (Self)</option>
              {selectableUsers?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Revenue" 
            value={`₹${reportData?.summary.revenue.toLocaleString() ?? "0"}`} 
            icon={TrendingUp} 
            color="blue" 
          />
          <StatCard 
            title="Pending Balance" 
            value={`₹${reportData?.summary.balance.toLocaleString() ?? "0"}`} 
            icon={Wallet} 
            color="red" 
          />
          <StatCard 
            title="Approved Orders" 
            value={reportData?.summary.orders ?? 0} 
            icon={CheckCircle2} 
            color="green" 
          />
          <StatCard 
            title="Field Visits" 
            value={reportData?.summary.visits ?? 0} 
            icon={Clock} 
            color="purple" 
          />
        </div>

        {/* Yearly Summary (for Lifetime) */}
        {preset === "all" && reportData?.yearlyStats && reportData.yearlyStats.length > 0 && (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              <span>Yearly Performance Snapshot</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(reportData.yearlyStats as unknown as YearlyStat[]).map((year) => (
                <div key={year.year} className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-gray-900">{year.year}</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">Annual Summary</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</p>
                      <p className="text-lg font-bold text-gray-900">₹{year.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orders</p>
                      <p className="text-lg font-bold text-gray-900">{year.orders}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visits</p>
                      <p className="text-lg font-bold text-gray-900">{year.visits}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Growth</p>
                      <p className="text-lg font-bold text-green-600">+--%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions & Preview */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center space-x-2">
              <Download className="w-5 h-5 text-blue-600" />
              <span>Export Options</span>
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={handleDownloadSales}
                disabled={!reportData?.sales.length}
                className="flex items-center space-x-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Export Sales XLSX</span>
              </button>
              <button
                onClick={handleDownloadAttendance}
                disabled={!reportData?.attendance.length}
                className="flex items-center space-x-2 px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Export Attendance XLSX</span>
              </button>
            </div>
          </div>

          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Order #</th>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading intelligence data...</td></tr>
                  ) : reportData?.sales.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No data found for this selection.</td></tr>
                  ) : (
                    reportData?.sales.slice(0, 10).map((s) => (
                      <tr key={s.orderNumber} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-medium text-blue-600">{s.orderNumber}</td>
                        <td className="px-6 py-4 text-sm font-medium">{s.userName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{s.customerName}</td>
                        <td className="px-6 py-4 text-sm font-bold">₹{parseFloat(s.invoiceAmount).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            s.status === "Approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          )}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400">
                          {new Date(s.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                  {reportData?.sales && reportData.sales.length > 10 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-xs text-gray-400 italic">
                        Previewing first 10 records. Download full XLSX for complete data.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      </FeatureGate>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: LucideIcon, color: string }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
      <div className={cn("p-3 rounded-xl", colors[color as keyof typeof colors])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
