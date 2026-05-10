"use client";

import { api } from "@/trpc/react";
import { format } from "date-fns";
import { 
  FileText, 
  User, 
  Calendar, 
  ChevronRight, 
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportListProps {
  isManager?: boolean;
}

export function ReportList({ isManager = false }: ReportListProps) {
  const [search, setSearch] = useState("");
  
  const myReports = api.dailyReports.listMyReports.useQuery(undefined, {
    enabled: !isManager,
  });
  
  const branchReports = api.dailyReports.listBranchReports.useQuery(undefined, {
    enabled: isManager,
  });

  const reports = isManager ? branchReports.data : myReports.data;
  const isLoading = isManager ? branchReports.isLoading : myReports.isLoading;

  const filteredReports = reports?.filter(report => 
    report.content.toLowerCase().includes(search.toLowerCase()) ||
    (report.customer?.name.toLowerCase().includes(search.toLowerCase())) ||
    (isManager && `${report.user.firstName} ${report.user.lastName}`.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <div className="pl-3">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <Input
          placeholder="Search reports by content, employee, or customer..."
          className="border-none focus-visible:ring-0 bg-transparent text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredReports && filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card key={report.id} className="group overflow-hidden border-slate-200 hover:border-blue-200 hover:shadow-md transition-all duration-200 rounded-2xl">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left: Metadata */}
                  <div className="bg-slate-50/50 p-6 md:w-64 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {format(new Date(report.reportDate), "MMM dd, yyyy")}
                      </div>
                      
                      {isManager && (
                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">
                            {report.user.firstName} {report.user.lastName}
                          </span>
                        </div>
                      )}

                      {report.customer && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-white border-blue-100 text-blue-600 hover:bg-blue-50 text-[10px] py-0 px-2 rounded-full">
                            Customer: {report.customer.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 md:mt-0 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                      ID: #{report.id}
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Report Narrative</span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap line-clamp-4 group-hover:line-clamp-none transition-all">
                          {report.content}
                        </p>
                      </div>
                      <div className="hidden md:block">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="text-[10px] text-slate-400">
                        Submitted at {format(new Date(report.createdAt), "hh:mm a")}
                      </div>
                      <button className="text-blue-600 text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 hover:underline">
                        View Full History <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg">No reports found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
              {search ? "No reports match your current search filters." : "Try submitting your first daily report using the 'Submit Report' tab."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
