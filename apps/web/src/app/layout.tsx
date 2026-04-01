import type { Metadata } from "next";
import { ThemeProvider } from "@workspace/ui";
import "./globals.css";
import "@workspace/ui/globals.css";
import { AIChatbot } from "@/components/common/ai/ai-chat-widget";

export const metadata: Metadata = {
  title: "云学考系统",
  description: "云学考系统学员端 Next.js 重构工程",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <AIChatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
