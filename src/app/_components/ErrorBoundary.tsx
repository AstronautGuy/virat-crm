"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] items-center justify-center p-4 text-center">
          <Card className="max-w-md border-destructive/20 bg-destructive/5">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
                <AlertCircle className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. This has been logged, and we're working to fix it.
              </p>
              {process.env.NODE_ENV === "development" && (
                <div className="rounded bg-black/10 p-4 text-left font-mono text-[10px] overflow-auto max-h-40">
                  {this.state.error?.toString()}
                </div>
              )}
              <Button onClick={this.handleReset} variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reload Application
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.children;
  }
}
