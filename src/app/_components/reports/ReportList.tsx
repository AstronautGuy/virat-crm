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
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeSlabHistory } from "./TimeSlabHistory";
import { useState } from "react";

interface ReportListProps {
  isManager?: boolean;
}

export function ReportList({ isManager = false }: ReportListProps) {
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const myReports = api.dailyReports.listMyReports.useQuery(undefined, {
    enabled: !isManager,
  });

  const branchReports = api.dailyReports.listBranchReports.useQuery(undefined, {
    enabled: isManager,
  });

  const reports = isManager ? branchReports.data : myReports.data;
  const isLoading = isManager ? branchReports.isLoading : myReports.isLoading;

  const filteredReports = reports?.filter(
    (report) =>
      report.content.toLowerCase().includes(search.toLowerCase()) ||
      (report.customer?.name.toLowerCase().includes(search.toLowerCase()) ??
        false) ||
      (isManager &&
        `${report.user.firstName} ${report.user.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase())),
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
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="pl-3">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <Input
          placeholder="Search reports by content, employee, or customer..."
          className="border-none bg-transparent text-sm focus-visible:ring-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredReports && filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <Card
              key={report.id}
              className="group overflow-hidden rounded-2xl border-slate-200 transition-all duration-200 hover:border-blue-200 hover:shadow-md"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left: Metadata */}
                  <div className="flex flex-col justify-between border-b border-slate-100 bg-slate-50/50 p-6 md:w-64 md:border-r md:border-b-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        {format(new Date(report.reportDate), "MMM dd, yyyy")}
                      </div>

                      {isManager && (
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">
                            {report.user.firstName} {report.user.lastName}
                          </span>
                        </div>
                      )}

                      {report.customer && (
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="rounded-full border-blue-100 bg-white px-2 py-0 text-[10px] text-blue-600 hover:bg-blue-50"
                          >
                            Customer: {report.customer.name}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 font-mono text-[10px] tracking-wider text-slate-400 uppercase md:mt-0">
                      ID: #{report.id}
                    </div>
                  </div>

                  {/* Right: Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2 text-slate-400">
                          <FileText className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold tracking-widest uppercase">
                            Report Narrative
                          </span>
                        </div>
                        <p className="line-clamp-4 text-sm leading-relaxed whitespace-pre-wrap text-slate-700 transition-all group-hover:line-clamp-none">
                          {report.content}
                        </p>
                      </div>
                      <div className="hidden md:block">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 transition-colors group-hover:bg-blue-50 group-hover:text-blue-500">
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                      <div className="text-[10px] text-slate-400">
                        Submitted at{" "}
                        {format(new Date(report.createdAt), "hh:mm a")}
                      </div>
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="flex items-center gap-1 text-[10px] font-bold tracking-tight text-blue-600 uppercase hover:underline"
                      >
                        View Full History <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No reports found
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
              {search
                ? "No reports match your current search filters."
                : "Try submitting your first daily report using the 'Submit Report' tab."}
            </p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="sm:max-w-[600px] overflow-hidden bg-slate-50/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
              History for {selectedReport && format(new Date(selectedReport.reportDate), "MMM dd, yyyy")}
            </DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <TimeSlabHistory 
              userId={selectedReport.user.id} 
              date={new Date(selectedReport.reportDate)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
