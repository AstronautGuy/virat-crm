"use client";

import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { api } from "@/trpc/react";
import {
  ArrowLeft,
  Contact,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  Package,
  CheckCircle2,
  Clock,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: customer, isLoading } = api.crm.getCustomerById.useQuery({
    id,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/4 rounded bg-slate-200" />
          <div className="h-32 w-full rounded bg-slate-200" />
          <div className="h-64 w-full rounded bg-slate-200" />
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="py-12 text-center">
          <h2 className="text-xl font-bold">Customer not found</h2>
          <Link href="/crm">
            <Button variant="link">Back to CRM</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <FeatureGate featureKey="crm">
        <div className="mx-auto flex max-w-5xl flex-col space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/crm">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {customer.name}
              </h1>
              <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" /> {customer.mobile}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    customer.status === "Approved"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700",
                  )}
                >
                  {customer.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Left: Stats & Info */}
            <div className="space-y-6 md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-500 uppercase">
                    Balance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "flex items-center text-3xl font-bold",
                        customer.totalPending > 0
                          ? "text-red-600"
                          : "text-emerald-600",
                      )}
                    >
                      <IndianRupee className="h-6 w-6" />
                      {customer.totalPending.toLocaleString()}
                    </span>
                    <span className="mt-1 text-xs tracking-wider text-slate-400 uppercase">
                      Total Outstanding
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-500 uppercase">
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                    <div className="text-sm">
                      <p className="font-medium text-slate-900">
                        {customer.village}
                      </p>
                      <p className="text-slate-500">{customer.address}</p>
                      <p className="text-slate-500">
                        {customer.district}, {customer.state} -{" "}
                        {customer.pincode}
                      </p>
                    </div>
                  </div>
                  {customer.dob && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        Born: {new Date(customer.dob).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Created By
                    </p>
                    <p className="text-sm text-slate-600">
                      {customer.creator.firstName} {customer.creator.lastName}
                    </p>
                    <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase">
                      Member Since
                    </p>
                    <p className="text-sm text-slate-600">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Order History */}
            <div className="space-y-6 md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-bold">
                    <History className="h-5 w-5 text-blue-600" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.orders.length === 0 ? (
                    <div className="py-12 text-center text-slate-500">
                      <Package className="mx-auto mb-4 h-12 w-12 text-slate-200" />
                      <p>No orders found for this customer.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customer.orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex flex-col justify-between gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:border-blue-100 md:flex-row md:items-center"
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 md:gap-8">
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Total
                              </span>
                              <span className="text-sm font-medium">
                                ₹{Number(order.invoiceAmount).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Advance
                              </span>
                              <span className="text-sm font-medium text-emerald-600">
                                ₹
                                {Number(
                                  order.advancePaymentAmount,
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Received
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                ₹{Number(order.receivedAmount).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex min-w-[80px] flex-col items-end">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">
                                Balance
                              </span>
                              <span
                                className={cn(
                                  "text-sm font-bold tabular-nums",
                                  Number(order.balanceAmount) > 0
                                    ? "text-red-600"
                                    : "text-emerald-600",
                                )}
                              >
                                ₹{Number(order.balanceAmount).toLocaleString()}
                              </span>
                            </div>
                            <Link href={`/sales/${order.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <ArrowLeft className="h-4 w-4 rotate-180" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
