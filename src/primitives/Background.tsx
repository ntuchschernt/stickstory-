import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS} from '../theme';

/** Ruhiger Hintergrund: Charcoal mit sehr weicher Vignette. */
export const Background: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: COLORS.bg,
      backgroundImage: `radial-gradient(ellipse 85% 60% at 50% 52%, #17181C 0%, ${COLORS.bg} 70%)`,
    }}
  />
);
