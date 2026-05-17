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
  Filter
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";


export default function InventoryPage() {
  const { data: user } = api.users.getMe.useQuery();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stock, isLoading } = api.inventory.getBranchStock.useQuery(
    {},
    { enabled: !!user }
  );

  const filteredStock = stock?.filter(item => 
    item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { 
      label: "Total SKUs", 
      value: stock?.length ?? 0, 
      icon: Package, 
      color: "text-blue-600", 
      bg: "bg-blue-50" 
    },
    { 
      label: "Inventory Value", 
      value: `₹${stock?.reduce((acc, curr) => acc + (Number(curr.product.price) * curr.quantity), 0).toLocaleString() ?? 0}`, 
      icon: TrendingUp, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50" 
    },
    { 
      label: "Out of Stock", 
      value: stock?.filter(s => s.quantity === 0).length ?? 0, 
      icon: AlertTriangle, 
      color: "text-red-600", 
      bg: "bg-red-50" 
    },
    { 
      label: "Low Stock", 
      value: stock?.filter(s => s.quantity > 0 && s.quantity < 10).length ?? 0, 
      icon: AlertTriangle, 
      color: "text-amber-600", 
      bg: "bg-amber-50" 
    },
  ];

  return (
    <DashboardLayout>
      <FeatureGate featureKey="inventory">
        <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory Command Center</h1>
            <p className="text-muted-foreground mt-1">Real-time stock tracking for your branch</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-secondary transition-all shadow-sm">
              <ArrowRightLeft className="w-4 h-4" />
              Transfer Stock
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-[0_1px_3px_rgba(37,99,235,0.2)]">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="premium-card p-6 flex items-center gap-4">
              <div className={cn("p-3 rounded-xl transition-colors duration-300", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Inventory List */}
        <div className="premium-card">
          <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/50">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by SKU or Product Name..."
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl transition-all">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary/50 text-muted-foreground text-[11px] uppercase font-bold tracking-[0.1em]">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4 text-center">In Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm font-medium">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-4 bg-muted/20 rounded-full w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredStock?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium italic">
                      No products found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStock?.map((item) => (
                    <tr key={item.productId} className="hover:bg-secondary/30 transition-colors group">
                      <td className="px-6 py-5 text-foreground font-bold">{item.product.name}</td>
                      <td className="px-6 py-5 text-muted-foreground font-mono text-xs">{item.product.sku}</td>
                      <td className="px-6 py-5 text-center font-bold tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 shadow-sm",
                          item.quantity === 0 
                            ? "bg-red-50 text-red-700 border border-red-100" 
                            : item.quantity < 10 
                              ? "bg-amber-50 text-amber-700 border border-amber-100" 
                              : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        )}>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            item.quantity === 0 
                              ? "bg-red-500 animate-pulse" 
                              : item.quantity < 10 
                                ? "bg-amber-500" 
                                : "bg-emerald-500"
                          )} />
                          {item.quantity === 0 ? "OUT OF STOCK" : item.quantity < 10 ? "LOW STOCK" : "IN STOCK"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all opacity-0 group-hover:opacity-100">
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

