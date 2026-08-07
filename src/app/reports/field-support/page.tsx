"use client";

import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import { FileText, Plus, Printer } from "lucide-react";
import Link from "next/link";

export default function FieldSupportReportsPage() {
  const { data: reports, isLoading } = api.fieldSupport.getAll.useQuery();

  return (
    <DashboardLayout>
      <FeatureGate featureKey="field-support">
        <div className="flex flex-col space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900">
                <FileText className="h-8 w-8 text-indigo-600" />
                <span>Field Support Reports</span>
              </h1>
              <p className="mt-2 text-lg text-gray-500">
                Manage and view filed support logs for TM and above.
              </p>
            </div>
            <Link
              href="/reports/field-support/new"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow"
            >
              <Plus className="h-5 w-5" />
              New Report
            </Link>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-bold">Month</th>
                    <th className="px-6 py-4 font-bold">Branch</th>
                    <th className="px-6 py-4 font-bold">Manager</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        Loading reports...
                      </td>
                    </tr>
                  ) : reports?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        No reports found.
                      </td>
                    </tr>
                  ) : (
                    reports?.map((report) => (
                      <tr key={report.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {report.month}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {report.branch.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {report.manager.firstName} {report.manager.lastName}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/reports/field-support/print/${report.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                          >
                            <Printer className="h-4 w-4" />
                            Print
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
