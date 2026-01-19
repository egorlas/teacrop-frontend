import { buildMetadata } from "@/lib/seo";
import { ContactForm } from "./ContactForm";

export const metadata = buildMetadata({
  title: "Liên hệ",
  description: "Liên hệ với Tea Store - chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn",
});

export default function ContactPage() {
  return (
    <section className="py-16 sm:py-24">
      <ContactForm />
    </section>
  );
}

