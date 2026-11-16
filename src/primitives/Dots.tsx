import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS} from '../theme';
import {progress} from './anim';

/** Raster aus Punkten (z. B. 365 Tage), erscheinen nacheinander. (x,y) = Mitte des Rasters. */
export const Dots: React.FC<{
  x: number;
  y: number;
  count: number;
  cols?: number;
  gap?: number;
  r?: number;
  highlight?: number;
  staggerFrames?: number;
  color?: string;
  inFrame?: number;
  outFrame?: number;
}> = ({x, y, count, cols = 10, gap = 40, r = 9, highlight, staggerFrames = 1, color = COLORS.figureDim, inFrame = 0, outFrame = Infinity}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = Math.ceil(count / cols);
  const ox = x - ((cols - 1) * gap) / 2;
  const oy = y - ((rows - 1) * gap) / 2;
  const out = outFrame === Infinity ? 1 : 1 - progress(frame, outFrame - 8, outFrame);
  return (
    <g opacity={out}>
      {Array.from({length: count}).map((_, i) => {
        const start = inFrame + i * staggerFrames;
        const p = progress(frame, start, start + Math.round(fps * 0.25));
        if (p <= 0) return null;
        const hl = highlight === i;
        return <circle key={i} cx={ox + (i % cols) * gap} cy={oy + Math.floor(i / cols) * gap} r={r * p * (hl ? 1.5 : 1)} fill={hl ? COLORS.accent : color} />;
      })}
    </g>
  );
};
