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
        <div className="mx-auto max-w-7xl space-y-8 p-8">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-foreground flex items-center gap-3 text-3xl font-bold tracking-tight">
                <div className="bg-primary/10 rounded-xl p-2.5">
                  <Contact className="text-primary h-7 w-7" />
                </div>
                Customer Master
              </h1>
              <p className="text-muted-foreground mt-2 font-medium">
                Manage branch customers, financial balances, and track order
                history.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full space-y-6"
          >
            <div className="border-border flex items-center justify-between border-b pb-4">
              <TabsList className="bg-secondary/50 border-border rounded-xl border p-1">
                <TabsTrigger
                  value="list"
                  className="data-[state=active]:text-primary gap-2 rounded-lg px-4 py-2 font-bold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <List className="h-4 w-4" />
                  All Customers
                </TabsTrigger>
                <TabsTrigger
                  value="add"
                  className="data-[state=active]:text-primary gap-2 rounded-lg px-4 py-2 font-bold transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  {canApprove ? "Add Approved" : "Propose New"}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="list"
              className="mt-0 focus-visible:outline-none"
            >
              <div className="premium-card">
                <CustomerList isManager={canApprove} />
              </div>
            </TabsContent>

            <TabsContent
              value="add"
              className="mx-auto mt-0 max-w-4xl focus-visible:outline-none"
            >
              <div className="premium-card bg-card p-8">
                <div className="mb-8">
                  <h2 className="text-foreground text-xl font-bold">
                    Customer Registration
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium">
                    Please fill in the details accurately for compliance and
                    tracking.
                  </p>
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
