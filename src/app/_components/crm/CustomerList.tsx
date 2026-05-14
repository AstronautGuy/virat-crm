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
  IndianRupee
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
  
  const { data: customers, isLoading, refetch } = api.crm.getBranchCustomers.useQuery(
    { search: searchQuery },
    { placeholderData: (previousData) => previousData }
  );

  const { mutate: approveCustomer } = api.crm.approveCustomer.useMutation({
    onSuccess: () => {
      void refetch();
    }
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by Name or Mobile..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Balance</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : customers?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No customers found matching your search.
                  </td>
                </tr>
              ) : (
                customers?.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 flex items-center gap-1">
                          {customer.name}
                          <Link href={`/crm/${customer.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-3 h-3 text-blue-500" />
                          </Link>
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {customer.mobile}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-700">{customer.village}</span>
                        <span className="text-xs text-slate-500">{customer.district}, {customer.state}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1",
                        customer.status === "Approved" 
                          ? "bg-emerald-50 text-emerald-700" 
                          : "bg-amber-50 text-amber-700"
                      )}>
                        {customer.status === "Approved" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={cn(
                          "font-bold tabular-nums",
                          customer.totalPending > 0 ? "text-red-600" : "text-emerald-600"
                        )}>
                          ₹{customer.totalPending.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Total Pending</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isManager && customer.status === "Draft" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                            onClick={() => approveCustomer({ id: customer.id })}
                          >
                            Approve
                          </Button>
                        )}
                        {isManager && (
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700">
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
