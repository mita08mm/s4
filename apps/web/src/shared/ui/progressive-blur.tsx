// Adapted from Skiper UI "skiper41" (Progressive Blur): content fades and
// blurs as it scrolls under a fixed edge.
type ProgressiveBlurProps = {
  position?: "top" | "bottom";
  height?: string;
  blurAmount?: string;
  className?: string;
};

export function ProgressiveBlur({
  position = "top",
  height = "120px",
  blurAmount = "6px",
  className = "",
}: ProgressiveBlurProps) {
  const isTop = position === "top";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 select-none ${className}`}
      style={{
        [isTop ? "top" : "bottom"]: 0,
        height,
        background: `linear-gradient(to ${isTop ? "top" : "bottom"}, transparent, var(--background))`,
        maskImage: `linear-gradient(to ${isTop ? "bottom" : "top"}, black 50%, transparent)`,
        backdropFilter: `blur(${blurAmount})`,
        WebkitBackdropFilter: `blur(${blurAmount})`,
      }}
    />
  );
}
