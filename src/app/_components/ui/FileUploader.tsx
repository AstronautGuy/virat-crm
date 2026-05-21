"use client";

import { useState, useRef } from "react";
import { Upload, X, File, CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploaderProps {
  entityType: "sale" | "replacement";
  entityId: number;
  onUploadComplete?: (file: unknown) => void;
  maxFiles?: number;
}

export function FileUploader({
  entityType,
  entityId,
  onUploadComplete,
  maxFiles = 1,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadUrl = api.storage.getUploadUrl.useMutation();
  const saveMetadata = api.storage.saveFileMetadata.useMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
        const file = files[i];
        if (!file) continue;

        // 1. Get pre-signed URL
        const { url, key } = await getUploadUrl.mutateAsync({
          fileName: file.name,
          fileType: file.type,
        });

        // 2. Upload to R2
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", url);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status === 200) resolve(true);
            else reject(new Error("Upload failed"));
          };

          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.send(file);
        });

        // 3. Save metadata
        const metadata = await saveMetadata.mutateAsync({
          entityType,
          entityId,
          key,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        });

        if (onUploadComplete) {
          onUploadComplete(metadata);
        }
      }
    } catch (err) {
      console.error(err);
      setError(
        "Failed to upload file. Please check your connection and try again.",
      );
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all",
          uploading
            ? "bg-muted/50 border-muted cursor-not-allowed opacity-80"
            : "bg-card border-border hover:border-primary/50 hover:bg-accent/50",
          error ? "border-destructive/50 bg-destructive/5" : "",
        )}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
        />

        {uploading ? (
          <>
            <Loader2 className="text-primary h-10 w-10 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-medium">Uploading...</p>
              <p className="text-muted-foreground text-xs">
                {progress}% complete
              </p>
            </div>
            <div className="bg-muted mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="bg-primary/10 rounded-full p-3">
              <Upload className="text-primary h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                Click to upload {maxFiles > 1 ? "files" : "a file"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Images or PDFs up to 10MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border-destructive/20 flex items-start gap-3 rounded-lg border p-3">
          <X className="text-destructive mt-0.5 h-4 w-4" />
          <p className="text-destructive text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}
