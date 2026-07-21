"use client";

import Image from "next/image";
import type { EducationQualification } from "@/data/portfolio";
import { educationImages } from "@/lib/education-images";
import { cn } from "@/lib/cn";

interface EducationCardProps {
  qualification: EducationQualification;
  variant?: "preview" | "timeline";
  className?: string;
}

export function EducationCard({
  qualification,
  variant = "timeline",
  className,
}: EducationCardProps) {
  const image = educationImages[qualification.imageKey];

  return (
    <article
      className={cn(
        "edu-card",
        variant === "preview" && "edu-card-preview",
        variant === "timeline" && "edu-card-timeline",
        qualification.isActive && "edu-card-active",
        className,
      )}
    >
      <div className="edu-card-photo-wrap">
        <Image
          src={image}
          alt={`${qualification.year} — ${qualification.milestone}`}
          fill
          className="edu-card-photo"
          sizes={variant === "preview" ? "180px" : "220px"}
        />
      </div>
      <div className="edu-card-body">
        <p className="edu-card-year">{qualification.year}</p>
        <p className="edu-card-milestone">{qualification.milestone}</p>
        {qualification.detail && (
          <p className="edu-card-detail">{qualification.detail}</p>
        )}
      </div>
    </article>
  );
}
