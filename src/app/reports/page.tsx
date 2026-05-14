"use client";

import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { ReportForm } from "@/app/_components/reports/ReportForm";
import { ReportList } from "@/app/_components/reports/ReportList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { FileText, Plus, List } from "lucide-react";
import { useState } from "react";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("list");
  const { data: user } = api.users.getMe.useQuery();
  
  const isManager = user?.permissions.isManager ?? user?.permissions.isAdmin ?? false;

  return (
    <DashboardLayout>
      <FeatureGate featureKey="reports">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                Daily Activity Reports
              </h1>
              <p className="text-slate-500 text-sm mt-2 max-w-xl leading-relaxed">
                {isManager 
                  ? "Monitor team productivity, review field updates, and track branch-level daily activities."
                  : "Submit your daily narrative updates, track customer interactions, and maintain your activity diary."}
              </p>
            </div>
            
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full -mr-20 -mt-20 blur-3xl" />
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-slate-100/80 p-1 border border-slate-200 rounded-xl">
                <TabsTrigger value="list" className="gap-2 rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <List className="w-4 h-4" />
                  {isManager ? "Branch Activity" : "My History"}
                </TabsTrigger>
                <TabsTrigger value="add" className="gap-2 rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  <Plus className="w-4 h-4" />
                  Submit Report
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="mt-0 outline-none">
              <ReportList isManager={isManager} />
            </TabsContent>

            <TabsContent value="add" className="mt-0 max-w-3xl mx-auto outline-none">
              <ReportForm onSuccess={() => setActiveTab("list")} />
            </TabsContent>
          </Tabs>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
