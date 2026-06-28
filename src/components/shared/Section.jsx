import React from "react";

// ── Section spacing classes (defined in index.css, token-driven) ──
const SECTION_SPACING_CLASS = {
  default: "section-pad-default",
  compact: "section-pad-compact",
  spacious: "section-pad-spacious",
};

// ── Inner content max-width (px) ──
const SECTION_WIDTH = {
  narrow: 720,
  default: 1080,
  wide: 1280,
};

// ── Optional surface colors ──
const SECTION_BG_CLASS = {
  light: "bg-white",
  dark: "bg-[#0A0E17] text-slate-100",
  muted: "bg-slate-50",
};

/**
 * <Section> — consistent vertical rhythm wrapper for every page section.
 *
 * @param {"default"|"compact"|"spacious"} spacing - controls vertical padding
 * @param {"light"|"dark"|"muted"} background - optional surface color
 * @param {"narrow"|"default"|"wide"} width - inner content max-width
 * @param {ReactNode} overlay - content rendered before the inner container
 *   (use for absolutely-positioned background effects)
 */
export function Section({
  spacing = "default",
  background,
  width = "default",
  className = "",
  overlay,
  children,
  ...props
}) {
  const padClass = SECTION_SPACING_CLASS[spacing] || SECTION_SPACING_CLASS.default;
  const maxW = SECTION_WIDTH[width] || SECTION_WIDTH.default;
  const bgClass = background ? SECTION_BG_CLASS[background] : "";

  return (
    <section className={`${padClass} ${bgClass} ${className}`} {...props}>
      {overlay}
      <div className="relative mx-auto px-6" style={{ maxWidth: `${maxW}px` }}>
        {children}
      </div>
    </section>
  );
}

/**
 * <SectionHeader> — heading + subtext block with fixed internal rhythm.
 *
 * Rhythm (all token-driven, 8px base):
 *   eyebrow → 24px (--space-3) → heading → 24px (--space-3) → subtext → 40px (--space-5) → CTA row
 *
 * @param {"h1"|"h2"|"h3"} as - heading level
 * @param {ReactNode} eyebrow - small label above the heading
 * @param {ReactNode} heading - the heading text/JSX
 * @param {ReactNode} subtext - the subtext paragraph
 * @param {"center"|"left"} align - text alignment
 * @param {ReactNode} children - CTA row (gets 40px margin-top)
 */
export function SectionHeader({
  as: Tag = "h2",
  eyebrow,
  heading,
  headingClassName = "",
  subtext,
  subtextClassName = "",
  align = "center",
  children,
  className = "",
}) {
  return (
    <div className={className} style={{ textAlign: align }}>
      {eyebrow && (
        <div style={{ marginBottom: "var(--space-3)" }}>{eyebrow}</div>
      )}
      <Tag
        className={headingClassName}
        style={{
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          marginBottom: "var(--space-3)",
          maxWidth: align === "center" ? "46rem" : undefined,
          margin: align === "center" ? "0 auto" : undefined,
          textWrap: "balance",
        }}
      >
        {heading}
      </Tag>
      {subtext && (
        <p
          className={subtextClassName}
          style={{
            maxWidth: "40rem",
            margin: align === "center" ? "0 auto" : undefined,
          }}
        >
          {subtext}
        </p>
      )}
      {children && (
        <div style={{ marginTop: "var(--space-5)" }}>{children}</div>
      )}
    </div>
  );
}

export default Section;