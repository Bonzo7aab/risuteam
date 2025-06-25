import { redirect } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Shrink an image file to a maximum size (in MB) using canvas.
 * Returns a new File (or Blob) that is <= maxSizeMB.
 * Supports JPEG, PNG, WebP. Tries to preserve as much quality as possible.
 */
export async function shrinkImageToMaxSize(
  file: File,
  maxSizeMB: number = 3,
  minQuality: number = 0.5,
  minWidth: number = 600,
  minHeight: number = 600
): Promise<File> {
  if (file.size <= maxSizeMB * 1024 * 1024) return file;
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      let [w, h] = [img.width, img.height];
      let quality = 0.92;
      let type = file.type === "image/png" ? "image/png" : "image/jpeg";
      let blob: Blob | null = null;
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      // Try reducing quality first, then dimensions if needed
      for (let attempt = 0; attempt < 10; attempt++) {
        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, type, quality)
        );
        if (blob && blob.size <= maxSizeMB * 1024 * 1024) {
          const newFile = new File([blob], file.name, { type });
          URL.revokeObjectURL(url);
          return resolve(newFile);
        }
        // Reduce quality if possible
        if (quality > minQuality) {
          quality -= 0.15;
          if (quality < minQuality) quality = minQuality;
        } else {
          // Reduce dimensions by 80% if quality is already low
          w = Math.max(Math.floor(w * 0.8), minWidth);
          h = Math.max(Math.floor(h * 0.8), minHeight);
          // If already at min size, break
          if (w === minWidth && h === minHeight) break;
        }
      }
      // If still too big, return the smallest we got
      if (blob) {
        const newFile = new File([blob], file.name, { type });
        URL.revokeObjectURL(url);
        return resolve(newFile);
      }
      URL.revokeObjectURL(url);
      reject(new Error("Could not shrink image below max size"));
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for resizing"));
    };
    img.src = url;
  });
}
