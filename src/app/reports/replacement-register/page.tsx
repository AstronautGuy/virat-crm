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
import { RefreshCcw, Loader2, Download, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReplacementRegisterPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    api.reports.getReplacementRegister.useInfiniteQuery(
      { limit: 20 },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const replacements = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <DashboardLayout>
      <FeatureGate featureKey="reports">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <RefreshCcw className="h-8 w-8 text-orange-600" />
                Replacement Register
              </h1>
              <p className="text-muted-foreground mt-1">
                A tabular register of all product replacements.
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
                    <TableHead>Replacement ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Original Sale</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                      </TableCell>
                    </TableRow>
                  ) : replacements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                        <AlertCircle className="mx-auto h-6 w-6 mb-2 text-slate-300" />
                        No replacements found
                      </TableCell>
                    </TableRow>
                  ) : (
                    replacements.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">
                          #{req.id}
                        </TableCell>
                        <TableCell>
                          {new Date(req.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-mono">
                          {req.sale?.orderNumber || req.originalSaleId}
                        </TableCell>
                        <TableCell>
                          {req.user?.firstName} {req.user?.lastName}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {req.reason}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              req.status === "Approved" ? "default" :
                              req.status === "Rejected" ? "destructive" : "secondary"
                            }
                          >
                            {req.status}
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
