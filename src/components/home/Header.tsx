"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";

export function Header() {
  return (
    <header className="bg-gradient-to-r from-pink-300 to-rose-300 py-3">
      <Container>
        <div className="flex flex-col">
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="Tea Love - Home"
          >
            <Image
              src="/tealogo.png"
              alt="Tea Love"
              width={360}
              height={96}
              priority
              className="h-12 w-auto md:h-14"
            />
          </Link>
        </div>
      </Container>
    </header>
  );
}
