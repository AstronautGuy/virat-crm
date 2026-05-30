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

export function DashboardView({
  user,
  metrics,
  isManager,
  isLoading,
}: DashboardViewProps) {
  const { data: lowStockItems = [] } =
    api.inventory.getLowStockItems.useQuery();

  return (
    <PageWrapper isLoading={isLoading}>
      <FeatureGate featureKey="dashboard">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="mt-1 text-slate-500">
              Welcome back,{" "}
              <span className="font-semibold text-slate-700">
                {user?.firstName}
              </span>
              .
              {isManager
                ? " Here's your business at a glance."
                : " Have a productive day!"}
            </p>
          </div>

          {/* Real-time Premium Low Stock Alert Banner */}
          {lowStockItems.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-4 relative overflow-hidden rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:bg-amber-950/10">
              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />

              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
                    <AlertCircle className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-400">
                      Attention: Low Stock Warning
                    </h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-amber-700/85 dark:text-amber-500/90">
                      {lowStockItems.length}{" "}
                      {lowStockItems.length === 1
                        ? "product is"
                        : "products are"}{" "}
                      running below minimum stock limits. Please review and
                      restock immediately.
                    </p>
                  </div>
                </div>
                <Link href="/inventory" className="shrink-0">
                  <button className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500/10 px-4.5 py-2 text-xs font-bold text-amber-700 transition-all duration-300 hover:bg-amber-500/20 hover:text-amber-900 dark:text-amber-400">
                    Manage Inventory
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label} className="border-none p-0 shadow-sm rounded-xl transition-transform duration-300">
                <CardContent className="p-6">
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {metric.label}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="text-3xl font-bold text-slate-900">
                      {metric.value}
                    </p>
                    <span className="bg-primary/10 text-primary rounded-lg px-2.5 py-1 text-[11px] font-bold">
                      {metric.trend}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-7">
            <Card className="border-none shadow-sm rounded-xl md:col-span-4">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-800">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="group flex cursor-pointer items-center gap-4 active:scale-[0.98] transition-transform duration-200 rounded-lg p-2 -mx-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <div className="text-primary group-hover:bg-primary flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 font-bold shadow-sm transition-all duration-300 group-hover:text-white">
                        {i}
                      </div>
                      <div className="flex-1">
                        <p className="group-hover:text-primary font-semibold text-slate-800 transition-colors">
                          Sale Approved - ORD-{1000 + i}
                        </p>
                        <p className="text-xs text-slate-400">
                          2 hours ago • Verified by Admin
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 flex flex-col items-center justify-center border-none p-8 text-center md:col-span-3 shadow-sm rounded-xl">
              <div className="shadow-premium mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white transition-transform group-hover:scale-110">
                <Plus className="text-primary h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Quick Actions
              </h3>
              <p className="mb-6 max-w-[200px] text-sm text-slate-500">
                Create new sales, documents or manage workforce instantly.
              </p>
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
