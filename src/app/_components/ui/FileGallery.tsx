"use client";

import { File, Download, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FileGalleryProps {
  entityType: "sale" | "replacement";
  entityId: number;
  initialFiles?: any[];
}

export function FileGallery({ entityType, entityId, initialFiles }: FileGalleryProps) {
  const { data: files, isLoading } = api.storage.getEntityFiles.useQuery(
    { entityType, entityId },
    { initialData: initialFiles }
  );

  const getUrlMutation = api.storage.getFileUrl.useMutation();
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (fileId: string, originalName: string) => {
    try {
      setDownloading(fileId);
      const { url } = await getUrlMutation.mutateAsync({ fileId });
      
      // Open in new tab or trigger download
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to get download URL");
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading && !initialFiles) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic px-1">No documents attached</p>
    );
  }

  return (
    <div className="grid gap-2">
      {files.map((file) => (
        <div 
          key={file.id} 
          className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50 group hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-background rounded border shadow-sm">
              <File className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-medium truncate" title={file.originalName}>
                {file.originalName}
              </span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-tight">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            onClick={() => handleDownload(file.id, file.originalName)}
            disabled={downloading === file.id}
          >
            {downloading === file.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
