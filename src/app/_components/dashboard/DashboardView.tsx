"use client";

import React from "react";
import { PageWrapper } from "../layout/PageWrapper";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Metric {
  label: string;
  value: string;
  trend: string;
}

interface DashboardViewProps {
  user: Record<string, any> | null;
  metrics: Metric[];
  isManager: boolean;
  isLoading?: boolean;
}

import { FeatureGate } from "../auth/FeatureGate";

export function DashboardView({ user, metrics, isManager, isLoading }: DashboardViewProps) {
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
      </FeatureGate>
    </PageWrapper>
  );
}
