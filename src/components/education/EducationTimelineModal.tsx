"use client";

import { useEffect, useRef } from "react";
import { educationQualifications } from "@/data/portfolio";
import { EducationCard } from "@/components/education/EducationCard";
import { cn } from "@/lib/cn";

interface EducationTimelineModalProps {
  open: boolean;
  onClose: () => void;
}

export function EducationTimelineModal({
  open,
  onClose,
}: EducationTimelineModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="edu-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="edu-modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edu-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="edu-modal-header">
          <h2 id="edu-modal-title" className="edu-modal-title">
            Education Qualifications
          </h2>
          <button
            type="button"
            className="edu-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="edu-timeline">
          {educationQualifications.map((qualification, index) => (
            <div key={qualification.id} className="edu-timeline-item">
              {index > 0 && (
                <div className="edu-timeline-bridge" aria-hidden="true">
                  <span className="edu-timeline-line" />
                  <span
                    className={cn(
                      "edu-timeline-dot",
                      qualification.isActive && "edu-timeline-dot-active",
                    )}
                  />
                  <span className="edu-timeline-line" />
                </div>
              )}
              <EducationCard qualification={qualification} variant="timeline" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
