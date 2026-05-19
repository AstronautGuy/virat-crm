"use client";

import React from "react";
import { PageWrapper } from "../layout/PageWrapper";
import { Plus, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";

interface Metric {
  label: string;
  value: string;
  trend: string;
}

interface UserInfo {
  firstName: string;
  lastName?: string | null;
  role: string;
  branchId?: number | null;
}

interface DashboardViewProps {
  user: UserInfo | null;
  metrics: Metric[];
  isManager: boolean;
  isLoading?: boolean;
}

import { FeatureGate } from "../auth/FeatureGate";

export function DashboardView({ user, metrics, isManager, isLoading }: DashboardViewProps) {
  const { data: lowStockItems = [] } = api.inventory.getLowStockItems.useQuery();

  return (
    <PageWrapper isLoading={isLoading}>
      <FeatureGate featureKey="dashboard">
        <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-700">{user?.firstName}</span>. 
            {isManager ? " Here's your business at a glance." : " Have a productive day!"}
          </p>
        </div>

        {/* Real-time Premium Low Stock Alert Banner */}
        {lowStockItems.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/10 p-5 shadow-sm transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-top-4">
            {/* Background Glow */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
                  <AlertCircle className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-400">
                    Attention: Low Stock Warning
                  </h4>
                  <p className="text-xs text-amber-700/85 dark:text-amber-500/90 leading-relaxed mt-0.5">
                    {lowStockItems.length} {lowStockItems.length === 1 ? "product is" : "products are"} running below minimum stock limits. Please review and restock immediately.
                  </p>
                </div>
              </div>
              <Link href="/inventory" className="shrink-0">
                <button className="flex items-center justify-center gap-1.5 px-4.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-900 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-all duration-300">
                  Manage Inventory
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-0 border-none">
              <CardContent className="p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{metric.label}</p>
                <div className="mt-3 flex items-end justify-between">
                  <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary">
                    {metric.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          <Card className="md:col-span-4 border-none">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-800">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-pointer">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm font-bold">
                      {i}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 group-hover:text-primary transition-colors">Sale Approved - ORD-{1000 + i}</p>
                      <p className="text-xs text-slate-400">2 hours ago • Verified by Admin</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3 border-none flex flex-col items-center justify-center text-center p-8 bg-primary/5">
            <div className="h-16 w-16 rounded-2xl bg-white shadow-premium flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-[200px]">Create new sales, documents or manage workforce instantly.</p>
            <Link href="/sales/new" className="w-full">
              <Button size="lg" className="w-full rounded-2xl">
                New Sale
              </Button>
            </Link>
          </Card>
        </div>
        </div>
      </FeatureGate>
    </PageWrapper>
  );
}
