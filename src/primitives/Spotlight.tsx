import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../theme';
import {appear} from './anim';

/** Weicher Lichtkegel auf dem Boden – hebt eine Figur hervor. */
export const Spotlight: React.FC<{x: number; y: number; r?: number; color?: string; inFrame?: number; outFrame?: number}> = ({
  x,
  y,
  r = 260,
  color = COLORS.figure,
  inFrame = 0,
  outFrame,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = appear(frame, fps, inFrame, outFrame, 14);
  const id = `spot-${Math.round(x)}-${Math.round(y)}`;
  return (
    <g opacity={a.opacity}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity={0.14} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={x} cy={y} rx={r * a.scale} ry={r * 0.28 * a.scale} fill={`url(#${id})`} />
      <ellipse cx={x} cy={y - r * 0.9} rx={r * 0.75 * a.scale} ry={r * 1.05 * a.scale} fill={`url(#${id})`} opacity={0.5} />
    </g>
  );
};
