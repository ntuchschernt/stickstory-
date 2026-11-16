import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FIGURE, MOTION, STROKE} from '../theme';
import {appear, clamp, lerp} from './anim';
import {addPose, mixPose, POSES, walkOffset, type Pose} from './poses';

export type PoseKey = keyof typeof POSES;

export type StickFigureProps = {
  /** Fußpunkt (Bodenkontakt), Leinwand-Koordinaten. */
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  color?: string;
  opacity?: number;
  /** Posen-Zeitleiste in Frames (relativ zur Sequence). */
  poses?: {frame: number; pose: PoseKey}[];
  /** Laufweg in Frames. Zwischen zwei Punkten läuft die Figur. */
  path?: {frame: number; x: number; y: number}[];
  inFrame?: number;
  outFrame?: number;
};

const rad = (d: number) => (d * Math.PI) / 180;

/** Pose → Gelenkpunkte (lokal, Hüfte = 0,0, y nach unten, Blickrichtung +x). */
const skeleton = (p: Pose) => {
  const dir = (deg: number) => ({x: Math.sin(rad(deg)), y: Math.cos(rad(deg))}); // 0° = nach unten
  const hip = {x: 0, y: 0};
  const up = {x: Math.sin(rad(p.torso)), y: -Math.cos(rad(p.torso))};
  const shoulder = {x: up.x * FIGURE.torso, y: up.y * FIGURE.torso};
  const neckEnd = {x: shoulder.x + up.x * FIGURE.neck, y: shoulder.y + up.y * FIGURE.neck};
  const hd = rad(p.torso + p.head);
  const head = {x: neckEnd.x + Math.sin(hd) * FIGURE.headR, y: neckEnd.y - Math.cos(hd) * FIGURE.headR};

  const limb = (root: {x: number; y: number}, a: number, b: number, l1: number, l2: number, rel: number) => {
    const d1 = dir(a + rel);
    const j = {x: root.x + d1.x * l1, y: root.y + d1.y * l1};
    const d2 = dir(a + rel + b);
    return [root, j, {x: j.x + d2.x * l2, y: j.y + d2.y * l2}];
  };
  // Arme hängen relativ zur Torsoneigung, Beine absolut.
  const armB = limb(shoulder, p.armB.a, p.armB.b, FIGURE.upperArm, FIGURE.foreArm, p.torso);
  const armF = limb(shoulder, p.armF.a, p.armF.b, FIGURE.upperArm, FIGURE.foreArm, p.torso);
  const legB = limb(hip, p.legB.a, p.legB.b, FIGURE.thigh, FIGURE.shin, 0);
  const legF = limb(hip, p.legF.a, p.legF.b, FIGURE.thigh, FIGURE.shin, 0);
  // Bodenkontakt: tiefster Punkt (Füße oder Gesäß) liegt auf y = 0.
  const lowest = Math.max(legB[2].y, legF[2].y, legB[1].y, legF[1].y, 0 + STROKE.figure / 2);
  return {hip, shoulder, neckEnd, head, armB, armF, legB, legF, lowest};
};

export const StickFigure: React.FC<StickFigureProps> = ({
  x,
  y,
  scale = 1,
  facing,
  color = COLORS.figure,
  opacity = 1,
  poses = [{frame: 0, pose: 'stand'}],
  path,
  inFrame = 0,
  outFrame = Infinity,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // --- Position & Gehen ---
  let px = x;
  let py = y;
  let walkW = 0;
  let autoFacing: 1 | -1 = 1;
  if (path && path.length > 0) {
    const pts = [...path].sort((a, b) => a.frame - b.frame);
    px = pts[0].x;
    py = pts[0].y;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      if (frame >= a.frame) {
        const t = clamp((frame - a.frame) / Math.max(1, b.frame - a.frame));
        px = lerp(a.x, b.x, t);
        py = lerp(a.y, b.y, t);
        if (b.x !== a.x) autoFacing = b.x > a.x ? 1 : -1;
        const moving = b.x !== a.x || b.y !== a.y;
        if (moving && frame <= b.frame) {
          const ramp = 5;
          walkW = clamp(Math.min(frame - a.frame, b.frame - frame) / ramp);
        }
      }
    }
  }
  const face = facing ?? autoFacing;

  // --- Pose mit weichem Übergang ---
  const list = [...poses].sort((a, b) => a.frame - b.frame);
  let pose: Pose = POSES[list[0].pose];
  for (let i = 1; i < list.length; i++) {
    if (frame >= list[i].frame) {
      const t = spring({frame: frame - list[i].frame, fps, config: MOTION.spring, durationInFrames: MOTION.poseBlend});
      pose = mixPose(pose, POSES[list[i].pose], t);
    }
  }
  // Atmen (ruhiges Idle) + Walk-Cycle
  const breathe = Math.sin((frame / fps) * Math.PI * 0.8) * 1.2;
  pose = {...pose, torso: pose.torso + breathe * (1 - walkW) * 0.6};
  if (walkW > 0) {
    const phi = (frame / fps) * Math.PI * MOTION.walkStepsPerSec;
    pose = mixPose(pose, POSES.walk, walkW * 0.5);
    pose = addPose(pose, walkOffset(phi), walkW);
  }
  const lastPose = list.filter((p) => frame >= p.frame).pop()?.pose ?? list[0].pose;
  if (lastPose === 'wave') {
    const w = Math.sin((frame / fps) * Math.PI * 3) * 18;
    pose = {...pose, armF: {a: pose.armF.a, b: pose.armF.b + w}};
  }

  const sk = skeleton(pose);
  const a = appear(frame, fps, inFrame, outFrame);
  const pts = (arr: {x: number; y: number}[]) => arr.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <g
      transform={`translate(${px} ${py}) scale(${scale * a.scale * face} ${scale * a.scale}) translate(0 ${-sk.lowest})`}
      opacity={opacity * a.opacity}
      stroke={color}
      strokeWidth={STROKE.figure}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    >
      <polyline points={pts(sk.armB)} />
      <polyline points={pts(sk.legB)} />
      <polyline points={pts([sk.hip, sk.shoulder, sk.neckEnd])} />
      <polyline points={pts(sk.legF)} />
      <polyline points={pts(sk.armF)} />
      <circle cx={sk.head.x} cy={sk.head.y} r={FIGURE.headR} fill={color} stroke="none" />
    </g>
  );
};
