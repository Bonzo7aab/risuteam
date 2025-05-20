import { BlurGallery } from "@/components/ui/blur-gallery";
import React from "react";

const images = [
  {
    src: "/gallery1.jpg",
    alt: "zdjecie1",
  },
  {
    src: "/gallery2.jpg",
    alt: "zdjecie2",
  },
  {
    src: "/gallery3.jpg",
    alt: "zdjecie3",
  },
  {
    src: "/gallery4.jpg",
    alt: "zdjecie4",
  },
  {
    src: "/gallery5.jpg",
    alt: "zdjecie5",
  },
  {
    src: "/gallery6.jpg",
    alt: "zdjecie6",
  },
  {
    src: "/gallery7.jpg",
    alt: "zdjecie7",
  },
  {
    src: "/gallery8.jpg",
    alt: "zdjecie8",
  },
  {
    src: "/gallery9.jpg",
    alt: "zdjecie9",
  },
  {
    src: "/gallery10.jpg",
    alt: "zdjecie10",
  },
  {
    src: "/gallery11.jpg",
    alt: "zdjecie11",
  },
  {
    src: "/gallery12.jpg",
    alt: "zdjecie12",
  },
  {
    src: "/gallery13.jpg",
    alt: "zdjecie13",
  },
  {
    src: "/gallery14.jpg",
    alt: "zdjecie14",
  },
  {
    src: "/gallery15.jpg",
    alt: "zdjecie15",
  },
  {
    src: "/gallery16.jpg",
    alt: "zdjecie16",
  },
  {
    src: "/gallery17.jpg",
    alt: "zdjecie17",
  },
  {
    src: "/gallery18.jpg",
    alt: "zdjecie18",
  },
  {
    src: "/gallery19.jpg",
    alt: "zdjecie19",
  },
  {
    src: "/gallery20.jpg",
    alt: "zdjecie20",
  },
  {
    src: "/gallery21.jpg",
    alt: "zdjecie21",
  },
  {
    src: "/gallery22.jpg",
    alt: "zdjecie22",
  },
  {
    src: "/gallery23.jpg",
    alt: "zdjecie23",
  },
  {
    src: "/gallery24.jpg",
    alt: "zdjecie24",
  },
];

const Gallery = () => {
  return (
    <div className="my-8">
      <div className="text-center text-4xl mb-16 flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">Galeria</h1>
      </div>
      <BlurGallery images={images} />
    </div>
  );
};

export default Gallery;
