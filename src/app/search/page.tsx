import * as React from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";

export default function SearchResults() {
  return (
    <main className="flex-1 p-4 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-50 to-blue-100 p-8">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h1 className="mb-2 text-4xl font-normal">Broker Fee Results</h1>
              <p className="text-gray-600">
                Found 6 properties with broker fee information
              </p>
            </div>
            <Input
              className="max-w-xs"
              placeholder="Search through results..."
              type="search"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full">
              Reset Filters
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  Location ▼
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>New York</DropdownMenuItem>
                <DropdownMenuItem>Los Angeles</DropdownMenuItem>
                <DropdownMenuItem>Chicago</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  Property Type ▼
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Single Family</DropdownMenuItem>
                <DropdownMenuItem>Condo</DropdownMenuItem>
                <DropdownMenuItem>Multi-Family</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  Price Range ▼
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>$0 - $500,000</DropdownMenuItem>
                <DropdownMenuItem>$500,000 - $1,000,000</DropdownMenuItem>
                <DropdownMenuItem>$1,000,000+</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              type: "Single Family",
              subType: "Residential",
              image: "/placeholder.svg",
              price: "$450,000",
              brokerFee: "2.5%",
              title: "Modern Family Home",
              address: "123 Main St, Beverly Hills, CA",
              mls: "MLS#: BH291023",
              details: { beds: "4", baths: "3", sqft: "2,800" },
            },
            {
              type: "Condo",
              subType: "Residential",
              image: "/placeholder.svg",
              price: "$350,000",
              brokerFee: "2.25%",
              title: "Downtown Luxury Condo",
              address: "456 Park Ave, Manhattan, NY",
              mls: "MLS#: NY582910",
              details: { beds: "2", baths: "2", sqft: "1,200" },
            },
            {
              type: "Multi-Family",
              subType: "Investment",
              image: "/placeholder.svg",
              price: "$750,000",
              brokerFee: "3%",
              title: "Income Property Complex",
              address: "789 Revenue Rd, Chicago, IL",
              mls: "MLS#: CH729401",
              details: { beds: "6", baths: "4", sqft: "3,600" },
            },
            // More properties...
          ].map((property, i) => (
            <Card key={i} className="group overflow-hidden">
              <CardHeader className="relative p-0">
                <Image
                  src={property.image}
                  alt={property.title}
                  width={400}
                  height={300}
                  className="h-[240px] w-full object-cover"
                />
                <div className="absolute left-4 top-4 flex gap-2">
                  <Badge variant="secondary" className="bg-white/90">
                    {property.type}
                  </Badge>
                  <Badge variant="secondary" className="bg-white/90">
                    {property.subType}
                  </Badge>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-4 bg-white/90 hover:bg-white"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-semibold">{property.price}</p>
                    <p className="font-medium text-teal-600">
                      Buyer Broker Fee: {property.brokerFee}
                    </p>
                  </div>
                </div>
                <h3 className="mb-1 font-medium">{property.title}</h3>
                <p className="mb-1 text-sm text-gray-600">{property.address}</p>
                <p className="text-sm text-gray-600">{property.mls}</p>
              </CardContent>
              <CardFooter className="flex gap-4 p-4 pt-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {property.details.beds}
                  </span>
                  <span className="text-sm text-gray-600">bed</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {property.details.baths}
                  </span>
                  <span className="text-sm text-gray-600">bath</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    {property.details.sqft}
                  </span>
                  <span className="text-sm text-gray-600">sqft</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
