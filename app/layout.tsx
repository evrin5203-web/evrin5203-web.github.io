import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/cyrillic-400.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/roboto-condensed/cyrillic-400.css";
import "@fontsource/roboto-condensed/cyrillic-600.css";
import "@fontsource/roboto-condensed/latin-400.css";
import "@fontsource/roboto-condensed/latin-600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Angelina — Somewhere Around Here",
  description: "The endless portfolio world of designer and art director Angelina Bolgova.",
  other: { "codex-preview": "development" },
  icons: {
    icon: [{ url: "/favicon.png?v=angelina-2", type: "image/png", sizes: "180x180" }],
    shortcut: "/favicon.png?v=angelina-2",
    apple: "/favicon.png?v=angelina-2",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
