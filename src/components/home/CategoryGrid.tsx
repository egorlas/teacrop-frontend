"use client";

import { categories } from "./data";
import { CategoryItem } from "./CategoryItem";
import { Container } from "@/components/Container";

export function CategoryGrid() {
  return (
    <section className="border-b border-gray-200 bg-white py-6">
      <Container>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Danh mục
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {categories.map((cat) => (
            <CategoryItem key={cat.id} name={cat.name} image={cat.image} />
          ))}
        </div>
      </Container>
    </section>
  );
}
