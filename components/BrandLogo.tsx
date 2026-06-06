import Image from "next/image";

type BrandLogoProps = {
  variant?: "mark" | "full";
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ variant = "mark", className = "", priority = false }: BrandLogoProps) {
  const isFull = variant === "full";
  const lightSource = isFull ? "/brand/auction-arena-logo-transparent.png" : "/brand/auction-arena-mark-transparent.png";
  const darkSource = isFull ? "/brand/auction-arena-logo-dark.png" : "/brand/auction-arena-mark-dark.png";

  return (
    <span
      className={`brand-logo ${className}`}
      style={{ aspectRatio: isFull ? "827 / 567" : "421 / 395" }}
    >
      <Image src={lightSource} alt="Auction Arena logo" fill sizes={isFull ? "260px" : "52px"} className="brand-logo-light object-contain" priority={priority} />
      <Image src={darkSource} alt="" fill sizes={isFull ? "260px" : "52px"} className="brand-logo-dark object-contain" priority={priority} aria-hidden />
    </span>
  );
}
