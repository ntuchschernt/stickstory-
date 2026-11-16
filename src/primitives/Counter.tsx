import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT, MOTION} from '../theme';
import {appear} from './anim';

/** Zahl, die von `from` nach `to` zählt. Bei 'exp' geometrisch (passt zu Zinseszins-Effekten). */
export const Counter: React.FC<{
  x: number;
  y: number;
  from: number;
  to: number;
  durationFrames: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  size?: number;
  color?: string;
  curve?: 'linear' | 'exp' | 'out';
  inFrame?: number;
  outFrame?: number;
}> = ({x, y, from, to, durationFrames, decimals = 0, prefix = '', suffix = '', size = FONT.size.counter, color = COLORS.text, curve = 'out', inFrame = 0, outFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = appear(frame, fps, inFrame, outFrame);
  // 'exp' nutzt dieselbe Kurve wie Graph → Zahl und Linie laufen synchron.
  const ease = curve === 'linear' ? Easing.linear : curve === 'exp' ? Easing.inOut(Easing.sin) : Easing.out(Easing.cubic);
  const t = interpolate(frame, [inFrame + 8, inFrame + 8 + durationFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const value = curve === 'exp' && from > 0 && to > 0 ? from * Math.pow(to / from, t) : from + (to - from) * t;
  // kleiner Pop, wenn der Endwert erreicht ist
  const done = spring({frame: frame - (inFrame + 8 + durationFrames), fps, config: MOTION.spring});
  const pop = 1 + 0.08 * Math.sin(Math.min(1, done) * Math.PI);
  const txt = `${prefix}${value.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}${suffix}`;
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={color}
      opacity={a.opacity}
      transform={`translate(${x} ${y}) scale(${a.scale * pop}) translate(${-x} ${-y})`}
      style={{fontFamily: FONT.family, fontWeight: FONT.weights.bold, fontSize: size, fontVariantNumeric: 'tabular-nums', letterSpacing: -2}}
    >
      {txt}
    </text>
  );
};
