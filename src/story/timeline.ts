import {MOTION} from '../theme';
import type {At, Scene, Story} from './types';

export type TimedScene = {
  scene: Scene;
  index: number;
  /** Sichtbarer Bereich der Szene auf der Video-Timeline (Sekunden). */
  visStart: number;
  visEnd: number;
  /** Zeitpunkt, an dem der VO-Abschnitt dieser Szene startet (Video-Timeline). */
  speechAt: number;
  /** Dauer des gesprochenen Abschnitts. */
  speechDur: number;
  /** Ausschnitt in vo.mp3. */
  voStart: number;
  voEnd: number;
};

export type Timeline = {
  scenes: TimedScene[];
  total: number;
  /** Sprech-Intervalle auf der Video-Timeline (für Music-Ducking). */
  speech: [number, number][];
  extraPerGap: number;
  outroHold: number;
};

const FALLBACK_SCENE_SEC = 4;

export const buildTimeline = (story: Story): Timeline => {
  const t = story.timing ?? {};
  const lead = t.leadInSec ?? 0.6;
  let outro = t.outroHoldSec ?? 2.5;
  const minDur = t.minDurationSec ?? 0;
  const maxExtra = t.maxExtraPauseSec ?? 0.6;
  const n = story.scenes.length;

  const vo = story.scenes.map((s, i) => s.vo ?? {start: i * FALLBACK_SCENE_SEC, end: i * FALLBACK_SCENE_SEC + FALLBACK_SCENE_SEC - 1});
  const natGap = (i: number) => (i < n - 1 ? Math.max(0, vo[i + 1].start - vo[i].end) : 0);

  const layout = (extra: number, outroHold: number) => {
    const speechAt: number[] = [];
    let cursor = lead;
    for (let i = 0; i < n; i++) {
      speechAt.push(cursor);
      cursor += vo[i].end - vo[i].start;
      if (i < n - 1) cursor += natGap(i) + extra + (story.scenes[i].extraPause ?? 0);
    }
    return {speechAt, total: cursor + outroHold};
  };

  let extra = 0;
  let res = layout(0, outro);
  if (res.total < minDur) {
    // Regel: zuerst Pausen zwischen Szenen (max. maxExtra pro Wechsel), Rest in den Outro-Hold.
    const deficit = minDur - res.total + 0.05;
    extra = n > 1 ? Math.min(maxExtra, deficit / (n - 1)) : 0;
    outro += Math.max(0, deficit - extra * (n - 1));
    res = layout(extra, outro);
  }

  const scenes: TimedScene[] = story.scenes.map((scene, i) => {
    const visStart = i === 0 ? 0 : res.speechAt[i] - MOTION.preRollSec;
    const visEnd = i === n - 1 ? res.total : res.speechAt[i + 1] - MOTION.preRollSec;
    return {
      scene,
      index: i,
      visStart,
      visEnd,
      speechAt: res.speechAt[i],
      speechDur: vo[i].end - vo[i].start,
      voStart: vo[i].start,
      voEnd: vo[i].end,
    };
  });

  return {
    scenes,
    total: res.total,
    speech: scenes.map((s) => [s.speechAt, s.speechAt + s.speechDur] as [number, number]),
    extraPerGap: extra,
    outroHold: outro,
  };
};

const AT_RE = /^(?:(pause)(\d+)|(end))?\s*([+-]\s*\d*\.?\d+)?$/;

/** Löst eine Zeitangabe auf → Sekunden relativ zum Sprechbeginn der Szene. */
export const resolveAt = (at: At | undefined, ts: TimedScene, fallback = 0): number => {
  if (at === undefined || at === null) return fallback;
  if (typeof at === 'number') return at;
  const m = AT_RE.exec(at.trim());
  if (!m) throw new Error(`Ungültige Zeitangabe "${at}" in Szene ${ts.scene.id}`);
  let base = 0;
  if (m[1]) {
    const idx = Number(m[2]) - 1;
    const pauses = ts.scene.vo?.pauses ?? [];
    // Fehlt die Pause (anderer VO), gleichmäßig schätzen statt abzustürzen.
    base = pauses[idx] ?? (ts.speechDur * (idx + 1)) / (pauses.length + 2);
  } else if (m[3]) {
    base = ts.speechDur;
  }
  const off = m[4] ? Number(m[4].replace(/\s/g, '')) : 0;
  return base + off;
};

/** Szenen-relative Sekunde (ab Sprechbeginn) → Frame innerhalb der Szenen-Sequence. */
export const atToFrame = (at: At | undefined, ts: TimedScene, fps: number, fallback = 0): number =>
  Math.round((ts.speechAt - ts.visStart + resolveAt(at, ts, fallback)) * fps);
