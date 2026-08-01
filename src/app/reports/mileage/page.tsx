"use client";

import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { MileageReportList } from "@/app/_components/reports/MileageReportList";
import { api } from "@/trpc/react";
import { Car } from "lucide-react";

export default function MileageReportsPage() {
  const { data: user } = api.users.getMe.useQuery();

  const isManager =
    user?.permissions.isManager ?? user?.permissions.isAdmin ?? false;
  const isAdmin = user?.role === "Admin";

  return (
    <DashboardLayout>
      <FeatureGate featureKey="reports">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 shadow-sm md:flex-row md:items-center">
            <div className="relative z-10">
              <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
                <div className="rounded-xl bg-blue-100 p-2">
                  <Car className="h-8 w-8 text-blue-600" />
                </div>
                Mileage Reimbursement Reports
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                {isManager
                  ? "Export and review your team's daily travel distance for reimbursement processing."
                  : "View your calculated daily mileage logs and travel history."}
              </p>
            </div>

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-blue-50/30 blur-3xl" />
          </div>

          {/* Main Content */}
          <MileageReportList isManager={isManager} isAdmin={isAdmin} />
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
