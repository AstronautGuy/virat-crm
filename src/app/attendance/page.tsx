"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { Users } from "lucide-react";

export default function WorkforcePage() {
  return (
    <DashboardLayout>
      <FeatureGate featureKey="workforce">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Workforce Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage your team hierarchy and reporting lines.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <Users className="mb-4 h-16 w-16 text-blue-100" />
            <h3 className="text-xl font-bold text-gray-900">
              Workforce Operations
            </h3>
            <p className="mt-2 max-w-md text-gray-500">
              Detailed attendance logs, leave management, and field activity
              tracking for your teams.
            </p>
            <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-2xl font-bold text-blue-700">--</p>
                <p className="text-xs font-bold text-blue-500 uppercase">
                  Active Today
                </p>
              </div>
              <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
                <p className="text-2xl font-bold text-green-700">--</p>
                <p className="text-xs font-bold text-green-500 uppercase">
                  On Leave
                </p>
              </div>
            </div>
          </div>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
