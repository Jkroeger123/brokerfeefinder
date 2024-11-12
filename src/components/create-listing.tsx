"use client";

import * as React from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function CreateListingComponent() {
  const [listingType, setListingType] = React.useState("scratch");

  return (
    <main className="flex-1 bg-gray-50 p-4 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-semibold">Create New Listing</h1>
          <p className="text-gray-600">
            Add a new property listing with accurate broker fee information.
          </p>
        </div>

        <Tabs defaultValue="scratch" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="scratch"
              onClick={() => setListingType("scratch")}
            >
              Create from Scratch
            </TabsTrigger>
            <TabsTrigger
              value="zillow"
              onClick={() => setListingType("zillow")}
            >
              Import from Zillow
            </TabsTrigger>
          </TabsList>
          <TabsContent value="scratch">
            <Card>
              <CardHeader>
                <CardTitle>Create Listing from Scratch</CardTitle>
                <CardDescription>
                  Enter all the details for your new property listing.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Listing Title</Label>
                      <Input id="title" placeholder="Enter listing title" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        placeholder="Enter price"
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="broker-fee">Buyer Broker Fee (%)</Label>
                      <Input
                        id="broker-fee"
                        placeholder="Enter broker fee percentage"
                        type="number"
                        step="0.01"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mls">MLS Number</Label>
                      <Input id="mls" placeholder="Enter MLS number" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Enter full address" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        placeholder="Number of bedrooms"
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        placeholder="Number of bathrooms"
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sqft">Square Feet</Label>
                      <Input
                        id="sqft"
                        placeholder="Total square feet"
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property-type">Property Type</Label>
                    <Select>
                      <SelectTrigger id="property-type">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-family">
                          Single Family
                        </SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="multi-family">
                          Multi-Family
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter property description"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Listing
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="zillow">
            <Card>
              <CardHeader>
                <CardTitle>Import from Zillow</CardTitle>
                <CardDescription>
                  Enter a Zillow listing URL to import property details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="zillow-url">Zillow Listing URL</Label>
                    <Input
                      id="zillow-url"
                      placeholder="https://www.zillow.com/homedetails/..."
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Import from Zillow
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {listingType === "zillow" && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Imported Listing Details</CardTitle>
              <CardDescription>
                Review and edit the imported information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                {/* This form will be populated with data from Zillow import */}
                {/* It's similar to the "from scratch" form, but with pre-filled data */}
                {/* For brevity, I'm not repeating all the fields here */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="imported-title">Listing Title</Label>
                    <Input id="imported-title" placeholder="Imported title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imported-price">Price</Label>
                    <Input
                      id="imported-price"
                      placeholder="Imported price"
                      type="number"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="imported-broker-fee">
                      Buyer Broker Fee (%)
                    </Label>
                    <Input
                      id="imported-broker-fee"
                      placeholder="Enter broker fee percentage"
                      type="number"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imported-mls">MLS Number</Label>
                    <Input
                      id="imported-mls"
                      placeholder="Imported MLS number"
                    />
                  </div>
                </div>
                {/* More fields would be here... */}
                <Button type="submit" className="w-full">
                  Create Listing from Import
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
