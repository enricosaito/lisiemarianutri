import type { Metadata, Viewport } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lisie Maria Nutricionista",
  description: "Área de pacientes da Lisie Maria Nutricionista",
};

// Edge-to-edge on phones (safe areas handled in the header and bottom bars).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fffdf6",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
