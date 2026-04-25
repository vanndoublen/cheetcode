/**
 * Organic Loaders — 8 indeterminate loading indicators
 * All black & white, no text, organic/blobby feel.
 *
 * Usage:
 *   import { MorphingBlob, GooMetaballs, ... } from './OrganicLoaders'
 *   <MorphingBlob size={80} color="#111" />
 *
 * Each component accepts:
 *   size  — number, controls bounding box (default 80)
 *   color — CSS color string (default "#111")
 */

import React, { useId } from 'react';

// ─── Shared: inject keyframes once ────────────────────────────────────────────
const CSS = `
@keyframes ol-blobmorph {
  0%   { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  25%  { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  50%  { border-radius: 50% 60% 30% 60% / 30% 40% 70% 50%; }
  75%  { border-radius: 70% 30% 50% 40% / 40% 70% 30% 60%; }
  100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
}
@keyframes ol-arc-spin    { to { transform: rotate(360deg); } }
@keyframes ol-goo-orbit {
  0%   { transform: rotate(0deg)   translate(var(--ol-r)) rotate(0deg); }
  100% { transform: rotate(360deg) translate(var(--ol-r)) rotate(-360deg); }
}
@keyframes ol-orb1 { 0% { transform: rotate(0deg)   translate(var(--ol-r1)); } 100% { transform: rotate(360deg)  translate(var(--ol-r1)); } }
@keyframes ol-orb2 { 0% { transform: rotate(120deg) translate(var(--ol-r2)); } 100% { transform: rotate(480deg)  translate(var(--ol-r2)); } }
@keyframes ol-orb3 { 0% { transform: rotate(240deg) translate(var(--ol-r3)); } 100% { transform: rotate(600deg)  translate(var(--ol-r3)); } }
@keyframes ol-heartbeat {
  0%   { transform: scale(1); }
  14%  { transform: scale(1.2); }
  28%  { transform: scale(1.05); }
  42%  { transform: scale(1.22); }
  70%  { transform: scale(1); }
  100% { transform: scale(1); }
}
@keyframes ol-sw2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(calc(var(--ol-s)*0.44),calc(var(--ol-s)*-0.29)); } }
@keyframes ol-sw3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(calc(var(--ol-s)*-0.38),calc(var(--ol-s)*-0.32)); } }
@keyframes ol-sw4 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(calc(var(--ol-s)*0.32),calc(var(--ol-s)*0.41)); } }
@keyframes ol-sw5 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(calc(var(--ol-s)*-0.41),calc(var(--ol-s)*0.26)); } }
@keyframes ol-sw6 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(calc(var(--ol-s)*0.15),calc(var(--ol-s)*-0.53)); } }
@keyframes ol-morph-spin { to { transform: rotate(360deg); } }
@keyframes ol-bub2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(calc(var(--ol-s)*0.6),calc(var(--ol-s)*-0.43)); } }
@keyframes ol-bub3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(calc(var(--ol-s)*-0.49),calc(var(--ol-s)*-0.4)); } }
@keyframes ol-bub4 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(calc(var(--ol-s)*0.11),calc(var(--ol-s)*0.63)); } }
`;

