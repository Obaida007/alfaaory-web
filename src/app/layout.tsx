import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "متجر الفاعوري — شحن الألعاب والاشتراكات", template: "%s | متجر الفاعوري" },
  description: "اشحن ألعابك واشتراكاتك وبطاقاتك الإلكترونية وأرصدتك في مكان واحد — بأسعار تنافسية ومعاملات آمنة.",
};

export const viewport: Viewport = {
  themeColor: "#0c0a14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
