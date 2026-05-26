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

  const { data: sales, isLoading, refetch } = api.sales.getSales.useQuery();
  const { mutate: updateStatus, isPending: isUpdating } =
    api.sales.updateSaleStatus.useMutation({
      onSuccess: () => refetch(),
      onError: (error) => {
        alert(`Status update failed: ${error.message}`);
      },
    });

  const filteredSales =
    sales?.filter((sale) => filter === "All" || sale.status === filter) ?? [];

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
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* When loading, Skelon will use these as blueprint */}
                {(isLoading
                  ? Array.from({ length: 6 })
                  : (filteredSales ?? [])
                ).map((saleItem, idx) => {
                  const sale = saleItem as
                    | (typeof filteredSales)[number]
                    | undefined;
                  return (
                    <Card
                      key={sale?.id ?? idx}
                      className="group overflow-hidden border-none cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => sale && setSelectedSale(sale)}
                    >
                      <CardHeader className="group-hover:bg-primary/5 bg-slate-50/50 pb-3 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle
                            className="truncate text-base font-bold tracking-tight text-slate-800"
                            title={sale?.orderNumber ?? ""}
                          >
                            {sale?.orderNumber ?? "ORD-000000"}
                          </CardTitle>
                          <Badge
                            className={cn(
                              "rounded-lg border-none px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase",
                              sale?.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : sale?.status === "Rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700",
                            )}
                          >
                            {sale?.status ?? "Pending"}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs font-medium text-slate-400">
                          {sale?.createdAt
                            ? new Date(sale.createdAt).toLocaleDateString()
                            : "Date Placeholder"}{" "}
                          • {sale?.customerName ?? "Customer Name"}
                          {sale?.user && (
                            <> • {sale.user.firstName} {sale.user.lastName}</>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-5">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                              Amount
                            </span>
                            <span className="text-lg font-bold text-slate-900">
                              ₹{sale?.invoiceAmount ?? "00,000"}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                              Balance
                            </span>
                            <span className="text-lg font-bold text-red-500">
                              ₹{sale?.balanceAmount ?? "00,000"}
                            </span>
                          </div>
                          <div className="col-span-2 flex flex-col border-t border-slate-50 pt-4">
                            <span className="mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                              <FileText className="h-3.5 w-3.5" /> Documents
                            </span>
                            {sale?.id && sale?.files && (
                              <FileGallery
                                entityType="sale"
                                entityId={sale.id}
                                initialFiles={sale.files}
                              />
                            )}
                          </div>
                        </div>

                        {sale?.status === "Pending" && canApprove && (
                          <div className="mt-6 flex gap-3 border-t border-slate-50 pt-4">
                            <Button
                              className="h-11 flex-1 rounded-xl"
                              onClick={(e) => {
                                e.stopPropagation();
                                sale.id &&
                                  updateStatus({
                                    saleId: sale.id,
                                    status: "Approved",
                                  });
                              }}
                              disabled={isUpdating}
                            >
                              <Check className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button
                              variant="outline"
                              className="h-11 flex-1 rounded-xl border-slate-200 text-slate-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                sale.id &&
                                  updateStatus({
                                    saleId: sale.id,
                                    status: "Rejected",
                                  });
                              }}
                              disabled={isUpdating}
                            >
                              <X className="mr-2 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
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
