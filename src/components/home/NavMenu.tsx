"use client";

import Link from "next/link";
import { navMenuItems } from "./data";
import { Container } from "@/components/Container";

export function NavMenu() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <Container>
        <div className="overflow-x-auto py-2 no-scrollbar">
          <ul className="flex min-w-max gap-1 md:gap-2">
            {navMenuItems.map((item) => (
              <li key={item}>
                <Link
                  href="#"
                  className="whitespace-nowrap rounded px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-pink-500"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </nav>
  );
}
