"use client";

import { cn } from "@/lib/cn";
import { useFifaNavigationOptional } from "@/context/FifaNavigationContext";
import { playUiSelectSound } from "@/lib/sfx";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";

export type FifaTileVariant = "hero" | "panel" | "card";

interface TileProps {
  title: string;
  subtitle?: string;
  description?: string;
  variant?: FifaTileVariant;
  backgroundImage?: string;
  imagePosition?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  children?: ReactNode;
  showDots?: boolean;
  activeDot?: number;
  dotCount?: number;
  watermark?: string;
  navIndex?: number;
}

export function Tile({
  title,
  subtitle,
  description,
  variant = "panel",
  backgroundImage,
  imagePosition = "right bottom",
  onClick,
  href,
  className,
  children,
  showDots,
  activeDot = 0,
  dotCount = 3,
  watermark,
  navIndex,
}: TileProps) {
  const nav = useFifaNavigationOptional();
  const isKeyboardFocused =
    navIndex !== undefined && (nav?.isTileFocused(navIndex) ?? false);

  const isInteractive = Boolean(href || onClick);

  const handleTilePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    playUiSelectSound();
  };

  const Wrapper = href ? "a" : isInteractive ? "button" : "div";
  const wrapperProps = href
    ? {
        href,
        target: "_blank" as const,
        rel: "noopener noreferrer",
      }
    : isInteractive
      ? {
          type: "button" as const,
          onClick,
        }
      : {
          role: "button" as const,
          tabIndex: 0,
          onKeyDown: (event: KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              playUiSelectSound();
            }
          },
        };

  return (
    <div
      className={cn("fifa-tile-wrap h-full min-h-0", className)}
      data-fifa-tile-index={navIndex}
      onPointerDown={handleTilePointerDown}
      onMouseEnter={
        navIndex !== undefined
          ? () => nav?.setFocusToTile(navIndex)
          : undefined
      }
    >
      <Wrapper
        {...wrapperProps}
        className={cn(
          "fifa-tile group relative flex h-full w-full min-h-0 flex-col overflow-hidden text-left",
          `fifa-tile-${variant}`,
          "fifa-tile-interactive cursor-pointer",
          isKeyboardFocused && "fifa-tile-keyboard-focused",
        )}
      >
        {backgroundImage && (
          <div
            className={cn(
              "fifa-tile-photo",
              variant === "hero" && "fifa-tile-photo-hero",
              variant === "panel" && "fifa-tile-photo-panel",
              variant === "card" && "fifa-tile-photo-card",
            )}
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundPosition: imagePosition,
            }}
          />
        )}

        {variant === "hero" && backgroundImage && (
          <div className="fifa-tile-hero-fade" aria-hidden="true" />
        )}

        {variant === "panel" && backgroundImage && (
          <div className="fifa-tile-panel-fade" aria-hidden="true" />
        )}

        {watermark && (
          <div className="fifa-tile-watermark" aria-hidden="true">
            <span>{watermark}</span>
          </div>
        )}

        <div className="fifa-tile-content">
          <h2 className="fifa-tile-title">{title}</h2>
          {subtitle && <p className="fifa-tile-subtitle">{subtitle}</p>}
          {description && (
            <p className="fifa-tile-description">{description}</p>
          )}
          {children && <div className="fifa-tile-body">{children}</div>}
        </div>

        {showDots && (
          <div className="fifa-pagination-dots">
            {Array.from({ length: dotCount }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "fifa-pagination-dot",
                  i === activeDot && "fifa-pagination-dot-active",
                )}
              />
            ))}
          </div>
        )}
      </Wrapper>
    </div>
  );
}
