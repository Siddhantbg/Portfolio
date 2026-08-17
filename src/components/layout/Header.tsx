"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { profile } from "@/data/portfolio";
import { cn } from "@/lib/cn";
import { HeaderAudio } from "@/components/audio/HeaderAudio";

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M7.1 9.4H4.7V19h2.4V9.4zM5.9 5C5.1 5 4.4 5.7 4.4 6.5S5.1 8 5.9 8s1.5-.7 1.5-1.5S6.7 5 5.9 5zM19.3 13.3c0-3-1.6-4.4-3.7-4.4-1.7 0-2.5.9-2.9 1.6V9.4H10.3c0 1.1 0 9.6 0 9.6h2.4v-5.4c0-.3 0-.6.1-.8.3-.6.9-1.2 1.9-1.2 1.3 0 1.8 1 1.8 2.5V19h2.4v-5.7z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#111"
        d="M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.9 9.6.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.6.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c2-.1 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7 1 .7 2v2.9c0 .3.2.6.7.5 4-1.3 6.9-5.1 6.9-9.6C22 6.6 17.5 2 12 2z"
      />
    </svg>
  );
}

function LeetCodeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#FFA116"
        d="M13.5 3.2 8.2 8.4a4.4 4.4 0 0 0 0 6.2l5.3 5.2 1.6-1.6-5.3-5.2a2.2 2.2 0 0 1 0-3.1l5.3-5.2-1.6-1.5z"
      />
      <path
        fill="#000"
        d="M16.2 7.4h-5.1v2.1h5.1a2.6 2.6 0 0 1 0 5.2h-2.4v2.1h2.4a4.7 4.7 0 0 0 0-9.4z"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="url(#connect-mail)" />
      <path
        fill="#fff"
        d="M6.2 8.2h11.6c.4 0 .7.3.7.7v6.2c0 .4-.3.7-.7.7H6.2c-.4 0-.7-.3-.7-.7V8.9c0-.4.3-.7.7-.7zm.8 1.4v.3l5 3.2 5-3.2v-.3H7zm10 1.3-4.6 2.9c-.2.2-.6.2-.8 0L7 10.9v4.2h10V10.9z"
      />
      <defs>
        <linearGradient id="connect-mail" x1="4" y1="3" x2="20" y2="22">
          <stop stopColor="#4DA3FF" />
          <stop offset="1" stopColor="#1A6DFF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const socialLinks: Array<{
  id: string;
  label: string;
  subtitle: string;
  href: string;
  icon: ReactNode;
}> = [
  {
    id: "linkedin",
    label: "LinkedIn",
    subtitle: "Professional network",
    href: profile.linkedin,
    icon: <LinkedInIcon />,
  },
  {
    id: "github",
    label: "GitHub",
    subtitle: "Code & projects",
    href: profile.github,
    icon: <GitHubIcon />,
  },
  {
    id: "leetcode",
    label: "LeetCode",
    subtitle: "Problem solving",
    href: profile.leetcode,
    icon: <LeetCodeIcon />,
  },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
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

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyEmail(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

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
            <div className="connect-menu" role="menu" aria-label="Connect">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="connect-menu-row"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <span className="connect-menu-icon">{link.icon}</span>
                  <span className="connect-menu-copyblock">
                    <span className="connect-menu-title">{link.label}</span>
                    <span className="connect-menu-sub">{link.subtitle}</span>
                  </span>
                  <span className="connect-menu-chevron" aria-hidden>
                    ›
                  </span>
                </a>
              ))}

              <div className="connect-menu-row connect-menu-row-email">
                <span className="connect-menu-icon">
                  <EmailIcon />
                </span>
                <span className="connect-menu-copyblock">
                  <span className="connect-menu-title">Email</span>
                  <span className="connect-menu-sub">Send me a message</span>
                </span>
                <button
                  type="button"
                  className="connect-copy-btn"
                  onClick={copyEmail}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
                <a
                  href={`mailto:${profile.email}`}
                  className="connect-mail-btn"
                  aria-label="Open email"
                  onClick={() => setOpen(false)}
                >
                  Email
                  <span aria-hidden>›</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
