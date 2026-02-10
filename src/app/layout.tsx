import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthContext from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "실버 캘린더 - 시니어를 위한 AI 음성 비서",
  description: "말 한마디로 간편하게 일정을 관리하는 시니어 맞춤형 캘린더입니다.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthContext>
          <main className="container">
            {children}
          </main>
        </AuthContext>
      </body>
    </html>
  );
}
