"use client";

import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Wallet, Loader2, Download, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdvanceRegisterPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.reports.getAdvanceRegister.useInfiniteQuery(
      { limit: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const sales = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <DashboardLayout>
      <FeatureGate featureKey="reports">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Wallet className="h-8 w-8 text-blue-600" />
                Advance Register
              </h1>
              <p className="text-muted-foreground mt-1">
                View all orders with an advance payment.
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>

          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead className="text-right">Total Invoice</TableHead>
                    <TableHead className="text-right">Advance Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                      </TableCell>
                    </TableRow>
                  ) : sales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                        <AlertCircle className="mx-auto h-6 w-6 mb-2 text-slate-300" />
                        No advance payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          {sale.orderNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{sale.customerName || "Walk-in"}</TableCell>
                        <TableCell>
                          {sale.user?.firstName} {sale.user?.lastName}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{sale.invoiceAmount}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            ₹{sale.advancePaymentAmount}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {hasNextPage && (
              <div className="p-4 border-t bg-slate-50 flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
                  ) : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
