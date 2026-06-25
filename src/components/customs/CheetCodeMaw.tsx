import * as React from "react";

export interface CheetCodeMawProps extends React.SVGProps<SVGSVGElement> {
  /** Rendered width & height in px. Default 96. */
  size?: number;
  /** Mark color. Defaults to currentColor (inherits text color). */
  color?: string;
  /** Animate a "chomp" on hover. Default true. */
  animate?: boolean;
}

/**
 * CheetCode — the open-jaw "maw" mark.
 * Two opposing toothy jaws. Black & white, fully background-safe (teeth are
 * real transparency via an SVG mask — no white fills), scales to any size,
 * and chomps on hover.
 *
 *   <CheetCodeMaw size={120} />
 *   <CheetCodeMaw color="#fff" />        // on dark
 *   <CheetCodeMaw animate={false} />     // static
 */
export function CheetCodeMaw({
  size = 96,
  color = "currentColor",
  animate = true,
  style,
  ...rest
}: CheetCodeMawProps) {
  // Unique mask ids so multiple instances on a page don't collide.
  const uid = React.useId().replace(/[:]/g, "");
  const upId = `ccMawUp-${uid}`;
  const lowId = `ccMawLow-${uid}`;

  // Chomp travel scales with the mark so it reads the same at any size.
  const travel = `${(size * 0.06).toFixed(2)}px`;

  return (
    <span
      className={animate ? "cheetcode-maw cheetcode-maw--anim" : "cheetcode-maw"}
      style={{
        display: "inline-flex",
        color,
        ["--cc-m" as any]: travel,
        lineHeight: 0,
      }}
    >
      <style>{CSS}</style>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        role="img"
        aria-label="CheetCode"
        style={style}
        {...rest}
      >
        <defs>
          <mask id={upId} maskUnits="userSpaceOnUse">
            <ellipse cx="50" cy="25" rx="35" ry="16" fill="#fff" />
            <ellipse cx="50" cy="7" rx="35" ry="17" fill="#000" />
            <circle cx="38" cy="41" r="6" fill="#000" />
            <circle cx="50" cy="42" r="6" fill="#000" />
            <circle cx="62" cy="41" r="6" fill="#000" />
          </mask>
          <mask id={lowId} maskUnits="userSpaceOnUse">
            <ellipse cx="50" cy="75" rx="35" ry="16" fill="#fff" />
            <ellipse cx="50" cy="93" rx="35" ry="17" fill="#000" />
            <circle cx="38" cy="59" r="6" fill="#000" />
            <circle cx="50" cy="58" r="6" fill="#000" />
            <circle cx="62" cy="59" r="6" fill="#000" />
          </mask>
        </defs>
        <g className="cc-jaw cc-up">
          <rect x="0" y="0" width="100" height="100" fill="currentColor" mask={`url(#${upId})`} />
        </g>
        <g className="cc-jaw cc-low">
          <rect x="0" y="0" width="100" height="100" fill="currentColor" mask={`url(#${lowId})`} />
        </g>
      </svg>
    </span>
  );
}

const CSS = `
.cheetcode-maw .cc-jaw {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform .2s ease;
}
.cheetcode-maw--anim:hover .cc-up  { animation: cheetcodeChompUp  .6s ease-in-out infinite; }
.cheetcode-maw--anim:hover .cc-low { animation: cheetcodeChompLow .6s ease-in-out infinite; }
@keyframes cheetcodeChompUp {
  0%, 100% { transform: translateY(0); }
  45%      { transform: translateY(var(--cc-m)); }
}
@keyframes cheetcodeChompLow {
  0%, 100% { transform: translateY(0); }
  45%      { transform: translateY(calc(-1 * var(--cc-m))); }
}
@media (prefers-reduced-motion: reduce) {
  .cheetcode-maw--anim:hover .cc-up,
  .cheetcode-maw--anim:hover .cc-low { animation: none; }
}
`;

export default CheetCodeMaw;
