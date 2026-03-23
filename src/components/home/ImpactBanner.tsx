import { Container } from "@/components/Container";

export function ImpactBanner() {
  return (
    <section className="bg-white py-10">
      <Container>
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Cùng Tea Love lan tỏa yêu thương
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Hàng ngàn tách trà an lành mỗi ngày
            </h2>
            <p className="mt-3 max-w-xl text-sm text-gray-600 sm:text-base">
              Mỗi đơn hàng tại Tea Love là một lời gửi gắm trân trọng đến người thưởng trà.
              Chúng tôi đồng hành cùng nhà vườn địa phương và cam kết lựa chọn nguồn
              nguyên liệu minh bạch, bền vững.
            </p>
          </div>
          <div className="rounded-2xl bg-white px-8 py-5 text-center shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">
              Tách trà được phục vụ
            </p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              200,000+
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Cùng hướng đến 500,000 tách trà an lành
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

