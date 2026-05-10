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
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: customer, isLoading } = api.crm.getCustomerById.useQuery({ id });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="h-32 bg-slate-200 rounded w-full" />
          <div className="h-64 bg-slate-200 rounded w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
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
        <div className="flex flex-col space-y-6 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link href="/crm">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {customer.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {customer.mobile}
                </span>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  customer.status === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                )}>
                  {customer.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Stats & Info */}
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase text-slate-500">Balance Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-3xl font-bold flex items-center",
                      customer.totalPending > 0 ? "text-red-600" : "text-emerald-600"
                    )}>
                      <IndianRupee className="w-6 h-6" />
                      {customer.totalPending.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Total Outstanding</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase text-slate-500">Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-slate-900">{customer.village}</p>
                      <p className="text-slate-500">{customer.address}</p>
                      <p className="text-slate-500">{customer.district}, {customer.state} - {customer.pincode}</p>
                    </div>
                  </div>
                  {customer.dob && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">
                        Born: {new Date(customer.dob).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Created By</p>
                    <p className="text-sm text-slate-600">{customer.creator.firstName} {customer.creator.lastName}</p>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">Member Since</p>
                    <p className="text-sm text-slate-600">{new Date(customer.createdAt).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Order History */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.orders.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <Package className="w-12 h-12 mx-auto text-slate-200 mb-4" />
                      <p>No orders found for this customer.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {customer.orders.map((order) => (
                        <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 transition-colors gap-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{order.orderNumber}</span>
                            <span className="text-xs text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 md:gap-8">
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-slate-400 uppercase font-bold">Total</span>
                              <span className="text-sm font-medium">₹{Number(order.invoiceAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-slate-400 uppercase font-bold">Advance</span>
                              <span className="text-sm font-medium text-emerald-600">₹{Number(order.advancePaymentAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] text-slate-400 uppercase font-bold">Received</span>
                              <span className="text-sm font-medium text-blue-600">₹{Number(order.receivedAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex flex-col items-end min-w-[80px]">
                              <span className="text-[10px] text-slate-400 uppercase font-bold">Balance</span>
                              <span className={cn(
                                "text-sm font-bold tabular-nums",
                                Number(order.balanceAmount) > 0 ? "text-red-600" : "text-emerald-600"
                              )}>
                                ₹{Number(order.balanceAmount).toLocaleString()}
                              </span>
                            </div>
                            <Link href={`/sales/${order.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="w-4 h-4 rotate-180" />
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
