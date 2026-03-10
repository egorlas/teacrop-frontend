import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/Container";

const footerLinks = {
  pages: [
    { href: "/", label: "Trang chủ" },
    { href: "/about", label: "Về chúng tôi" },
    { href: "/products", label: "Sản phẩm" },
    { href: "/contact", label: "Liên hệ" },
  ],
  legal: [
    { href: "#", label: "Chính sách bảo mật" },
    { href: "#", label: "Điều khoản sử dụng" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/50">
      <Container>
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-3">
          <div>
            <Link href="/" className="mb-4 inline-block">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={150}
                height={100}
                className="h-[100px] w-[150px] object-contain"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Trà Việt Nam chất lượng cao, mang đến hương vị đậm đà truyền thống
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Trang</h3>
            <ul className="space-y-2">
              {footerLinks.pages.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Pháp lý</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, idx) => (
                <li key={`${link.href}-${idx}`}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border py-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Viettea. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </Container>
    </footer>
  );
}