let injected = false;
function injectCSS() {
  if (injected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = CSS;
  document.head.appendChild(el);
  injected = true;
}

// ─── Goo filter component ─────────────────────────────────────────────────────
function GooFilter({ id, blur = 7, alpha = 20, cutoff = -8 }) {
  return (
    <svg width="0" height="0" style={{ position: 'absolute', overflow: 'hidden' }}>
      <defs>
        <filter id={id}>
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix in="blur" mode="matrix"
            values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${alpha} ${cutoff}`} />
        </filter>
      </defs>
    </svg>
  );
}

// ─── 1. Morphing Blob ─────────────────────────────────────────────────────────
export function MorphingBlob({ size = 80, color = '#111' }) {
  injectCSS();
  const s = size * 0.75;
  return (
    <div style={{
      width: s, height: s,
      background: color,
      animation: 'ol-blobmorph 3s ease-in-out infinite',
    }} />
  );
}

// ─── 2. Goo Metaballs ─────────────────────────────────────────────────────────
export function GooMetaballs({ size = 80, color = '#111' }) {
  injectCSS();
  const id = useId().replace(/:/g, '');
  const r = size * 0.54; // orbit radius
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <GooFilter id={id} blur={size * 0.1} alpha={22} cutoff={-9} />
      <div style={{ filter: `url(#${id})`, width: size, height: size, position: 'relative' }}>
        {/* center */}
        <div style={{
          position: 'absolute', borderRadius: '50%', background: color,
          width: size * 0.5, height: size * 0.5,
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
        }} />
        {/* orbiter A */}
        <div style={{
          position: 'absolute', borderRadius: '50%', background: color,
          width: size * 0.36, height: size * 0.36,
          top: '50%', left: '50%',
          marginTop: -(size * 0.18), marginLeft: -(size * 0.18),
          '--ol-r': `${r * 0.54}px`,
          animation: 'ol-goo-orbit 2.4s linear infinite',
        }} />
        {/* orbiter B */}
        <div style={{
          position: 'absolute', borderRadius: '50%', background: color,
          width: size * 0.29, height: size * 0.29,
          top: '50%', left: '50%',
          marginTop: -(size * 0.145), marginLeft: -(size * 0.145),
          '--ol-r': `${r * 0.54}px`,
          animation: 'ol-goo-orbit 2.4s linear infinite reverse',
          animationDelay: '-1.2s',
        }} />
      </div>
    </div>
  );
}

// ─── 4. Breathing Amoeba ──────────────────────────────────────────────────────
export function BreathingAmoeba({ size = 80, color = '#111' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 110 110" overflow="visible">
      <path fill={color}>
        <animate attributeName="d" dur="3.2s" repeatCount="indefinite"
          values="
            M55,18 C74,14 96,30 97,50 C98,68 84,92 62,96 C42,99 18,86 14,64 C10,42 22,20 40,16 C45,15 50,18 55,18Z;
            M55,16 C76,18 100,32 98,54 C96,74 78,96 56,98 C36,100 14,82 12,60 C10,38 26,16 46,14 C50,13 53,15 55,16Z;
            M55,20 C72,12 98,28 96,52 C94,70 80,94 58,96 C38,98 16,88 14,66 C12,44 24,22 42,18 C47,16 52,21 55,20Z;
            M55,18 C74,14 96,30 97,50 C98,68 84,92 62,96 C42,99 18,86 14,64 C10,42 22,20 40,16 C45,15 50,18 55,18Z"
        />
      </path>
    </svg>
  );
}

// ─── 10. Bubble Cluster ───────────────────────────────────────────────────────
export function BubbleCluster({ size = 80, color = '#111' }) {
  injectCSS();
  const id = useId().replace(/:/g, '');
  const c = size / 2;
  const s = size;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <GooFilter id={id} blur={size * 0.07} alpha={18} cutoff={-7} />
      <div style={{
        filter: `url(#${id})`, width: size, height: size,
        position: 'relative', '--ol-s': `${s}px`,
      }}>
        <div style={{ position: 'absolute', borderRadius: '50%', background: color,
          width: size * 0.38, height: size * 0.38,
          top: c - size * 0.19, left: c - size * 0.19 }} />
        <div style={{ position: 'absolute', borderRadius: '50%', background: color,
          width: size * 0.24, height: size * 0.24,
          top: c - size * 0.12, left: c - size * 0.12,
          animation: 'ol-bub2 2s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', background: color,
          width: size * 0.2, height: size * 0.2,
          top: c - size * 0.1, left: c - size * 0.1,
          animation: 'ol-bub3 2.6s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', background: color,
          width: size * 0.18, height: size * 0.18,
          top: c - size * 0.09, left: c - size * 0.09,
          animation: 'ol-bub4 1.8s ease-in-out infinite' }} />
      </div>
    </div>
  );
}

// ─── 13. Orbital Blobs ────────────────────────────────────────────────────────
export function OrbitalBlobs({ size = 80, color = '#111' }) {
  injectCSS();
  const id = useId().replace(/:/g, '');
  const c = size / 2;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <GooFilter id={id} blur={size * 0.09} alpha={18} cutoff={-7} />
      <div style={{ filter: `url(#${id})`, width: size, height: size, position: 'relative' }}>
        <div style={{ position: 'absolute', borderRadius: '50%', background: color,
          width: size * 0.28, height: size * 0.28,
          top: c - size * 0.14, left: c - size * 0.14 }} />
        <div style={{ position: 'absolute', borderRadius: '50%', background: color,
          width: size * 0.2, height: size * 0.2,
          top: c - size * 0.1, left: c - size * 0.1,
          '--ol-r1': `${size * 0.38}px`,
          animation: 'ol-orb1 1.6s linear infinite' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', background: color,
          width: size * 0.16, height: size * 0.16,
          top: c - size * 0.08, left: c - size * 0.08,
          '--ol-r2': `${size * 0.28}px`,
          animation: 'ol-orb2 2.4s linear infinite' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', background: color,
          width: size * 0.13, height: size * 0.13,
          top: c - size * 0.065, left: c - size * 0.065,
          '--ol-r3': `${size * 0.32}px`,
          animation: 'ol-orb3 1.1s linear infinite' }} />
      </div>
    </div>
  );
}

