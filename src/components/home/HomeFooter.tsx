"use client";

import Link from "next/link";
import { Container } from "@/components/Container";

const footerSections = [
  {
    title: "Chăm sóc khách hàng",
    links: [
      { label: "Trung tâm trợ giúp", href: "#" },
      { label: "Blog trà", href: "#" },
      { label: "Cửa hàng trà", href: "/products" },
      { label: "Hướng dẫn pha trà", href: "#" },
      { label: "Thanh toán", href: "#" },
      { label: "Vận chuyển", href: "#" },
    ],
  },
  {
    title: "Về Tea Love",
    links: [
      { label: "Giới thiệu", href: "/about" },
      { label: "Tuyển dụng", href: "#" },
      { label: "Điều khoản", href: "#" },
      { label: "Chính sách bảo mật", href: "#" },
      { label: "Liên hệ", href: "/contact" },
    ],
  },
  {
    title: "Thanh toán",
    links: [
      { label: "Ví Momo", href: "#" },
      { label: "Thẻ tín dụng", href: "#" },
      { label: "Chuyển khoản", href: "#" },
      { label: "Thanh toán khi nhận", href: "#" },
    ],
  },
  {
    title: "Theo dõi Tea Love",
    links: [
      { label: "Facebook", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "TikTok", href: "#" },
    ],
  },
];

export function HomeFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-gray-200 bg-white">
      <Container>
        <div className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-2 md:grid-cols-4">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold text-gray-800">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-gray-600 transition-colors hover:text-pink-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 py-4 text-center">
          <p className="text-xs text-gray-500">
            © {currentYear} Tea Love. Bảo lưu mọi quyền.
          </p>
        </div>
      </Container>
    </footer>
  );
}
