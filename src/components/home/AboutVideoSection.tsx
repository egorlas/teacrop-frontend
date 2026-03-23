import React from "react";

export function AboutVideoSection() {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* About us */}


      {/* Video YouTube */}
      <section className="bg-white py-8">
        <section>
          <div className="mx-auto max-w-3xl py-16 px-4 py-2 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Về chúng tôi
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Trà là nghệ - nhân là người - chúng tôi yêu trà vì nó ngon
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-[#f7f7f7] shadow-none">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/Nm3ZJWKl1mI?si=N57jFtgY_xkSMIm9"
                title="YouTube video player"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

