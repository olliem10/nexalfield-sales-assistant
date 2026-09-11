"use client";

import type { ReactNode } from "react";
import { cx } from "./primitives";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink">
        {label}
      </span>
      {hint ? (
        <span className="mb-2 block text-[12px] leading-relaxed text-ink-faint">
          {hint}
        </span>
      ) : null}
      {children}
    </label>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  return <input {...props} className={cx("nf-field", props.className)} />;
}

export function TextArea({
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={rows}
      className={cx("nf-field resize-y leading-relaxed", props.className)}
    />
  );
}

export function Select({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx("nf-field appearance-none bg-white pr-8", props.className)}
    >
      {children}
    </select>
  );
}

/** Segmented control — faster to hit than a dropdown while on a call. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-canvas p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cx(
            "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors",
            value === option.value
              ? "bg-white text-ink shadow-sm ring-1 ring-line"
              : "text-ink-muted hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
