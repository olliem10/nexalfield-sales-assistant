"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { OpportunityRating, WebsiteStatus } from "@/lib/types";
import { WEBSITE_STATUS_LABEL } from "@/lib/tokens";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------- Button ---------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "accent" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white hover:bg-black active:bg-black border border-ink",
  accent:
    "bg-blush-100 text-ink hover:bg-blush-200 border border-blush-200 active:bg-blush-200",
  secondary:
    "bg-white text-ink border border-line hover:border-ink/25 hover:bg-canvas",
  ghost: "bg-transparent text-ink-muted hover:text-ink hover:bg-canvas",
  danger:
    "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-[13px] rounded-lg",
  md: "h-11 px-4 text-[14px] rounded-xl",
  lg: "h-13 px-6 text-[15px] rounded-xl py-3.5",
};

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex select-none items-center justify-center gap-2 font-medium transition-colors duration-75",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blush-100",
        "disabled:cursor-not-allowed disabled:opacity-40",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "secondary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "inline-flex select-none items-center justify-center gap-2 font-medium transition-colors duration-75",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blush-100",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}

/* ---------------- Badges ---------------- */

export function OpportunityBadge({
  rating,
  size = "md",
}: {
  rating: OpportunityRating;
  size?: "sm" | "md";
}) {
  const map: Record<OpportunityRating, { dot: string; text: string; label: string }> = {
    high: { dot: "bg-emerald-500", text: "text-emerald-700", label: "High opportunity" },
    medium: { dot: "bg-amber-500", text: "text-amber-700", label: "Medium opportunity" },
    low: { dot: "bg-red-500", text: "text-red-700", label: "Low opportunity" },
  };
  const s = map[rating];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-white font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        s.text,
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function WebsiteStatusBadge({ status }: { status: WebsiteStatus }) {
  const tone =
    status === "none" || status === "poor"
      ? "text-red-700 border-red-100 bg-red-50/60"
      : status === "outdated"
        ? "text-amber-700 border-amber-100 bg-amber-50/60"
        : status === "good"
          ? "text-emerald-700 border-emerald-100 bg-emerald-50/60"
          : "text-ink-muted border-line bg-canvas";
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone,
      )}
    >
      {WEBSITE_STATUS_LABEL[status]}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "muted";
}) {
  const tones = {
    neutral: "border-line bg-white text-ink-muted",
    accent: "border-blush-200 bg-blush-50 text-ink",
    muted: "border-line bg-canvas text-ink-faint",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/* ---------------- Layout bits ---------------- */

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="nf-label">{children}</div>;
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cx("nf-card", className)}>{children}</div>;
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="nf-card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="h-10 w-10 rounded-full bg-blush-100" />
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="max-w-sm text-sm text-ink-muted">{body}</p>
      {action}
    </div>
  );
}
