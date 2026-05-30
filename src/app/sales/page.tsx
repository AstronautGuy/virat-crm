"use client";

import { FeatureGate } from "@/app/_components/auth/FeatureGate";

import { DashboardLayout } from "../_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Check, X, Loader2, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import dynamic from "next/dynamic";

const FileGallery = dynamic(
  () => import("@/app/_components/ui/FileGallery").then((m) => m.FileGallery),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 w-full animate-pulse rounded-lg bg-gray-50" />
    ),
  },
);

import { PageWrapper } from "../_components/layout/PageWrapper";

export default function SalesDashboard() {
  const [filter, setFilter] = useState<
    "All" | "Pending" | "Approved" | "Rejected"
  >("All");

  const [selectedSale, setSelectedSale] = useState<
    (typeof filteredSales)[number] | null
  >(null);

  const { data: user } = api.users.getMe.useQuery();
  const canApprove = user?.role === "Admin" || user?.role === "Manager";

  const { data: salesData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = 
    api.sales.getSales.useInfiniteQuery(
      { limit: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    );

  const { mutate: updateStatus, isPending: isUpdating } =
    api.sales.updateSaleStatus.useMutation({
      onSuccess: () => refetch(),
      onError: (error) => {
        alert(`Status update failed: ${error.message}`);
      },
    });

  const allSales = salesData?.pages.flatMap((page) => page.items) ?? [];
  const filteredSales =
    allSales.filter((sale) => filter === "All" || sale.status === filter);

  return (
    <DashboardLayout>
      <FeatureGate featureKey="sales">
        <PageWrapper isLoading={isLoading}>
          <div className="flex flex-col space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Sales Register
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Track and manage all transactions in real-time.
                </p>
              </div>
              <Link href="/sales/new">
                <Button size="lg" className="rounded-2xl px-6">
                  <Plus className="mr-2 h-5 w-5" />
                  New Entry
                </Button>
              </Link>
            </div>

            <div className="no-scrollbar flex space-x-3 overflow-x-auto pb-4">
              {["All", "Pending", "Approved", "Rejected"].map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "default" : "outline"}
                  className={cn(
                    "rounded-2xl px-6 transition-all",
                    filter === f
                      ? "shadow-md"
                      : "border-slate-200 text-slate-600",
                  )}
                  onClick={() =>
                    setFilter(f as "All" | "Pending" | "Approved" | "Rejected")
                  }
                >
                  {f}
                </Button>
              ))}
            </div>

            {filteredSales.length === 0 && !isLoading ? (
              <Card className="flex flex-col items-center justify-center border-dashed bg-slate-50/50 p-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  No Sales Found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try adjusting your filters or create a new entry.
                </p>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {/* List Layout for Dense Data */}
                {(isLoading
                  ? Array.from({ length: 6 })
                  : filteredSales
                ).map((saleItem, idx) => {
                  const sale = saleItem as
                    | (typeof filteredSales)[number]
                    | undefined;
                  return (
                    <div
                      key={sale?.id ?? idx}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md cursor-pointer transition-all active:scale-[0.99]"
                      onClick={() => sale && setSelectedSale(sale)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shadow-inner">
                          {sale?.customerName?.charAt(0) ?? "C"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight">
                            {sale?.orderNumber ?? "ORD-000000"}
                          </span>
                          <span className="text-sm font-medium text-slate-500">
                            {sale?.customerName ?? "Customer Name"}
                          </span>
                          <span className="text-xs text-slate-400">
                            {sale?.createdAt
                              ? new Date(sale.createdAt).toLocaleDateString()
                              : "Date Placeholder"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                        <div className="flex flex-col sm:items-end">
                           <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                              Amount
                           </span>
                           <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                              ₹{sale?.invoiceAmount ?? "00,000"}
                           </span>
                        </div>
                        <Badge
                          className={cn(
                            "rounded-lg border-none px-3 py-1 text-xs font-bold tracking-widest uppercase shadow-sm",
                            sale?.status === "Approved"
                              ? "bg-emerald-500 text-white hover:bg-emerald-600"
                              : sale?.status === "Rejected"
                                ? "bg-rose-500 text-white hover:bg-rose-600"
                                : "bg-amber-400 text-amber-950 hover:bg-amber-500",
                          )}
                        >
                          {sale?.status ?? "Pending"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                
                {hasNextPage && (
                  <Button
                    variant="outline"
                    className="mt-4 rounded-xl h-12 border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-500" />
                    ) : null}
                    Load More Sales
                  </Button>
                )}
              </div>
            )}
            
            {/* Expanded Sale Details Sheet */}
            <Sheet open={!!selectedSale} onOpenChange={(open) => !open && setSelectedSale(null)}>
              <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-2xl font-bold">Sale Details</SheetTitle>
                  <SheetDescription>
                    {selectedSale?.orderNumber} • {selectedSale?.status}
                  </SheetDescription>
                </SheetHeader>
                
                {selectedSale && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-slate-500 block">Customer</span>
                        <span className="text-slate-900">{selectedSale.customerName}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500 block">Creator</span>
                        <span className="text-slate-900">
                          {selectedSale.user?.firstName} {selectedSale.user?.lastName} 
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500 block">Invoice Amount</span>
                        <span className="text-slate-900">₹{selectedSale.invoiceAmount}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-500 block">Balance</span>
                        <span className="text-red-500 font-bold">₹{selectedSale.balanceAmount}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold text-slate-500 block">Delivery Address</span>
                        <span className="text-slate-900">
                          {selectedSale.deliveryAddress || `${selectedSale.addressLine1}, ${selectedSale.city}, ${selectedSale.state} - ${selectedSale.pincode}`}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-slate-900 mb-3 border-b pb-2">Items</h4>
                      <div className="space-y-2">
                        {selectedSale.items?.map((item) => (
                          <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border">
                            <span className="font-medium text-slate-800">Product #{item.productId}</span>
                            <span className="text-slate-600">Qty: {item.quantity} {item.isFree && <Badge variant="secondary" className="ml-2">Free</Badge>}</span>
                          </div>
                        ))}
                        {!selectedSale.items?.length && <p className="text-slate-500 italic text-sm">No items found.</p>}
                      </div>
                    </div>

                    {user?.role === "Admin" && (
                      <div className="flex pt-4">
                        <Link href={`/sales/${selectedSale.id}/edit`} className="w-full">
                          <Button variant="secondary" className="w-full" onClick={() => setSelectedSale(null)}>
                            Edit Sale Details
                          </Button>
                        </Link>
                      </div>
                    )}

                    {selectedSale.status === "Pending" && canApprove && (
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          className="flex-1"
                          onClick={() => {
                            updateStatus({ saleId: selectedSale.id, status: "Approved" });
                            setSelectedSale(null);
                          }}
                          disabled={isUpdating}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            updateStatus({ saleId: selectedSale.id, status: "Rejected" });
                            setSelectedSale(null);
                          }}
                          disabled={isUpdating}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </PageWrapper>
      </FeatureGate>
    </DashboardLayout>
  );
}
