import type { StaticImageData } from "next/image";
import photo2020 from "@/assets/Educational/2020.jpg";
import photo2022 from "@/assets/Educational/2022.jpg";
import photo2026 from "@/assets/Educational/2026.jpg";

export const educationImages: Record<
  "2020" | "2022" | "2026",
  StaticImageData
> = {
  "2020": photo2020,
  "2022": photo2022,
  "2026": photo2026,
};
