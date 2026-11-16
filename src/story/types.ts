/** Story-JSON-Format (siehe briefing.md, Abschnitt 6). Alle Zeiten in Sekunden. */

export type PoseName =
  | 'stand'
  | 'walk'
  | 'cheer'
  | 'point'
  | 'think'
  | 'slump'
  | 'sit'
  | 'sad'
  | 'step'
  | 'shrug'
  | 'wave';

export type Vec = {x: number; y: number};

export type CameraKey = {x?: number; y?: number; zoom?: number};
export type Camera = {from?: CameraKey; to?: CameraKey; ease?: 'inOut' | 'out' | 'linear'};

/** Zeitangabe innerhalb einer Szene: Sekunden ab Sprechbeginn der Szene,
 *  oder "pauseN" = Sekunde nach der N-ten kurzen Sprechpause (vom Align-Skript ermittelt). */
export type At = number | string;

export type TextState = {
  at?: At;
  /** *Wort* = Akzentfarbe. "\n" = Zeilenumbruch. */
  content: string;
  style?: 'headline' | 'caption';
  /** Vertikale Position in der Text-Zone. */
  align?: 'top' | 'center';
};

type Base = {
  /** Einblendzeit (relativ zum Sprechbeginn der Szene). Default 0. */
  at?: At;
  /** Ausblendzeit. Default: Szenenende. */
  until?: At;
  color?: string;
  opacity?: number;
};

export type FigureEl = Base & {
  type: 'figure';
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  pose?: PoseName;
  /** Posenwechsel im Zeitverlauf. */
  poses?: {at: At; pose: PoseName}[];
  /** Laufweg: Punkte mit Zeit. Zwischen Punkten läuft die Figur (Walk-Cycle). */
  path?: {at: At; x: number; y: number}[];
};

export type StairsEl = Base & {
  type: 'stairs';
  x: number;
  y: number;
  steps: number;
  stepW?: number;
  stepH?: number;
  /** Sekunden zwischen zwei aufbauenden Stufen. */
  stagger?: number;
  direction?: 1 | -1;
};

export type CounterEl = Base & {
  type: 'counter';
  x: number;
  y: number;
  from: number;
  to: number;
  /** Dauer des Hochzählens. */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  size?: number;
  curve?: 'linear' | 'exp' | 'out';
};

export type GraphEl = Base & {
  type: 'graph';
  x: number;
  y: number;
  w: number;
  h: number;
  /** growth = 1.01^t, decline = 0.99^t, both = beide Kurven. */
  curve: 'growth' | 'decline' | 'both' | 'flat';
  duration?: number;
  label?: string;
};

export type LabelEl = Base & {
  type: 'label';
  x: number;
  y: number;
  text: string;
  size?: number;
  weight?: 'regular' | 'semibold' | 'bold';
};

export type GroundEl = Base & {type: 'ground'; y?: number; x1?: number; x2?: number};

export type SpotlightEl = Base & {type: 'spotlight'; x: number; y: number; r?: number};

export type DotsEl = Base & {
  type: 'dots';
  x: number;
  y: number;
  count: number;
  cols?: number;
  gap?: number;
  r?: number;
  /** Index des hervorgehobenen Punkts (Akzentfarbe). */
  highlight?: number;
  stagger?: number;
};

export type Element = FigureEl | StairsEl | CounterEl | GraphEl | LabelEl | GroundEl | SpotlightEl | DotsEl;

export type Sfx = {name: string; at?: At; volume?: number};

export type Scene = {
  id: string;
  /** Vom Align-Skript gesetzt: Sprechbereich dieser Szene in vo.mp3 (Sekunden). */
  vo?: {start: number; end: number; pauses?: number[]};
  /** Originalsatz des Voiceovers (nur zur Orientierung). */
  script?: string;
  text?: TextState[];
  camera?: Camera;
  elements?: Element[];
  sfx?: Sfx[];
  /** Zusätzliche Pause nach dieser Szene (Sekunden). */
  extraPause?: number;
};

export type Story = {
  id: string;
  title: string;
  voiceover?: string;
  music?: {src: string; volume?: number; ducked?: number};
  timing?: {
    leadInSec?: number;
    outroHoldSec?: number;
    minDurationSec?: number;
    /** Maximal zusätzliche Pause pro Szenenwechsel, wenn auf minDuration verlängert wird. */
    maxExtraPauseSec?: number;
  };
  scenes: Scene[];
};
