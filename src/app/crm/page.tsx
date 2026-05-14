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
  const canApprove = (isAdmin ?? false) || (isManager ?? false);

  return (
    <DashboardLayout>
      <FeatureGate featureKey="crm">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Contact className="w-7 h-7 text-primary" />
                </div>
                Customer Master
              </h1>
              <p className="text-muted-foreground mt-2 font-medium">
                Manage branch customers, financial balances, and track order history.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <TabsList className="bg-secondary/50 p-1 border border-border rounded-xl">
                <TabsTrigger value="list" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold transition-all">
                  <List className="w-4 h-4" />
                  All Customers
                </TabsTrigger>
                <TabsTrigger value="add" className="gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary font-bold transition-all">
                  <Plus className="w-4 h-4" />
                  {canApprove ? "Add Approved" : "Propose New"}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="list" className="mt-0 focus-visible:outline-none">
              <div className="premium-card">
                <CustomerList isManager={canApprove} />
              </div>
            </TabsContent>

            <TabsContent value="add" className="mt-0 max-w-4xl mx-auto focus-visible:outline-none">
              <div className="premium-card p-8 bg-card">
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-foreground">Customer Registration</h2>
                  <p className="text-sm text-muted-foreground font-medium">Please fill in the details accurately for compliance and tracking.</p>
                </div>
                <CustomerForm 
                  isManager={canApprove} 
                  onSuccess={() => setActiveTab("list")} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
