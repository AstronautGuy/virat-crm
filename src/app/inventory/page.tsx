"use client";

import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { api } from "@/trpc/react";
import {
  Package,
  AlertTriangle,
  ArrowRightLeft,
  TrendingUp,
  Search,
  Plus,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";

export default function InventoryPage() {
  const { data: user } = api.users.getMe.useQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stock, isLoading } = api.inventory.getBranchStock.useQuery(
    {},
    { enabled: !!user },
  );

  const filteredStock = stock?.filter(
    (item) =>
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const stats = [
    {
      label: "Total SKUs",
      value: stock?.length ?? 0,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Inventory Value",
      value: `₹${stock?.reduce((acc, curr) => acc + Number(curr.product.price) * curr.quantity, 0).toLocaleString() ?? 0}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Out of Stock",
      value: stock?.filter((s) => s.quantity === 0).length ?? 0,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Low Stock",
      value:
        stock?.filter((s) => s.quantity > 0 && s.quantity < 10).length ?? 0,
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <DashboardLayout>
      <FeatureGate featureKey="inventory">
        <div className="mx-auto max-w-7xl space-y-8 p-8">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-foreground text-3xl font-bold tracking-tight">
                Inventory Command Center
              </h1>
              <p className="text-muted-foreground mt-1">
                Real-time stock tracking for your branch
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-card border-border text-foreground hover:bg-secondary flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm transition-all">
                <ArrowRightLeft className="h-4 w-4" />
                Transfer Stock
              </button>
              <button className="bg-primary text-primary-foreground flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold shadow-[0_1px_3px_rgba(37,99,235,0.2)] transition-all hover:opacity-90">
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-2 p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-slate-500 text-xs font-bold tracking-wider uppercase">
                    {stat.label}
                  </p>
                  <div
                    className={cn(
                      "rounded-lg p-2.5 shadow-sm",
                      stat.bg,
                    )}
                  >
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </div>
                <p className="text-slate-900 dark:text-slate-100 text-2xl font-black tabular-nums tracking-tight">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Inventory List */}
          <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="border-border bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between gap-4 border-b p-5 md:flex-row md:items-center">
              <div className="relative max-w-md flex-1">
                <Search className="text-slate-400 absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by SKU or Product Name..."
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-primary/20 focus:border-primary w-full rounded-xl border py-2.5 pr-4 pl-11 text-sm font-medium transition-all outline-none focus:ring-2 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all border border-slate-200 dark:border-slate-700">
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
              </div>
            </div>

            <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between p-5">
                    <div className="flex gap-4 items-center">
                      <div className="bg-slate-200 dark:bg-slate-800 h-10 w-10 rounded-xl" />
                      <div className="flex flex-col gap-2">
                         <div className="bg-slate-200 dark:bg-slate-800 h-4 w-32 rounded" />
                         <div className="bg-slate-200 dark:bg-slate-800 h-3 w-20 rounded" />
                      </div>
                    </div>
                    <div className="bg-slate-200 dark:bg-slate-800 h-8 w-24 rounded-full" />
                  </div>
                ))
              ) : filteredStock?.length === 0 ? (
                <div className="text-slate-500 px-6 py-12 text-center font-medium italic">
                  No products found matching your search.
                </div>
              ) : (
                filteredStock?.map((item) => (
                  <div
                    key={item.productId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold shadow-sm">
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-slate-100 text-base font-bold tracking-tight">
                          {item.product.name}
                        </span>
                        <span className="text-slate-500 font-mono text-xs mt-0.5">
                          {item.product.sku}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                      <div className="flex flex-col sm:items-end">
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                          In Stock
                        </span>
                        <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-slate-100">
                          {item.quantity}
                        </span>
                      </div>
                      
                      <div
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm",
                          item.quantity === 0
                            ? "bg-rose-500 text-white"
                            : item.quantity < 10
                              ? "bg-amber-400 text-amber-950"
                              : "bg-emerald-500 text-white",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full shadow-sm",
                            item.quantity === 0
                              ? "animate-pulse bg-white"
                              : item.quantity < 10
                                ? "bg-amber-950/50"
                                : "bg-white",
                          )}
                        />
                        {item.quantity === 0
                          ? "OUT OF STOCK"
                          : item.quantity < 10
                            ? "LOW STOCK"
                            : "IN STOCK"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
