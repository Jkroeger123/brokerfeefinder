import * as React from "react";
import SearchBox from "~/components/search-box";

export default function HomePage() {
  return (
    <main className="flex-1">
      <div className="relative h-[calc(100vh-4rem)] w-full">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm"
          style={{
            backgroundImage:
              "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5bchTkoNu02pNVTPU87gLYTDyic.jpg-yH6K7tozRSWdCi91SJ4clDrLKQu6VC.jpeg')",
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative flex h-full flex-col items-center justify-center px-4 lg:px-8">
          <div className="mb-8 max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-normal text-white lg:text-6xl">
              Find Buyer Broker Fees Instantly
            </h1>
            <p className="text-lg text-white/90">
              Access up-to-date buyer broker fee information for properties
              across the United States. No more guesswork or outdated data.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <SearchBox />
          </div>
        </div>
      </div>
    </main>
  );
}
