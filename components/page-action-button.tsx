"use client";

import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type LinkActionProps = {
  href: string;
  icon: ReactNode;
  label: string;
};

type ButtonActionProps = {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  disabled?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const baseClassName =
  "inline-flex items-center gap-2 rounded-xl border border-[var(--color-outline-variant)]/45 bg-[var(--color-surface-container-low)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] shadow-[0_4px_20px_rgba(0,102,255,0.05)] transition hover:bg-[var(--color-surface-container)]";

export function PageLinkActionButton({
  href,
  icon,
  label,
}: LinkActionProps) {
  return (
    <Link href={href} className={baseClassName}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function PageButtonActionButton({
  onClick,
  icon,
  label,
  disabled,
}: ButtonActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseClassName} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M19 12H5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19L5 12L12 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 6H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 12H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 18H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 6H3.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 12H3.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 18H3.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.5L12 3L21 10.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 9.5V20H19V9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 20V14H14V20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
