"use client";

import { DashboardLayout } from "../_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Check, X, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";

const FileGallery = dynamic(() => import("@/app/_components/ui/FileGallery").then(m => m.FileGallery), {
  ssr: false,
  loading: () => <div className="h-10 w-full animate-pulse bg-gray-50 rounded-lg" />
});

export default function SalesDashboard() {
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  
  const { data: sales, isLoading, refetch } = api.sales.getSales.useQuery();
  const { mutate: updateStatus, isPending: isUpdating } = api.sales.updateSaleStatus.useMutation({
    onSuccess: () => refetch(),
    onError: (error) => {
      alert(`Status update failed: ${error.message}`);
    }
  });

  const filteredSales = sales?.filter(
    (sale) => filter === "All" || sale.status === filter
  ) ?? [];

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Sales Register</h1>
          <Link href="/sales/new">
            <Button size="sm" className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              New Sale
            </Button>
          </Link>
        </div>

        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Pending", "Approved", "Rejected"].map((f) => (
            <Badge
              key={f}
              variant={filter === f ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap px-4 py-1"
              onClick={() => setFilter(f as "All" | "Pending" | "Approved" | "Rejected")}
            >
              {f}
            </Badge>
          ))}
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredSales.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
            <p className="text-sm text-muted-foreground">No Sales Found</p>
            <p className="text-xs text-muted-foreground mt-1">There are no sales to display.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSales.map((sale) => (
              <Card key={sale.id} className="overflow-hidden border-gray-100 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="pb-3 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold tracking-tight truncate" title={sale.orderNumber}>
                      {sale.orderNumber}
                    </CardTitle>
                    <Badge
                      className={cn(
                        "text-[10px] uppercase tracking-wider px-2 py-0.5",
                        sale.status === "Approved"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : sale.status === "Rejected"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-orange-50 text-orange-700 border-orange-100"
                      )}
                      variant="outline"
                    >
                      {sale.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-[10px] text-gray-500">
                    {new Date(sale.createdAt).toLocaleDateString()} • {sale.customerName ?? "Anonymous"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-[9px] uppercase font-bold tracking-widest">Amount</span>
                      <span className="font-semibold text-gray-900">₹{sale.invoiceAmount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-[9px] uppercase font-bold tracking-widest">Balance</span>
                      <span className="font-semibold text-red-600">₹{sale.balanceAmount}</span>
                    </div>
                    <div className="flex flex-col col-span-2 pt-2 border-t border-gray-50">
                      <span className="text-gray-400 text-[9px] uppercase font-bold tracking-widest mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Documents
                      </span>
                      <FileGallery entityType="sale" entityId={sale.id} initialFiles={sale.files} />
                    </div>
                  </div>

                  {sale.status === "Pending" && (
                    <div className="mt-5 flex gap-2 pt-3 border-t border-gray-50">
                      <Button
                        variant="outline"
                        className="flex-1 h-10 border-blue-100 bg-blue-50/50 text-blue-700 hover:bg-blue-100 transition-all text-xs"
                        onClick={() => updateStatus({ saleId: sale.id, status: "Approved" })}
                        disabled={isUpdating}
                      >
                        <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 h-10 border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all text-xs"
                        onClick={() => updateStatus({ saleId: sale.id, status: "Rejected" })}
                        disabled={isUpdating}
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" /> Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
