import {Easing, interpolate, spring} from 'remotion';
import {MOTION} from '../theme';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Weiches Ein-/Ausblenden eines Elements: Opacity + kleiner Scale-Pop. */
export const appear = (
  frame: number,
  fps: number,
  inFrame: number,
  outFrame = Infinity,
  outDur = 8,
): {opacity: number; scale: number; progress: number} => {
  const p = spring({frame: frame - inFrame, fps, config: MOTION.spring});
  const out = outFrame === Infinity ? 1 : interpolate(frame, [outFrame - outDur, outFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const fadeIn = interpolate(frame, [inFrame, inFrame + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return {opacity: fadeIn * out, scale: lerp(0.92, 1, p), progress: p};
};

/** Fortschritt 0..1 zwischen zwei Frames mit Ease-in-out. */
export const progress = (frame: number, start: number, end: number, ease: (t: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [start, Math.max(start + 1, end)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
