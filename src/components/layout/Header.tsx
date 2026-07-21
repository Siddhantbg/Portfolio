"use client";

import { useState, useRef, useEffect } from "react";
import { profile } from "@/data/portfolio";
import { cn } from "@/lib/cn";
import { HeaderAudio } from "@/components/audio/HeaderAudio";

export function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const links = [
    { label: "LinkedIn", href: profile.linkedin },
    { label: "GitHub", href: profile.github },
    { label: "LeetCode", href: profile.leetcode },
    { label: "Email", href: `mailto:${profile.email}` },
  ];

  return (
    <header className="relative z-20 flex shrink-0 items-center justify-between px-3 py-2 md:px-5 md:py-2">
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold tracking-wide text-white drop-shadow-md md:text-2xl">
          {profile.name.split(" ")[0]}
        </span>
        <span className="text-xl font-bold tracking-wide text-white/90 drop-shadow-md md:text-2xl">
          {profile.name.split(" ").slice(1).join(" ")}
        </span>
        <span className="ml-1 text-sm font-semibold text-white/70 md:text-base">
          {profile.gradYear}
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <HeaderAudio />

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "connect-pill flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wider text-[#333] transition hover:brightness-105 md:px-6 md:py-2.5 md:text-sm",
            )}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#333] text-[10px] text-white">
              ▶
            </span>
            CONNECT
          </button>

          {open && (
            <div className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-sm border border-white/80 bg-white/95 shadow-xl backdrop-blur-md">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.label === "Email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="block px-4 py-2.5 text-sm font-medium text-[#333] transition hover:bg-white"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
