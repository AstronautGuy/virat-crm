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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Workforce Management</h1>
              <p className="text-sm text-gray-500">Manage your team hierarchy and reporting lines.</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
            <Users className="h-16 w-16 mb-4 text-blue-100" />
            <h3 className="text-xl font-bold text-gray-900">Workforce Operations</h3>
            <p className="text-gray-500 max-w-md mt-2">
              Detailed attendance logs, leave management, and field activity tracking for your teams.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="text-2xl font-bold text-blue-700">--</p>
                <p className="text-xs font-bold text-blue-500 uppercase">Active Today</p>
              </div>
              <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                <p className="text-2xl font-bold text-green-700">--</p>
                <p className="text-xs font-bold text-green-500 uppercase">On Leave</p>
              </div>
            </div>
          </div>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
