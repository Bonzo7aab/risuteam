import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CirclePlay } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 overflow-hidden">
      <div className="relative w-full">
        <Image
          alt="risu team hero"
          src={"/risuhero.jpg"}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
        />
        <Card className="w-full mt-4 border-none shadow-none lg:w-1/2 max-w w-full-sm lg:mt-0 lg:absolute top-4 left-4 bg-muted/70">
          <CardHeader className="lg:py-5">
            <h1 className="lg:mt-6 max-w-[17ch] text-xl lg:text-5xl md:text-5xl font-bold !leading-[1.2] tracking-tight">
              Risu Team
            </h1>
          </CardHeader>
          <CardContent>
            <p className="lg:mt-6 max-w-[60ch] text-sm lg:text-lg">
              Risu Team to klub sportowy oferujący zajęcia dla dzieci, młodzieży
              oraz doroslych. Zajęcia prowadzone są przez doświadczonych
              instruktorów, którzy dbają o bezpieczeństwo i indywidualne
              podejście do każdego uczestnika.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Hero;
