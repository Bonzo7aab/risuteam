import { BlurGallery } from "@/components/ui/blur-gallery";
import React from "react";

const images = [
  {
    src: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Nebula in deep space",
  },
  {
    src: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Galaxy formation",
  },
  {
    src: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Northern Lights",
  },
  {
    src: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Meteor shower",
  },
  {
    src: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Space Station",
  },
  {
    src: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Astronaut in space",
  },
  {
    src: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Milky Way galaxy",
  },
  {
    src: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Solar eclipse",
  },
  {
    src: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Rocket launch",
  },
  {
    src: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Astronaut in space",
  },
  {
    src: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Milky Way galaxy",
  },
  {
    src: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Solar eclipse",
  },
  {
    src: "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=compress&cs=tinysrgb&fit=crop&w=800&q=80",
    alt: "Rocket launch",
  },
];

const Gallery = () => {
  return (
    <div className="my-8">
      <div className="text-center text-2xl mb-16 flex justify-center">
        <h1 className="border-b-2 pb-2 border-risu-400 w-fit">Galeria</h1>
      </div>
      <BlurGallery images={images} />
    </div>
  );
};

export default Gallery;
