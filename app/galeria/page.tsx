import { BlurGallery } from "@/components/ui/blur-gallery";
import { Metadata } from "next";
import { fetchGalleryImages } from "@/app/actions";

export const metadata: Metadata = {
  title: "Risu Team | Galeria",
};

export default async function Gallery() {
  const { data: images, error } = await fetchGalleryImages();
  const galleryImages =
    images?.map((img) => ({ src: img.image_url, alt: img.alt })) || [];

  return (
    <div className="my-8">
      <div className="text-center text-4xl mb-16 flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">Galeria</h1>
      </div>
      {error && (
        <div className="text-red-500 text-center py-8">
          Błąd ładowania galerii: {error}
        </div>
      )}
      {(!images || images.length === 0) && !error && (
        <div className="text-center py-8">Brak zdjęć do wyświetlenia.</div>
      )}
      {images && images.length > 0 && <BlurGallery images={galleryImages} />}
    </div>
  );
}
