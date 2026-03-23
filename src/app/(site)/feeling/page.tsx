import { Be_Vietnam_Pro } from "next/font/google";
import { Container } from "@/components/Container";
import { TeaFeelingIntro } from "@/components/tea-feeling/TeaFeelingIntro";
import { TeaFeelingExperience } from "@/components/tea-feeling/TeaFeelingExperience";
import { teaFeelingRepository } from "@/lib/tea-feeling/teaFeelingRepository";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tea Feeling — Gợi ý trà theo cảm xúc & thời tiết",
  description:
    "Chọn tâm trạng và thời tiết trên ma trận 6×6 để nhận gợi ý trà phù hợp — 36 tổ hợp, mỗi tổ hợp một trà.",
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default async function TeaFeelingPage() {
  const payload = await teaFeelingRepository.getMatrixPayload();

  return (
    <div
      className={`${beVietnamPro.className} relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-emerald-950/5 via-stone-50 to-amber-50/30`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-900/10 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-amber-200/20 blur-3xl"
      />

      <Container className="relative max-w-6xl px-3 py-8 sm:px-4 sm:py-12 lg:px-8 lg:py-16">
        <div className="space-y-8 sm:space-y-10 lg:space-y-12">
          <TeaFeelingIntro />
          <TeaFeelingExperience payload={payload} />
        </div>
      </Container>
    </div>
  );
}
