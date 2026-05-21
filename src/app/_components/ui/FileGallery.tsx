"use client";

import { File, Download, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface StorageFile {
  id: string;
  createdAt: Date;
  entityType: "sale" | "replacement";
  entityId: number;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
}

interface FileGalleryProps {
  entityType: "sale" | "replacement";
  entityId: number;
  initialFiles?: StorageFile[];
}

export function FileGallery({
  entityType,
  entityId,
  initialFiles,
}: FileGalleryProps) {
  const { data: files, isLoading } = api.storage.getEntityFiles.useQuery(
    { entityType, entityId },
    { initialData: initialFiles },
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
        <Loader2 className="text-primary h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <p className="text-muted-foreground px-1 text-xs italic">
        No documents attached
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="bg-muted/30 border-border/50 group hover:bg-muted/50 flex items-center justify-between rounded-lg border p-2 transition-colors"
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="bg-background rounded border p-1.5 shadow-sm">
              <File className="text-primary h-3.5 w-3.5" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span
                className="truncate text-[11px] font-medium"
                title={file.originalName}
              >
                {file.originalName}
              </span>
              <span className="text-muted-foreground text-[9px] tracking-tight uppercase">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary h-7 w-7"
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