// ─── 15. Heartbeat Blob ───────────────────────────────────────────────────────
export function HeartbeatBlob({ size = 80, color = '#111' }) {
  injectCSS();
  const s = size * 0.72;
  return (
    <div style={{
      width: s, height: s,
      background: color,
      borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
      animation: 'ol-heartbeat 1.4s ease-in-out infinite',
    }} />
  );
}

// ─── 19. Dot Swarm ────────────────────────────────────────────────────────────
export function DotSwarm({ size = 80, color = '#111' }) {
  injectCSS();
  const id = useId().replace(/:/g, '');
  const c = size / 2;
  const s = size;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <GooFilter id={id} blur={size * 0.075} alpha={16} cutoff={-6} />
      <div style={{
        filter: `url(#${id})`, width: size, height: size,
        position: 'relative', '--ol-s': `${s}px`,
      }}>
        {[
          { w: 0.26, anim: null },
          { w: 0.18, anim: 'ol-sw2 1.6s ease-in-out infinite' },
          { w: 0.16, anim: 'ol-sw3 2.0s ease-in-out infinite' },
          { w: 0.14, anim: 'ol-sw4 2.4s ease-in-out infinite' },
          { w: 0.12, anim: 'ol-sw5 1.9s ease-in-out infinite' },
          { w: 0.10, anim: 'ol-sw6 2.2s ease-in-out infinite' },
        ].map(({ w, anim }, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%', background: color,
            width: size * w, height: size * w,
            top: c - size * w / 2, left: c - size * w / 2,
            ...(anim ? { animation: anim } : {}),
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── 20. Morphing Outline ─────────────────────────────────────────────────────
export function MorphingOutline({ size = 80, color = '#111' }) {
  const strokeW = Math.max(2, size * 0.05);
  return (
    <svg width={size} height={size} viewBox="0 0 130 130" overflow="visible">
      <path
        fill="none" stroke={color} strokeWidth={strokeW * (130 / size)}
        strokeLinecap="round" strokeLinejoin="round"
        style={{ animation: 'ol-morph-spin 4s linear infinite', transformOrigin: '50% 50%' }}
      >
        <animate attributeName="d" dur="4s" repeatCount="indefinite"
          values="
            M65,12 C86,12 108,30 112,52 C116,74 100,102 78,110 C58,118 30,106 18,86 C6,66 14,36 32,22 C42,15 54,12 65,12Z;
            M65,10 C90,16 114,38 110,62 C106,86 84,108 60,112 C36,116 12,96 10,70 C8,46 26,18 50,12 C58,9 62,10 65,10Z;
            M65,14 C88,8 116,32 114,58 C112,82 90,108 66,112 C42,116 16,96 12,72 C8,48 24,20 46,14 C54,11 60,16 65,14Z;
            M65,12 C86,12 108,30 112,52 C116,74 100,102 78,110 C58,118 30,106 18,86 C6,66 14,36 32,22 C42,15 54,12 65,12Z"
        />
      </path>
    </svg>
  );
}
