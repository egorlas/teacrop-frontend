"use client";

import { Bell } from "lucide-react";

const MESSAGES = [
  "Miễn phí giao hàng toàn quốc cho đơn từ 499k.",
  "Giảm thêm 15% cho combo quà tặng Tea Love.",
  "Thành viên Tea Love Club tích điểm đổi quà hấp dẫn.",
];

export function TopBar() {
  return (
    <div className="bg-[#00b4a5] text-emerald-50">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2 text-[0.9rem] sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-hidden">
          <Bell className="h-4 w-4 shrink-0" />
          <div className="relative w-[260px] sm:w-[360px] md:w-[960px] overflow-hidden">
            <div className="flex min-w-full gap-8 animate-[topbar-ticker_18s_linear_infinite] whitespace-nowrap">
              {MESSAGES.concat(MESSAGES).map((msg, i) => (
                <span key={`${msg}-${i}`} className="shrink-0">
                  {msg}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes topbar-ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
