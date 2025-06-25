import React, { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils";
import { createClient } from "@/utils/supabase/client";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  onRemove?: (index: number) => void;
  onFilesChange?: (files: File[]) => void;
  bucket?: string; // default: "camps"
  folder?: string; // optional folder path in bucket
  className?: string;
}

const ImageUploadComponent: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  onRemove,
  onFilesChange,
  bucket = "camps",
  folder = "",
  className = "",
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setError(null);
  };

  const handleRemove = (idx: number) => {
    if (selectedFiles.length > 0) {
      const newFiles = selectedFiles.filter((_, i) => i !== idx);
      setSelectedFiles(newFiles);
    } else {
      if (onRemove) onRemove(idx);
      else onChange(images.filter((_, i) => i !== idx));
    }
  };

  const getFileNameFromPath = (path: string): string => {
    const parts = path.split("/");
    return parts[parts.length - 1] || path;
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* IMPORTANT: The bucket (default: 'camps') must exist in Supabase Storage and be public. */}
      <Input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileInputChange}
      />
      {/* List selected files with preview below input */}
      {selectedFiles.length > 0 ? (
        <div className="flex flex-col gap-2 mt-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-1 bg-gray-50 rounded w-fit"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-12 h-12 object-cover rounded border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <span className="text-gray-600 truncate max-w-xs flex-1">
                {file.name}
              </span>
              <button
                type="button"
                className="ml-4 p-1 text-black hover:text-red-600 transition-colors"
                onClick={() => handleRemove(index)}
                aria-label="Remove selected image"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        images.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {images.map((imagePath, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-1 bg-gray-50 rounded"
              >
                {/* Small image preview */}
                <img
                  src={imagePath}
                  alt={getFileNameFromPath(imagePath)}
                  className="w-12 h-12 object-cover rounded border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="text-xs text-gray-600 truncate max-w-xs flex-1">
                  {getFileNameFromPath(imagePath)}
                </span>
                <button
                  type="button"
                  className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  onClick={() => handleRemove(index)}
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )
      )}
      {error && (
        <div className="text-red-500 text-sm">
          {error.includes("Bucket not found") ? (
            <>
              Bucket not found. You must create a public bucket named '
              <b>{bucket}</b>' in Supabase Storage.{" "}
              <a
                href="https://supabase.com/docs/guides/storage/buckets/creating-buckets"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                See docs
              </a>
              .
            </>
          ) : (
            error
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploadComponent;
export type ImageFile = {
  url: string;
  name: string;
  size: number;
};
