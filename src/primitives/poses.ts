/**
 * Posen-Bibliothek. Winkel in Grad.
 * - Gliedmaßen: s/h = Winkel ab "gerade nach unten", positiv = nach vorne (Blickrichtung).
 * - e/k = Beugung relativ zum Oberarm/Oberschenkel (positiv = nach vorne).
 * - torso = Neigung des Oberkörpers nach vorne, head = Kopfneigung.
 */
export type Limb = {a: number; b: number};
export type Pose = {torso: number; head: number; armB: Limb; armF: Limb; legB: Limb; legF: Limb};

const P = (torso: number, head: number, armB: [number, number], armF: [number, number], legB: [number, number], legF: [number, number]): Pose => ({
  torso,
  head,
  armB: {a: armB[0], b: armB[1]},
  armF: {a: armF[0], b: armF[1]},
  legB: {a: legB[0], b: legB[1]},
  legF: {a: legF[0], b: legF[1]},
});

export const POSES = {
  stand: P(0, 0, [-9, 6], [9, 6], [-5, 0], [5, 0]),
  walk: P(4, 0, [-9, 12], [9, 12], [-5, 0], [5, 0]),
  cheer: P(-3, -12, [150, 15], [160, -12], [-10, 0], [10, 0]),
  point: P(0, -4, [-8, 6], [86, 4], [-5, 0], [6, 0]),
  think: P(3, 10, [12, 75], [22, 135], [-4, 0], [5, 0]),
  slump: P(22, 28, [12, 4], [18, 4], [-2, -8], [10, -14]),
  sit: P(-6, 0, [-38, 0], [22, 22], [86, 0], [80, -8]),
  sad: P(28, 38, [-25, 70], [-12, 62], [125, -105], [131, -112]),
  step: P(6, -2, [-26, 12], [26, 18], [-14, -8], [48, -62]),
  shrug: P(0, 10, [-48, -75], [48, 75], [-5, 0], [5, 0]),
  wave: P(0, -6, [-9, 6], [150, 25], [-5, 0], [5, 0]),
} satisfies Record<string, Pose>;

const mixLimb = (x: Limb, y: Limb, t: number): Limb => ({a: x.a + (y.a - x.a) * t, b: x.b + (y.b - x.b) * t});

export const mixPose = (x: Pose, y: Pose, t: number): Pose => ({
  torso: x.torso + (y.torso - x.torso) * t,
  head: x.head + (y.head - x.head) * t,
  armB: mixLimb(x.armB, y.armB, t),
  armF: mixLimb(x.armF, y.armF, t),
  legB: mixLimb(x.legB, y.legB, t),
  legF: mixLimb(x.legF, y.legF, t),
});

/** Walk-Cycle-Offsets für Phase phi (rad). */
export const walkOffset = (phi: number): Pose => {
  const s = Math.sin(phi);
  const c = Math.cos(phi);
  return {
    torso: 0,
    head: 0,
    armB: {a: 22 * s, b: 0},
    armF: {a: -22 * s, b: 0},
    legB: {a: -26 * s, b: -38 * Math.max(0, -c)},
    legF: {a: 26 * s, b: -38 * Math.max(0, c)},
  };
};

export const addPose = (x: Pose, y: Pose, w: number): Pose => ({
  torso: x.torso + y.torso * w,
  head: x.head + y.head * w,
  armB: {a: x.armB.a + y.armB.a * w, b: x.armB.b + y.armB.b * w},
  armF: {a: x.armF.a + y.armF.a * w, b: x.armF.b + y.armF.b * w},
  legB: {a: x.legB.a + y.legB.a * w, b: x.legB.b + y.legB.b * w},
  legF: {a: x.legF.a + y.legF.a * w, b: x.legF.b + y.legF.b * w},
});
