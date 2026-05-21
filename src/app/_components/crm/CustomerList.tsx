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

      {/* Customer Table */}
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs tracking-wider text-slate-500 uppercase">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Balance</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 w-full rounded bg-slate-100" />
                    </td>
                  </tr>
                ))
              ) : customers?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                customers?.map((customer) => (
                  <tr
                    key={customer.id}
                    className="group transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 font-medium text-slate-900">
                          {customer.name}
                          <Link
                            href={`/crm/${customer.id}`}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <ExternalLink className="h-3 w-3 text-blue-500" />
                          </Link>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Phone className="h-3 w-3" /> {customer.mobile}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-700">
                          {customer.village}
                        </span>
                        <span className="text-xs text-slate-500">
                          {customer.district}, {customer.state}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          customer.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700",
                        )}
                      >
                        {customer.status === "Approved" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            "font-bold tabular-nums",
                            customer.totalPending > 0
                              ? "text-red-600"
                              : "text-emerald-600",
                          )}
                        >
                          ₹{customer.totalPending.toLocaleString()}
                        </span>
                        <span className="text-[10px] tracking-tighter text-slate-400 uppercase">
                          Total Pending
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isManager && customer.status === "Draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-emerald-200 bg-emerald-50 text-xs text-emerald-700 hover:bg-emerald-100"
                            onClick={() => approveCustomer({ id: customer.id })}
                          >
                            Approve
                          </Button>
                        )}
                        {isManager && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
