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
      setError("Failed to upload file. Please check your connection and try again.");
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
          "relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center gap-3",
          uploading ? "bg-muted/50 border-muted opacity-80 cursor-not-allowed" : "bg-card border-border hover:border-primary/50 hover:bg-accent/50",
          error ? "border-destructive/50 bg-destructive/5" : ""
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
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="text-center">
              <p className="text-sm font-medium">Uploading...</p>
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
            <div className="w-full max-w-xs h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="p-3 bg-primary/10 rounded-full">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                Click to upload {maxFiles > 1 ? "files" : "a file"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Images or PDFs up to 10MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
          <X className="w-4 h-4 text-destructive mt-0.5" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
