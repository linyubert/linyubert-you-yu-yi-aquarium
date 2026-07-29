import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sound-spy-academy.yucheng720.chatgpt.site"),
  title: "游於藝｜學習成就水族館",
  description: "每位學生都是一尾獨特的魚。匯入班級名冊、餵下成長星星，讓每一次努力清晰可見。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "游於藝｜學習成就水族館",
    description: "每一次努力，都讓成長清晰可見。",
    url: "/",
    siteName: "游於藝",
    locale: "zh_TW",
    type: "website",
    images: [{
      url: "/og-share.jpg",
      width: 1200,
      height: 630,
      alt: "游於藝｜每一次努力，都讓成長清晰可見。",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "游於藝｜學習成就水族館",
    description: "每一次努力，都讓成長清晰可見。",
    images: ["/og-share.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
