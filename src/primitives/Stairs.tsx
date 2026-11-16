import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, STROKE} from '../theme';
import {progress} from './anim';

/** Treppe, die sich Stufe für Stufe aufbaut. (x,y) = linke untere Ecke. */
export const Stairs: React.FC<{
  x: number;
  y: number;
  steps: number;
  stepW?: number;
  stepH?: number;
  staggerFrames?: number;
  direction?: 1 | -1;
  color?: string;
  inFrame?: number;
  outFrame?: number;
}> = ({x, y, steps, stepW = 90, stepH = 40, staggerFrames = 6, direction = 1, color = COLORS.figure, inFrame = 0, outFrame = Infinity}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const out = outFrame === Infinity ? 1 : 1 - progress(frame, outFrame - 8, outFrame);
  return (
    <g stroke={color} strokeWidth={STROKE.line} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={out}>
      {Array.from({length: steps}).map((_, i) => {
        const p = progress(frame, inFrame + i * staggerFrames, inFrame + i * staggerFrames + Math.round(fps * 0.3));
        const sx = x + i * stepW;
        const baseY = direction === 1 ? y - i * stepH : y - (steps - 1 - i) * stepH;
        const topY = direction === 1 ? baseY - stepH : baseY;
        // Setzstufe + Trittfläche, wachsen mit p
        const riserTop = direction === 1 ? baseY - stepH * p : baseY;
        return (
          <g key={i} opacity={Math.min(1, p * 2)}>
            {direction === 1 ? (
              <polyline points={`${sx},${baseY} ${sx},${riserTop} ${sx + stepW * p},${riserTop}`} />
            ) : (
              <polyline points={`${sx},${topY} ${sx + stepW * p},${topY} ${sx + stepW * p},${topY + stepH * p}`} />
            )}
          </g>
        );
      })}
    </g>
  );
};
