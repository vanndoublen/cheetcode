import React, { useEffect, useRef, useState, type CSSProperties } from "react";

interface SubmissionResult {
  passed: boolean;
  runtime: string;
  memory: string;
}

interface SubmissionOverlayProps {
  visible?: boolean;
  onDone?: (result: SubmissionResult) => void;
  color?: string;
  theme?: "dark" | "light";
  duration?: number;
}

/**
 * SubmissionOverlay
 *
 * Props:
 *   visible    boolean                      — show/hide the overlay
 *   onDone     (result: SubmissionResult) => void — called when fake run finishes
 *   color      string                       — blob/accent color, e.g. "#22c55e" or "oklch(72% 0.22 160)"
 *   theme      "dark" | "light"              — controls backdrop + text colors
 *   duration   number                        — total ms before result fires (default 4500)
 */
export default function SubmissionOverlay({
  visible = false,
  onDone,
  color = "oklch(72% 0.22 160)",
  theme = "dark",
  duration = 4500,
}: SubmissionOverlayProps) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [statusVisible, setStatusVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dotsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDark = theme === "dark";

  const STATUSES = [
    "compiling",
    "running tests",
    "checking edge cases",
    "analyzing complexity",
    "validating output",
  ];

  useEffect(() => {
    if (visible) {
      setStatusIndex(0);
      setStatusVisible(true);
      let i = 0;
      const step = duration / STATUSES.length;

      intervalRef.current = setInterval(() => {
        i++;
        if (i >= STATUSES.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
        setStatusVisible(false);
        dotsTimeoutRef.current = setTimeout(() => {
          setStatusIndex(i);
          setStatusVisible(true);
        }, 200);
      }, step);

      timeoutRef.current = setTimeout(() => {
        onDone?.({
          passed: Math.random() > 0.3,
          runtime: `${Math.floor(Math.random() * 30 + 28)}ms`,
          memory: `${(Math.random() * 2 + 13.2).toFixed(1)} MB`,
        });
      }, duration);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (dotsTimeoutRef.current) clearTimeout(dotsTimeoutRef.current);
      setStatusVisible(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (dotsTimeoutRef.current) clearTimeout(dotsTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const backdrop = isDark
    ? "rgba(8, 8, 12, 0.65)"
    : "rgba(245, 245, 248, 0.72)";

  const statusColor = color;

  return (
    <>
      {/* SVG goo filter — rendered once, invisible */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter
            id="sov-goo"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div style={styles.overlay(visible, backdrop)}>
        {/* Freeze vignette */}
        <div style={styles.vignette(isDark)} />

        {/* Blob stage */}
        <div style={styles.stage}>
          {/* Soft ambient glow */}
          <div style={styles.glow(color)} />

          {/* Blobs with goo filter */}
          <div style={styles.filterWrap}>
            <div style={{ ...styles.blob, ...styles.blobCore(color) }} />
            <div style={{ ...styles.blob, ...styles.orbit(color, "b1") }} />
            <div style={{ ...styles.blob, ...styles.orbit(color, "b2") }} />
            <div style={{ ...styles.blob, ...styles.orbit(color, "b3") }} />
            <div style={{ ...styles.blob, ...styles.orbit(color, "b4") }} />
            <div style={{ ...styles.blob, ...styles.orbit(color, "b5", true) }} />
          </div>

          {/* Status text */}
          <div style={styles.statusWrap}>
            <span style={styles.statusText(statusVisible, statusColor)}>
              {STATUSES[statusIndex]}
              <DotsAnimated />
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

/** Animated ellipsis dots */
function DotsAnimated() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const t = setInterval(
      () => setDots((d) => (d.length >= 3 ? "" : d + ".")),
      380
    );
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ display: "inline-block", width: "1.4em", textAlign: "left" }}>
      {dots}
    </span>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const styles = {
  overlay: (visible: boolean, backdrop: string): CSSProperties => ({
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(3px)",
    WebkitBackdropFilter: "blur(3px)",
    backgroundColor: backdrop,
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? "all" : "none",
    transition: "opacity 0.3s ease",
  }),

  vignette: (isDark: boolean): CSSProperties => ({
    position: "absolute",
    inset: 0,
    background: isDark
      ? "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%)"
      : "radial-gradient(ellipse at center, transparent 30%, rgba(200,200,210,0.45) 100%)",
    pointerEvents: "none",
  }),

  stage: {
    position: "relative",
    width: 280,
    height: 280,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  } as CSSProperties,

  glow: (color: string): CSSProperties => ({
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${color}44 0%, transparent 68%)`,
    animation: "sov-glow 2.4s ease-in-out infinite",
    pointerEvents: "none",
  }),

  filterWrap: {
    position: "absolute",
    inset: 0,
    filter: "url(#sov-goo)",
  } as CSSProperties,

  blob: {
    position: "absolute",
    borderRadius: "50%",
    top: "50%",
    left: "50%",
  } as CSSProperties,

  blobCore: (color: string): CSSProperties => ({
    width: 80,
    height: 80,
    backgroundColor: color,
    transform: "translate(-50%, -50%)",
    animation: "sov-core 2.4s ease-in-out infinite",
  }),

  orbit: (color: string, name: keyof typeof orbitDurations, small = false): CSSProperties => ({
    width: small ? 32 : 44,
    height: small ? 32 : 44,
    backgroundColor: color,
    animation: `sov-${name} ${orbitDurations[name]}s ease-in-out infinite`,
  }),

  statusWrap: {
    position: "absolute",
    bottom: -28,
    left: 0,
    right: 0,
    textAlign: "center",
  } as CSSProperties,

  statusText: (visible: boolean, color: string): CSSProperties => ({
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    fontSize: 12,
    fontWeight: 500,
    letterSpacing: "0.04em",
    color,
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(4px)",
    transition: "opacity 0.25s ease, transform 0.25s ease",
    display: "inline-block",
  }),
};

const orbitDurations = { b1: 2.1, b2: 2.7, b3: 1.9, b4: 3.1, b5: 2.3 };

/* ─── Keyframe injection ─────────────────────────────────────────────────── */

const KEYFRAMES = `
  @keyframes sov-core {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50%       { transform: translate(-50%, -50%) scale(1.12); }
  }
  @keyframes sov-glow {
    0%, 100% { transform: scale(1);   opacity: 0.7; }
    50%       { transform: scale(1.4); opacity: 1; }
  }
  @keyframes sov-b1 {
    0%   { transform: translate(calc(-50% + 90px),  calc(-50% + 0px))   scale(1); }
    25%  { transform: translate(calc(-50% + 50px),  calc(-50% - 78px))  scale(0.82); }
    50%  { transform: translate(calc(-50% - 90px),  calc(-50% + 0px))   scale(0.68); }
    75%  { transform: translate(calc(-50% - 50px),  calc(-50% + 78px))  scale(0.82); }
    100% { transform: translate(calc(-50% + 90px),  calc(-50% + 0px))   scale(1); }
  }
  @keyframes sov-b2 {
    0%   { transform: translate(calc(-50% - 68px),  calc(-50% - 72px))  scale(0.72); }
    33%  { transform: translate(calc(-50% + 88px),  calc(-50% - 38px))  scale(1); }
    66%  { transform: translate(calc(-50% + 18px),  calc(-50% + 92px))  scale(0.84); }
    100% { transform: translate(calc(-50% - 68px),  calc(-50% - 72px))  scale(0.72); }
  }
  @keyframes sov-b3 {
    0%   { transform: translate(calc(-50% + 28px),  calc(-50% - 95px))  scale(0.88); }
    50%  { transform: translate(calc(-50% - 28px),  calc(-50% + 95px))  scale(0.88); }
    100% { transform: translate(calc(-50% + 28px),  calc(-50% - 95px))  scale(0.88); }
  }
  @keyframes sov-b4 {
    0%   { transform: translate(calc(-50% - 95px),  calc(-50% + 28px))  scale(0.78); }
    40%  { transform: translate(calc(-50% + 58px),  calc(-50% + 82px))  scale(1.04); }
    70%  { transform: translate(calc(-50% + 92px),  calc(-50% - 28px))  scale(0.68); }
    100% { transform: translate(calc(-50% - 95px),  calc(-50% + 28px))  scale(0.78); }
  }
  @keyframes sov-b5 {
    0%   { transform: translate(calc(-50% - 38px),  calc(-50% - 90px))  scale(1); }
    35%  { transform: translate(calc(-50% + 92px),  calc(-50% + 42px))  scale(0.68); }
    65%  { transform: translate(calc(-50% - 82px),  calc(-50% + 58px))  scale(0.88); }
    100% { transform: translate(calc(-50% - 38px),  calc(-50% - 90px))  scale(1); }
  }
`;

// Inject keyframes once
if (typeof document !== "undefined") {
  const existing = document.getElementById("sov-keyframes");
  if (!existing) {
    const style = document.createElement("style");
    style.id = "sov-keyframes";
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
  }
}