"use client";

import * as React from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="flex h-16 items-center border-b bg-white px-4 lg:px-8">
      <Link
        className="flex items-center gap-2 text-xl font-semibold text-teal-500"
        href="/"
      >
        BuyerBrokerComp
      </Link>

      {/* Desktop Navigation */}
      <nav className="ml-8 hidden gap-6 lg:flex">
        <SignedIn>
          <Link
            className="text-sm font-medium hover:text-teal-500"
            href="/new-listing"
          >
            Create Listing
          </Link>
          <Link
            className="text-sm font-medium hover:text-teal-500"
            href="/my-listings"
          >
            My Listings
          </Link>
        </SignedIn>
        <Link className="text-sm font-medium hover:text-teal-500" href="#">
          About
        </Link>
        <Link className="text-sm font-medium hover:text-teal-500" href="#">
          Contact
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-4">
        {/* Desktop Auth */}
        <div className="hidden lg:block">
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 py-6">
              <SignedIn>
                <Link
                  className="text-sm font-medium hover:text-teal-500"
                  href="/new-listing"
                  onClick={() => setIsOpen(false)}
                >
                  Create Listing
                </Link>
                <Link
                  className="text-sm font-medium hover:text-teal-500"
                  href="/my-listings"
                  onClick={() => setIsOpen(false)}
                >
                  My Listings
                </Link>
              </SignedIn>
              <Link
                className="text-sm font-medium hover:text-teal-500"
                href="#"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                className="text-sm font-medium hover:text-teal-500"
                href="#"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="pt-4">
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
