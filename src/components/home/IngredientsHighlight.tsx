import Image from "next/image";
import { Container } from "@/components/Container";

const ingredients = [
  {
    id: "chamomile",
    name: "Hoa cúc",
    description:
      "Những bông hoa cúc khô nguyên bông, giúp thư giãn và dễ ngủ hơn sau một ngày dài.",
    image:
      "https://placehold.co/240x160/fdf2f8/db2777?text=Hoa+c%C3%BAc",
  },
  {
    id: "green-tea",
    name: "Trà xanh",
    description:
      "Lá trà xanh chọn lọc từ các vùng trà nổi tiếng, vị thanh dịu và giàu chất chống oxy hoá.",
    image:
      "https://placehold.co/240x160/ecfdf3/16a34a?text=Tr%C3%A0+xanh",
  },
  {
    id: "lotus",
    name: "Sen",
    description:
      "Hương sen Việt tinh tế, được ướp cùng trà theo phương pháp truyền thống.",
    image:
      "https://placehold.co/240x160/eff6ff/2563eb?text=Sen+Vi%E1%BB%87t",
  },
  {
    id: "cinnamon",
    name: "Quế",
    description:
      "Vị quế ngọt ấm giúp tách trà thêm tròn vị, phù hợp cho những ngày se lạnh.",
    image:
      "https://placehold.co/240x160/fff7ed/f97316?text=Qu%E1%BA%BF",
  },
];

export function IngredientsHighlight() {
  return (
    <section className="border-b border-gray-200 bg-white py-10">
      <Container>
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">
              Nguyên liệu được chọn lọc
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Lá trà và thảo mộc tạo nên tách trà Tea Love
            </h2>
            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              Từ lá trà xanh, hoa cúc đến hương sen, mỗi loại nguyên liệu đều được Tea Love
              nâng niu để bạn cảm nhận trọn vẹn hương vị trong từng ngụm trà.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ingredients.map((item) => (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
              >
                <div className="relative h-32 w-full">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 240px"
                    unoptimized
                  />
                </div>
                <div className="flex flex-1 flex-col px-4 py-4">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-xs text-gray-600 sm:text-sm">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

