"use client";

import Image from "next/image";

type CategoryItemProps = {
  name: string;
  image: string;
};

export function CategoryItem({ name, image }: CategoryItemProps) {
  return (
    <a
      href="#"
      className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-gray-50"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 sm:h-16 sm:w-16">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          sizes="64px"
          unoptimized
        />
      </div>
      <span className="line-clamp-2 text-center text-xs font-medium text-gray-700">
        {name}
      </span>
    </a>
  );
}
