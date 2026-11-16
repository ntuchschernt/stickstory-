/**
 * theme.ts – zentrale Design-Tokens für alle StickStory-Videos.
 * Regeln siehe briefing.md, Abschnitt 3. Nichts im Code darf Farben,
 * Schriftgrößen oder Zeiten "frei" erfinden – immer von hier beziehen.
 */

export const CANVAS = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

/** TikTok-UI-Bereiche, die frei bleiben müssen (px). */
export const SAFE = {
  top: 250, // Suchleiste / "Folge ich | Für dich"
  bottom: 480, // Beschreibung, Sound, Kommentarleiste
  left: 80,
  right: 160, // Like/Kommentar/Teilen-Spalte
} as const;

/** Nutzbare Rechtecke innerhalb der Safe Zone. */
export const LAYOUT = {
  /** Text-Zone (oberer Bereich). */
  text: {top: SAFE.top + 60, height: 430, left: SAFE.left + 10, right: CANVAS.width - SAFE.left - 10},
  /** Bühne für Figuren & Grafiken (Mitte). Koordinaten in Story-JSON beziehen sich auf die volle Leinwand. */
  stage: {top: 780, bottom: CANVAS.height - SAFE.bottom - 40, left: SAFE.left + 40, right: CANVAS.width - SAFE.right},
  /** Standard-Bodenlinie. */
  groundY: 1330,
} as const;

export const COLORS = {
  bg: '#101114', // Deep Charcoal
  bgSoft: '#202124', // Dark Graphite (Vignette, Flächen)
  figure: '#F0EDE5', // Warm Ivory
  figureDim: '#5E5D5A', // gedimmte Figur / Vergangenheit
  accent: '#D98242', // Cinematic Orange – sparsam!
  text: '#F5F5F5', // Soft White
  textDim: '#8A8A8E',
  line: '#3A3B40', // Achsen, Boden, Hilfslinien
  negative: '#7C7F87', // "schlechter"-Kurven: kalt, nie rot
} as const;

export type ColorName = keyof typeof COLORS;
export const color = (c?: string): string =>
  c && c in COLORS ? COLORS[c as ColorName] : c ?? COLORS.figure;

export const FONT = {
  family: 'Inter, "Helvetica Neue", Arial, sans-serif',
  weights: {regular: 400, semibold: 600, bold: 700},
  /** Schriftgrößen (px bei 1080 Breite). */
  size: {
    headline: 92,
    caption: 64,
    label: 44,
    counter: 150,
    small: 36,
  },
  lineHeight: 1.18,
  letterSpacing: -0.5,
} as const;

export const STROKE = {
  figure: 13, // Strichstärke Strichmännchen
  line: 6, // Boden, Treppe
  graph: 10, // Kurven
  axis: 4,
} as const;

/** Figurenproportionen (Skalierung 1). */
export const FIGURE = {
  headR: 34,
  neck: 12,
  torso: 120,
  upperArm: 62,
  foreArm: 58,
  thigh: 74,
  shin: 72,
} as const;

/** Animations-Tokens. Alle Bewegungen sind weich – keine harten Sprünge. */
export const MOTION = {
  /** Szenen-Übergang: Ein-/Ausblenden in Frames. */
  sceneFade: 9,
  /** Bilder vor dem Sprechbeginn, in denen die Szene schon sichtbar ist. */
  preRollSec: 0.35,
  /** Text: Wort-für-Wort-Versatz in Frames. */
  wordStagger: 2.5,
  /** Text: Dauer Wort-Einblendung. */
  wordIn: 10,
  /** Text: Ausblenden vor Szenenende / State-Wechsel (Frames). */
  textOut: 8,
  /** Standard-Spring für Posen & Pop-Ins. */
  spring: {damping: 18, mass: 0.9, stiffness: 110},
  /** Weicher Spring für Kamera-ähnliche Bewegungen. */
  softSpring: {damping: 26, mass: 1.2, stiffness: 70},
  /** Schritte pro Sekunde beim Gehen. */
  walkStepsPerSec: 2.2,
  /** Pose-Übergangsdauer (Frames). */
  poseBlend: 12,
} as const;

export const AUDIO = {
  musicVolume: 0.22,
  musicDucked: 0.07,
  duckRampSec: 0.35,
  musicFadeInSec: 1.5,
  musicFadeOutSec: 2.5,
  sfxVolume: 0.35,
  voVolume: 1,
} as const;
