/**
 * Static paths under `public/images` served by Next as `/images/...`.
 * Run `gallery:syncPublicFolderGallery` (admin) to insert missing items into Convex.
 * When adding files to public/images, append entries here and run sync again.
 */
export const PUBLIC_GALLERY_IMAGE_MANIFEST = [
  {
    imageUrl: "/images/652855775_122163406388748139_8085305856522333687_n.jpg",
    title: "Zajęcia Risu Team",
  },
  {
    imageUrl: "/images/654197779_122163407402748139_2742728780677275494_n.jpg",
    title: "Trening z dziećmi",
  },
  {
    imageUrl: "/images/hero-girl-500-plus.png",
    title: "Risu Team",
  },
] as const;
