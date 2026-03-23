"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";

export function Header() {
  return (
    <header className="py-6 shadow-lg" style={{ backgroundColor: "#d91b5c" }}>
      <Container>
        <div className="flex flex-col items-center">
          <Link
            href="/"
            className="flex shrink-0 items-center justify-center"
            aria-label="Tea Love - Home"
          >
            <Image
              src="/tealogo.png"
              alt="Tea Love"
              width={480}
              height={120}
              priority
              className="h-12 w-auto md:h-14"
            />
          </Link>
        </div>
      </Container>
    </header>
  );
}
