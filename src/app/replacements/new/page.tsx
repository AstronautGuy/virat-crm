"use client";

import { DashboardLayout } from "../../_components/layout/DashboardLayout";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewReplacement() {
  const router = useRouter();
  
  const [originalSaleId, setOriginalSaleId] = useState("");
  const [reason, setReason] = useState("");

  const { mutate: createReplacement, isPending } = api.replacements.createReplacement.useMutation({
    onSuccess: () => {
      router.push("/replacements");
      router.refresh();
    },
    onError: (error) => {
      alert(`Error submitting request: ${error.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReplacement({
      originalSaleId: parseInt(originalSaleId),
      reason,
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4 max-w-xl mx-auto">
        <div className="flex items-center space-x-2">
          <Link href="/replacements">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Submit Replacement</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="originalSaleId" className="text-xs">Original Sale ID</Label>
                <Input 
                  id="originalSaleId" 
                  value={originalSaleId} 
                  onChange={e => setOriginalSaleId(e.target.value)} 
                  required 
                  type="number" 
                  placeholder="e.g. 123" 
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="reason" className="text-xs">Reason for Replacement</Label>
                <Textarea 
                  id="reason" 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  required 
                  rows={4} 
                  placeholder="Please describe why this item needs to be replaced..." 
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Request
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
