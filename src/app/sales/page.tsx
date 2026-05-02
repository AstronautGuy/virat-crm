"use client";

import { DashboardLayout } from "../_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Check, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
              <Card key={sale.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base truncate" title={sale.orderNumber}>
                      {sale.orderNumber}
                    </CardTitle>
                    <Badge
                      variant={
                        sale.status === "Approved"
                          ? "default"
                          : sale.status === "Rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {sale.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {new Date(sale.createdAt).toLocaleDateString()} • {sale.customerName ?? "No Customer Name"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[10px] uppercase">Amount</span>
                      <span className="font-medium font-mono">₹{sale.invoiceAmount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[10px] uppercase">Balance</span>
                      <span className="font-medium font-mono text-destructive">₹{sale.balanceAmount}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[10px] uppercase">Items</span>
                      <span className="font-medium">{sale.totalQty} qty</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-[10px] uppercase">Agent</span>
                      <span className="font-medium truncate" title={String(`${sale.user?.firstName ?? ""} ${sale.user?.lastName ?? ""}`.trim())}>
                        {`${sale.user?.firstName ?? ""} ${sale.user?.lastName ?? ""}`.trim() || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {sale.status === "Pending" && (
                    <div className="mt-4 flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        onClick={() => updateStatus({ saleId: sale.id, status: "Approved" })}
                        disabled={isUpdating}
                      >
                        <Check className="mr-1 h-3 w-3" /> Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        onClick={() => updateStatus({ saleId: sale.id, status: "Rejected" })}
                        disabled={isUpdating}
                      >
                        <X className="mr-1 h-3 w-3" /> Reject
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
