import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT, STROKE} from '../theme';
import {appear} from './anim';

const DAYS = 365;
const fnGrowth = (d: number) => Math.pow(1.01, d);
const fnDecline = (d: number) => Math.pow(0.99, d);

/**
 * Kurvendiagramm 1 % besser / schlechter über 365 Tage.
 * Die Kurve zeichnet sich von links nach rechts; der Endpunkt leuchtet in Akzentfarbe.
 */
export const Graph: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  curve: 'growth' | 'decline' | 'both' | 'flat';
  durationFrames: number;
  label?: string;
  inFrame?: number;
  outFrame?: number;
}> = ({x, y, w, h, curve, durationFrames, label, inFrame = 0, outFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = appear(frame, fps, inFrame, outFrame);
  const t = interpolate(frame, [inFrame + 8, inFrame + 8 + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const maxY = curve === 'decline' ? 1.15 : curve === 'flat' ? 2 : fnGrowth(DAYS);
  const toPt = (d: number, v: number) => ({px: x + (d / DAYS) * w, py: y + h - (v / maxY) * h});
  const pathFor = (fn: (d: number) => number) => {
    const end = Math.max(1, Math.round(DAYS * t));
    const pts: string[] = [];
    for (let d = 0; d <= end; d += 3) {
      const p = toPt(d, fn(d));
      pts.push(`${p.px.toFixed(1)},${p.py.toFixed(1)}`);
    }
    const last = toPt(end, fn(end));
    pts.push(`${last.px.toFixed(1)},${last.py.toFixed(1)}`);
    return {d: `M${pts.join(' L')}`, last};
  };
  const curves: {fn: (d: number) => number; color: string}[] = [];
  if (curve === 'growth' || curve === 'both') curves.push({fn: fnGrowth, color: COLORS.accent});
  if (curve === 'decline' || curve === 'both') curves.push({fn: fnDecline, color: COLORS.negative});
  if (curve === 'flat') curves.push({fn: () => 1, color: COLORS.figure});
  const base = toPt(0, 1);

  return (
    <g opacity={a.opacity}>
      {/* Achsen */}
      <polyline points={`${x},${y} ${x},${y + h} ${x + w},${y + h}`} fill="none" stroke={COLORS.line} strokeWidth={STROKE.axis} strokeLinecap="round" />
      {/* Startlinie bei 1.0 */}
      <line x1={x} x2={x + w} y1={base.py} y2={base.py} stroke={COLORS.line} strokeWidth={2} strokeDasharray="10 12" />
      {curves.map((c, i) => {
        const p = pathFor(c.fn);
        return (
          <g key={i}>
            <path d={p.d} fill="none" stroke={c.color} strokeWidth={STROKE.graph} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={p.last.px} cy={p.last.py} r={14} fill={c.color} />
            <circle cx={p.last.px} cy={p.last.py} r={26} fill={c.color} opacity={0.18} />
          </g>
        );
      })}
      <text x={x + w} y={y + h + 52} textAnchor="end" fill={COLORS.textDim} style={{fontFamily: FONT.family, fontWeight: 600, fontSize: FONT.size.small}}>
        {label ?? `${Math.round(DAYS * t)} days`}
      </text>
    </g>
  );
};
