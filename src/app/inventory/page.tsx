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
    <FeatureGate featureKey="inventory">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Inventory Command Center</h1>
            <p className="text-slate-500">Real-time stock tracking for {user?.branch?.name ?? "your branch"}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <ArrowRightLeft className="w-4 h-4" />
              Transfer Stock
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={cn("p-3 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Inventory List */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by SKU or Product Name..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">SKU</th>
                  <th className="px-6 py-4 font-semibold text-center">In Stock</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredStock?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                      No products found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStock?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900">{item.product.name}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono">{item.product.sku}</td>
                      <td className="px-6 py-4 text-center font-semibold tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1",
                          item.quantity === 0 
                            ? "bg-red-50 text-red-700" 
                            : item.quantity < 10 
                              ? "bg-amber-50 text-amber-700" 
                              : "bg-emerald-50 text-emerald-700"
                        )}>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            item.quantity === 0 
                              ? "bg-red-500 animate-pulse" 
                              : item.quantity < 10 
                                ? "bg-amber-500" 
                                : "bg-emerald-500"
                          )} />
                          {item.quantity === 0 ? "Out of Stock" : item.quantity < 10 ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Adjust
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
  );
}
