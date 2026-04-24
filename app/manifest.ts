import type { MetadataRoute } from "next";

const appName = "루틴 코치 대시보드";
const appDescription =
  "철인3종 훈련, 식단과 영양, 신앙과 취미 루틴을 날짜별로 기록하는 개인 루틴 관리 앱입니다.";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: "루틴 코치",
    description: appDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#eef1f4",
    theme_color: "#f7f7f8",
    icons: [
      {
        src: "/pwa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
