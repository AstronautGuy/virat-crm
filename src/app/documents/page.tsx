"use client";

import { DashboardLayout } from "@/app/_components/layout/DashboardLayout";
import { FeatureGate } from "@/app/_components/auth/FeatureGate";
import { FileText, Search, Filter, Download, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DocumentsPage() {
  return (
    <DashboardLayout>
      <FeatureGate featureKey="documents">
        <div className="flex flex-col space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Document Repository</h1>
              <p className="mt-2 text-lg text-gray-500">Access and manage company policies, training manuals, and staff documents.</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6">
              Upload Document
            </Button>
          </div>

          <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search documents..." className="pl-10 border-gray-100 bg-gray-50/50" />
            </div>
            <Button variant="outline" className="flex items-center gap-2 border-gray-100">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Company Policy 2024", type: "PDF", size: "2.4 MB", date: "Jan 12, 2024" },
              { name: "Field Safety Manual", type: "PDF", size: "5.1 MB", date: "Feb 05, 2024" },
              { name: "Employee Handbook", type: "DOCX", size: "1.2 MB", date: "Mar 20, 2024" },
              { name: "Training Video Guide", type: "MP4", size: "45.0 MB", date: "Apr 15, 2024" },
              { name: "Sales Script Template", type: "PDF", size: "0.8 MB", date: "Apr 22, 2024" },
            ].map((doc, i) => (
              <Card key={i} className="group hover:shadow-md transition-all duration-300 border-gray-100 rounded-3xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-100 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Eye className="w-4 h-4 text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Download className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{doc.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="bg-gray-100 px-2 py-0.5 rounded uppercase font-bold">{doc.type}</span>
                    <span>{doc.size}</span>
                    <span>{doc.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 text-center">
            <p className="text-sm text-blue-600 font-medium">Looking for something else?</p>
            <p className="text-xs text-blue-400 mt-1">Contact your manager if you need specific documents that are not listed here.</p>
          </div>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
