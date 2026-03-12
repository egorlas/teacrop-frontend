"use client";

import { Tag, Package, Zap, Ticket, Award } from "lucide-react";
import { featureIcons } from "./data";
import { Container } from "@/components/Container";

const iconMap = {
  tag: Tag,
  package: Package,
  zap: Zap,
  ticket: Ticket,
  award: Award,
} as const;

export function FeatureIcons() {
  return (
    <section className="border-b border-gray-200 bg-white py-4">
      <Container>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {featureIcons.map((item) => {
            const Icon =
              iconMap[item.icon as keyof typeof iconMap] ?? Tag;
            return (
              <a
                key={item.id}
                href="#"
                className="flex flex-col items-center gap-2 rounded-lg p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-400/10">
                  <Icon className="h-6 w-6 text-pink-500" />
                </div>
                <span className="text-center text-xs font-medium text-gray-700">
                  {item.label}
                </span>
              </a>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
