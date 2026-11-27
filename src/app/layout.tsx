import type { Metadata, Viewport } from "next";
import { Arimo, Playfair_Display } from "next/font/google";
import "./globals.css";

// Same families as the brand material (PDF "Mercado com a Nutri").
const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

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
      className={`${arimo.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
