import { ImageResponse } from "next/og";

export const alt = "Viettea - Trà Việt Nam chất lượng cao";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const baseUrl =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <img
            src={`${baseUrl}/logo.svg`}
            alt=""
            width={400}
            height={240}
            style={{ objectFit: "contain" }}
          />
          <div style={{ fontSize: 32, opacity: 0.95 }}>
            Trà Việt Nam chất lượng cao
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

