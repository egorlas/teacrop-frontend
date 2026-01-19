import { ImageResponse } from "next/og";

export const alt = "Tea Store";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
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
            gap: "20px",
          }}
        >
          <div style={{ fontSize: 96, fontWeight: "bold" }}>🍃</div>
          <div style={{ fontSize: 64, fontWeight: "bold" }}>Tea Store</div>
          <div style={{ fontSize: 32, opacity: 0.9 }}>
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

