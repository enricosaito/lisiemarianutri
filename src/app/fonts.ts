import { Arimo, Playfair_Display } from "next/font/google";

// Same families as the brand material (PDF "Mercado com a Nutri").
// Shared by the root layout and global-error, which renders its own <html>.
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

export const fontVariables = `${arimo.variable} ${playfair.variable}`;
