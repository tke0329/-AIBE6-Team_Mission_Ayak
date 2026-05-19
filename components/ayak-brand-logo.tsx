import Image from "next/image";

type AyakBrandLogoProps = {
  size?: number;
  className?: string;
};

export function AyakBrandLogo({ size = 44, className }: AyakBrandLogoProps) {
  return (
    <Image
      src="/ayak-icon.png"
      alt="AYAK 아이콘"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
