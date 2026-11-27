import type { MetadataRoute } from "next";

// Lets patients add the app to their phone's home screen with the brand icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lisie Maria Nutricionista",
    short_name: "Lisie Nutri",
    description: "Área de pacientes da Lisie Maria Nutricionista",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf6",
    theme_color: "#fffdf6",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
