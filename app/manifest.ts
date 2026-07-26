import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Insight Magazine — by CitiPlug",
    short_name: "Insight",
    description: "Culture, city, and campus life from Ijebu Ode and beyond.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F3",
    theme_color: "#F97316",
    icons: [
      {
        src: "/icon.png",
        sizes: "1254x1254",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
