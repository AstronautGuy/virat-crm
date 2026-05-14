"use client";

import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { CustomerList } from "@/app/_components/crm/CustomerList";
import { CustomerForm } from "@/app/_components/crm/CustomerForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { Contact, Plus, List } from "lucide-react";
import { useState } from "react";

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState("list");
  const { data: user } = api.users.getMe.useQuery();
  
  const isAdmin = user?.permissions.isAdmin;
  const isManager = user?.permissions.isManager;
  const canApprove = isAdmin || isManager;

  return (
    <DashboardLayout>
      <FeatureGate featureKey="crm">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Contact className="w-6 h-6 text-blue-600" />
                Customer Master
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Manage branch customers, financial balances, and track order history.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-slate-100/50 p-1 border border-slate-200">
                <TabsTrigger value="list" className="gap-2">
                  <List className="w-4 h-4" />
                  All Customers
                </TabsTrigger>
                <TabsTrigger value="add" className="gap-2">
                  <Plus className="w-4 h-4" />
                  {canApprove ? "Add Approved" : "Propose New"}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="mt-0">
              <CustomerList isManager={canApprove} />
            </TabsContent>

            <TabsContent value="add" className="mt-0 max-w-3xl mx-auto">
              <CustomerForm 
                isManager={canApprove} 
                onSuccess={() => setActiveTab("list")} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
