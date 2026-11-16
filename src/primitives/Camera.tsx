import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CANVAS} from '../theme';

export type CameraKey = {x?: number; y?: number; zoom?: number};

/**
 * Langsame Kamerafahrt über die Szene (Ken-Burns-Prinzip).
 * x/y = Verschiebung des Blickpunkts (px), zoom = Vergrößerung um die Bildmitte.
 * Regel: max. ±15 % Zoom pro Szene, immer eased, nie ruckartig.
 */
export const Camera: React.FC<{
  from?: CameraKey;
  to?: CameraKey;
  ease?: 'inOut' | 'out' | 'linear';
  children: React.ReactNode;
}> = ({from = {}, to, ease = 'inOut', children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const end = to ?? from;
  const easing = ease === 'linear' ? Easing.linear : ease === 'out' ? Easing.out(Easing.cubic) : Easing.inOut(Easing.sin);
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
  const v = (k: keyof CameraKey, d: number) => (from[k] ?? d) + ((end[k] ?? from[k] ?? d) - (from[k] ?? d)) * t;
  const z = Math.min(1.15, Math.max(0.85, v('zoom', 1)));
  const cx = CANVAS.width / 2;
  const cy = CANVAS.height / 2;
  return <g transform={`translate(${cx} ${cy}) scale(${z}) translate(${-cx - v('x', 0)} ${-cy - v('y', 0)})`}>{children}</g>;
};
