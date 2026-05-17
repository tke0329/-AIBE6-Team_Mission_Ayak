"use client";

type AyakBrandLogoProps = {
  size?: number;
  className?: string;
};

export function AyakBrandLogo({ size = 44, className }: AyakBrandLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="120" height="120" rx="24" fill="#0066ff" fillOpacity="0.05" />
      <path
        d="M40 45C40 36.7157 46.7157 30 55 30H65C73.2843 30 80 36.7157 80 45V75C80 83.2843 73.2843 90 65 90H55C46.7157 90 40 83.2843 40 75V45Z"
        stroke="#0066ff"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path d="M60 50V70" stroke="#0066ff" strokeWidth="8" strokeLinecap="round" />
      <path d="M50 60H70" stroke="#0066ff" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M40 60H80"
        stroke="#0066ff"
        strokeWidth="2"
        strokeDasharray="4 4"
        opacity="0.3"
      />
    </svg>
  );
}
