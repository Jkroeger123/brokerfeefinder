import * as React from "react";
import Link from "next/link";
import { Heart, Search, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="flex h-16 items-center border-b bg-white px-4 lg:px-8">
      <Link
        className="flex items-center gap-2 text-xl font-semibold text-teal-500"
        href="/"
      >
        BrokerFeeFind
      </Link>
      <nav className="ml-8 hidden gap-6 lg:flex">
        <SignedIn>
          <Link
            className="text-sm font-medium hover:text-teal-500"
            href="/new-listing"
          >
            Create Listing
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
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Heart className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
