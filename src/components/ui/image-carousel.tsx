"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { type Image as ImageType } from "@prisma/client";
import { cn } from "~/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";
import { type CarouselApi } from "~/components/ui/carousel";

interface CarouselProps {
  images: ImageType[];
  viewImages?: 1 | 2;
  className?: string;
  preventClickPropagation?: boolean;
}

export function ImageCarousel({
  images,
  viewImages = 1,
  className = "",
  preventClickPropagation = false,
}: CarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  // Check if we need carousel UI
  const showCarouselUI = images.length > viewImages;

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Only add keyboard navigation when carousel is needed
  React.useEffect(() => {
    if (!api || !showCarouselUI) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        api.scrollPrev();
      } else if (event.key === "ArrowRight") {
        api.scrollNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [api, showCarouselUI]);

  const handleCarouselButton = (e: React.MouseEvent, action: () => void) => {
    if (preventClickPropagation) {
      e.stopPropagation();
    }
    action();
  };

  if (!images.length) return null;

  // If we don't need carousel, render simple grid
  if (!showCarouselUI) {
    return (
      <div className={cn("relative mx-auto w-full", className)}>
        <div
          className={cn(
            "grid gap-4",
            viewImages === 1 ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-lg"
            >
              <Image
                src={image.url}
                alt={`Property image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group/carousel relative mx-auto w-full", className)}>
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-4">
          {images.map((image, index) => (
            <CarouselItem
              key={image.id}
              className={cn(
                "pl-4",
                viewImages === 1 ? "basis-full" : "basis-1/2",
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                <Image
                  src={image.url}
                  alt={`Property image ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Controls */}
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-4 opacity-0 transition-opacity duration-200 group-hover/carousel:opacity-100">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={(e) => handleCarouselButton(e, () => api?.scrollPrev())}
            data-carousel-button="true"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            onClick={(e) => handleCarouselButton(e, () => api?.scrollNext())}
            data-carousel-button="true"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 opacity-0 transition-opacity duration-200 group-hover/carousel:opacity-100">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 rounded-full transition-all",
                index === current
                  ? "w-4 bg-white"
                  : "w-2 bg-white/50 hover:bg-white/75",
              )}
              onClick={(e) =>
                handleCarouselButton(e, () => api?.scrollTo(index))
              }
              data-carousel-button="true"
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
}
