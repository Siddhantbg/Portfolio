"use client";

import Image from "next/image";
import landingBg from "@/assets/Landing_background.png";

export function StadiumBackground() {
  return (
    <div className="stadium-bg" aria-hidden="true">
      <Image
        src={landingBg}
        alt=""
        fill
        priority
        quality={90}
        className="object-cover object-center"
        sizes="100vw"
      />
    </div>
  );
}
