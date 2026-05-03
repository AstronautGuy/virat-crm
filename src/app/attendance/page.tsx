"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { OrgTree } from "@/app/_components/workforce/OrgTree";
import { api } from "@/trpc/react";
import { Users, LayoutGrid, List, GitBranch } from "lucide-react";
import { OrgFlowchart } from "@/app/_components/workforce/OrgFlowchart";

export default function WorkforcePage() {
  const [activeTab, setActiveTab] = useState("hierarchy");
  const utils = api.useUtils();

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Workforce Management</h1>
            <p className="text-sm text-gray-500">Manage your team hierarchy and reporting lines.</p>
          </div>
        </div>

        <div className="w-full">
          <div className="flex bg-gray-100/50 p-1 rounded-xl w-fit mb-6">
            <button
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <List className="h-4 w-4" />
              List View
            </button>
            <button
              onClick={() => setActiveTab("hierarchy")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "hierarchy" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Hierarchy View
            </button>
            <button
              onClick={() => setActiveTab("flowchart")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === "flowchart" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <GitBranch className="h-4 w-4" />
              Flowchart View
            </button>
          </div>

          <div className="animate-in fade-in duration-500">
            {activeTab === "list" && (
              <div className="p-12 border border-gray-100 bg-white rounded-3xl flex flex-col items-center justify-center text-center shadow-sm">
                <Users className="h-12 w-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold">User List View</h3>
                <p className="text-sm text-gray-500 max-w-xs mt-2">
                  The detailed list view is currently being optimized for large teams.
                </p>
              </div>
            )}
            {activeTab === "hierarchy" && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm min-h-[600px]">
                <OrgTree />
              </div>
            )}
            {activeTab === "flowchart" && (
              <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm">
                <OrgFlowchart />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
