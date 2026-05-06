"use client";

import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { api } from "@/trpc/react";
import { 
  ArrowRightLeft, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TransfersPage() {
  const { data: user } = api.users.getMe.useQuery();
  const { data: transfers, isLoading, refetch } = api.inventory.getTransfers.useQuery(
    undefined,
    { enabled: !!user }
  );

  const updateStatus = api.inventory.updateTransferStatus.useMutation({
    onSuccess: () => refetch()
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending": return <Clock className="w-4 h-4" />;
      case "Shipped": return <Truck className="w-4 h-4" />;
      case "Received": return <CheckCircle2 className="w-4 h-4" />;
      case "Cancelled": return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-100";
      case "Shipped": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Received": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Cancelled": return "bg-slate-50 text-slate-700 border-slate-100";
      default: return "";
    }
  };

  return (
    <FeatureGate featureKey="inventory">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transfer Center</h1>
            <p className="text-slate-500">Manage stock movements between branches</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <ArrowRightLeft className="w-4 h-4" />
            New Transfer Request
          </button>
        </div>

        {/* Transfer Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Outgoing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <ArrowUpRight className="w-5 h-5 text-blue-600" />
              <h2>Outgoing Shipments</h2>
            </div>
            
            <div className="space-y-3">
              {isLoading ? (
                <div className="h-20 bg-slate-50 animate-pulse rounded-xl" />
              ) : transfers?.filter(t => t.fromBranchId === user?.branchId).length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 border border-dashed border-slate-200 text-sm">
                  No outgoing transfers found.
                </div>
              ) : (
                transfers?.filter(t => t.fromBranchId === user?.branchId).map((transfer) => (
                  <div key={transfer.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <Truck className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">To {transfer.toBranch.name}</p>
                          <p className="text-xs text-slate-500">{new Date(transfer.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5",
                        getStatusColor(transfer.status)
                      )}>
                        {getStatusIcon(transfer.status)}
                        {transfer.status}
                      </span>
                    </div>
                    
                    <div className="text-xs text-slate-600">
                      {Array.isArray(transfer.items) && transfer.items.length} items requested
                    </div>

                    {transfer.status === "Pending" && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateStatus.mutate({ transferId: transfer.id, status: "Shipped" })}
                          className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                        >
                          Dispatch
                        </button>
                        <button 
                          onClick={() => updateStatus.mutate({ transferId: transfer.id, status: "Cancelled" })}
                          className="px-3 py-1.5 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Incoming */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
              <h2>Incoming Requests</h2>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="h-20 bg-slate-50 animate-pulse rounded-xl" />
              ) : transfers?.filter(t => t.toBranchId === user?.branchId).length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 border border-dashed border-slate-200 text-sm">
                  No incoming transfers found.
                </div>
              ) : (
                transfers?.filter(t => t.toBranchId === user?.branchId).map((transfer) => (
                  <div key={transfer.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg">
                          <Truck className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">From {transfer.fromBranch.name}</p>
                          <p className="text-xs text-slate-500">{new Date(transfer.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5",
                        getStatusColor(transfer.status)
                      )}>
                        {getStatusIcon(transfer.status)}
                        {transfer.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600">
                      {Array.isArray(transfer.items) && transfer.items.length} items incoming
                    </div>

                    {transfer.status === "Shipped" && (
                      <button 
                        onClick={() => updateStatus.mutate({ transferId: transfer.id, status: "Received" })}
                        className="w-full px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                      >
                        Confirm Receipt
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}
