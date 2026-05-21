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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="premium-card flex items-center gap-4 p-6"
              >
                <div
                  className={cn(
                    "rounded-xl p-3 transition-colors duration-300",
                    stat.bg,
                  )}
                >
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    {stat.label}
                  </p>
                  <p className="text-foreground text-2xl font-bold tabular-nums">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Inventory List */}
          <div className="premium-card">
            <div className="border-border bg-card/50 flex flex-col justify-between gap-4 border-b p-6 md:flex-row md:items-center">
              <div className="relative max-w-md flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by SKU or Product Name..."
                  className="bg-background border-border focus:ring-primary/20 focus:border-primary w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm font-medium transition-all outline-none focus:ring-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all">
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-secondary/50 text-muted-foreground text-[11px] font-bold tracking-[0.1em] uppercase">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">SKU</th>
                    <th className="px-6 py-4 text-center">In Stock</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y text-sm font-medium">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="bg-muted/20 h-4 w-full rounded-full" />
                        </td>
                      </tr>
                    ))
                  ) : filteredStock?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-muted-foreground px-6 py-12 text-center font-medium italic"
                      >
                        No products found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredStock?.map((item) => (
                      <tr
                        key={item.productId}
                        className="hover:bg-secondary/30 group transition-colors"
                      >
                        <td className="text-foreground px-6 py-5 font-bold">
                          {item.product.name}
                        </td>
                        <td className="text-muted-foreground px-6 py-5 font-mono text-xs">
                          {item.product.sku}
                        </td>
                        <td className="px-6 py-5 text-center font-bold tabular-nums">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm",
                              item.quantity === 0
                                ? "border border-red-100 bg-red-50 text-red-700"
                                : item.quantity < 10
                                  ? "border border-amber-100 bg-amber-50 text-amber-700"
                                  : "border border-emerald-100 bg-emerald-50 text-emerald-700",
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                item.quantity === 0
                                  ? "animate-pulse bg-red-500"
                                  : item.quantity < 10
                                    ? "bg-amber-500"
                                    : "bg-emerald-500",
                              )}
                            />
                            {item.quantity === 0
                              ? "OUT OF STOCK"
                              : item.quantity < 10
                                ? "LOW STOCK"
                                : "IN STOCK"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="text-primary hover:bg-primary/10 rounded-lg px-3 py-1.5 text-xs font-bold opacity-0 transition-all group-hover:opacity-100">
                            ADJUST
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
