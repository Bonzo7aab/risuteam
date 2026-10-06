export const UNCATEGORIZED_FOLDER_SLUG = "pozostale";
export const UNCATEGORIZED_FOLDER_NAME = "Pozostałe";

export function isUncategorizedFolderSlug(slug: string): boolean {
  return slug.trim().toLowerCase() === UNCATEGORIZED_FOLDER_SLUG;
}

export function photoCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (count === 1) return "1 zdjęcie";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} zdjęcia`;
  }
  return `${count} zdjęć`;
}

export function videoCountLabel(count: number): string {
  if (count === 1) return "1 wideo";
  return `${count} wideo`;
}

export function albumCountLabel(imageCount: number, videoCount: number): string {
  const parts: string[] = [];
  if (imageCount > 0) parts.push(photoCountLabel(imageCount));
  if (videoCount > 0) parts.push(videoCountLabel(videoCount));
  if (parts.length === 0) return "Pusty folder";
  return parts.join(" · ");
}
