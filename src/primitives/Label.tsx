import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT} from '../theme';
import {appear} from './anim';

/** Kurzes Wort/Beschriftung auf der Bühne (zentriert). */
export const Label: React.FC<{
  x: number;
  y: number;
  text: string;
  size?: number;
  weight?: keyof typeof FONT.weights;
  color?: string;
  inFrame?: number;
  outFrame?: number;
}> = ({x, y, text, size = FONT.size.label, weight = 'semibold', color = COLORS.text, inFrame = 0, outFrame}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = appear(frame, fps, inFrame, outFrame);
  return (
    <text
      x={x}
      y={y + (1 - a.progress) * 18}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={color}
      opacity={a.opacity}
      style={{fontFamily: FONT.family, fontWeight: FONT.weights[weight], fontSize: size, letterSpacing: FONT.letterSpacing}}
    >
      {text}
    </text>
  );
};
