import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, LAYOUT, STROKE} from '../theme';
import {appear, lerp} from './anim';

/** Bodenlinie, zeichnet sich von der Mitte nach außen auf. */
export const Ground: React.FC<{y?: number; x1?: number; x2?: number; color?: string; inFrame?: number; outFrame?: number}> = ({
  y = LAYOUT.groundY,
  x1 = 140,
  x2 = 940,
  color = COLORS.line,
  inFrame = 0,
  outFrame,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = appear(frame, fps, inFrame, outFrame);
  const mid = (x1 + x2) / 2;
  return (
    <line
      x1={lerp(mid, x1, a.progress)}
      x2={lerp(mid, x2, a.progress)}
      y1={y}
      y2={y}
      stroke={color}
      strokeWidth={STROKE.line}
      strokeLinecap="round"
      opacity={a.opacity}
    />
  );
};
