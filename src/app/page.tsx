import { api, HydrateClient } from "@/trpc/server";
import { DashboardLayout } from "./_components/layout/DashboardLayout";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function Home() {
  const [salesSummary, workforceSummary] = await Promise.all([
    api.analytics.getSalesSummary({ preset: "today" }),
    api.analytics.getWorkforceSummary(),
  ]);

  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const metrics = [
    { label: "Daily Sales", value: currencyFormatter.format(salesSummary.revenue), trend: `${salesSummary.count} Sales` },
    { label: "Active Staff", value: `${workforceSummary.activeToday}`, trend: "Today" },
    { label: "Pending Leaves", value: `${workforceSummary.pendingLeaves}`, trend: "Review" },
    { label: "Daily Volume", value: `${salesSummary.quantity}`, trend: "Units" },
  ];

  return (
    <HydrateClient>
      <DashboardLayout>
        <div className="flex flex-col space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back. Here's what's happening today.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{metric.label}</p>
                <div className="mt-1 flex items-end justify-between">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <span className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600"
                  )}>
                    {metric.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 text-xs">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                      {i}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Sale Approved - ORD-{1000 + i}</p>
                      <p className="text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">Quick Actions</p>
              <p className="text-xs text-gray-500 mb-4">Create new sales or documents</p>
              <Link href="/sales/new">
                <Button variant="outline" size="sm" className="h-10 px-6 border-blue-100 text-blue-600 hover:bg-blue-50">
                  New Sale
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </HydrateClient>
  );
}
