"use client";

import { api } from "@/trpc/react";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  IndianRupee,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CustomerListProps {
  isManager?: boolean;
}

export function CustomerList({ isManager = false }: CustomerListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: customers,
    isLoading,
    refetch,
  } = api.crm.getBranchCustomers.useQuery(
    { search: searchQuery },
    { placeholderData: (previousData) => previousData },
  );

  const { mutate: approveCustomer } = api.crm.approveCustomer.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by Name or Mobile..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Customer List */}
      <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-5">
                <div className="flex gap-4 items-center">
                  <div className="bg-slate-200 dark:bg-slate-800 h-10 w-10 rounded-xl" />
                  <div className="flex flex-col gap-2">
                     <div className="bg-slate-200 dark:bg-slate-800 h-4 w-32 rounded" />
                     <div className="bg-slate-200 dark:bg-slate-800 h-3 w-20 rounded" />
                  </div>
                </div>
                <div className="bg-slate-200 dark:bg-slate-800 h-8 w-24 rounded-full" />
              </div>
            ))
          ) : customers?.length === 0 ? (
            <div className="text-slate-500 px-6 py-12 text-center font-medium italic">
              No customers found matching your search.
            </div>
          ) : (
            customers?.map((customer) => (
              <div
                key={customer.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group relative"
              >
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold shadow-sm">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 dark:text-slate-100 text-base font-bold tracking-tight">
                        {customer.name}
                      </span>
                      <Link
                        href={`/crm/${customer.id}`}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        title="View Customer Details"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Phone className="h-3 w-3" /> {customer.mobile}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" /> {customer.village}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                  <div className="flex flex-col sm:items-end">
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Total Pending
                    </span>
                    <span
                      className={cn(
                        "text-lg font-bold tabular-nums",
                        customer.totalPending > 0
                          ? "text-rose-500"
                          : "text-emerald-500"
                      )}
                    >
                      ₹{customer.totalPending.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm",
                        customer.status === "Approved"
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-400 text-amber-950",
                      )}
                    >
                      {customer.status === "Approved" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )}
                      {customer.status}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      {isManager && customer.status === "Draft" && (
                        <Button
                          size="sm"
                          className="h-7 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[10px] uppercase font-bold tracking-wider"
                          onClick={() => approveCustomer({ id: customer.id })}
                        >
                          Approve
                        </Button>
                      )}
                      {isManager && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-3 text-blue-600 hover:bg-blue-50 text-[10px] uppercase font-bold tracking-wider"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
