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
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Document Repository
              </h1>
              <p className="mt-2 text-lg text-gray-500">
                Access and manage company policies, training manuals, and staff
                documents.
              </p>
            </div>
            <Button className="rounded-xl bg-blue-600 px-6 font-bold text-white hover:bg-blue-700">
              Upload Document
            </Button>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search documents..."
                className="border-gray-100 bg-gray-50/50 pl-10"
              />
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-100"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Company Policy 2024",
                type: "PDF",
                size: "2.4 MB",
                date: "Jan 12, 2024",
              },
              {
                name: "Field Safety Manual",
                type: "PDF",
                size: "5.1 MB",
                date: "Feb 05, 2024",
              },
              {
                name: "Employee Handbook",
                type: "DOCX",
                size: "1.2 MB",
                date: "Mar 20, 2024",
              },
              {
                name: "Training Video Guide",
                type: "MP4",
                size: "45.0 MB",
                date: "Apr 15, 2024",
              },
              {
                name: "Sales Script Template",
                type: "PDF",
                size: "0.8 MB",
                date: "Apr 22, 2024",
              },
            ].map((doc, i) => (
              <Card
                key={i}
                className="group overflow-hidden rounded-3xl border-gray-100 transition-all duration-300 hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-2xl bg-blue-50 p-3 transition-colors group-hover:bg-blue-100">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                      >
                        <Eye className="h-4 w-4 text-gray-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                      >
                        <Download className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="mb-1 font-bold text-gray-900">{doc.name}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="rounded bg-gray-100 px-2 py-0.5 font-bold uppercase">
                      {doc.type}
                    </span>
                    <span>{doc.size}</span>
                    <span>{doc.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50/50 p-8 text-center">
            <p className="text-sm font-medium text-blue-600">
              Looking for something else?
            </p>
            <p className="mt-1 text-xs text-blue-400">
              Contact your manager if you need specific documents that are not
              listed here.
            </p>
          </div>
        </div>
      </FeatureGate>
    </DashboardLayout>
  );
}
