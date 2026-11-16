import React from 'react';
import {Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT, LAYOUT, MOTION} from '../theme';

type Token = {word: string; accent: boolean; br?: boolean};

/** "Nobody notices *one percent*." → Wörter mit Akzent-Markierung; "\n" = Umbruch. */
export const parseText = (s: string): Token[] => {
  const out: Token[] = [];
  let accent = false;
  for (const line of s.split('\n').map((l, i) => ({l, i}))) {
    if (line.i > 0) out.push({word: '', accent: false, br: true});
    for (const raw of line.l.split(/\s+/).filter(Boolean)) {
      let w = raw;
      let a: boolean = accent;
      if (w.startsWith('*')) {
        a = true;
        w = w.slice(1);
      }
      let closes = false;
      if (w.endsWith('*') || /\*[.,!?:;]+$/.test(w)) {
        closes = true;
        w = w.replace(/\*(?=[.,!?:;]*$)/, '');
      }
      out.push({word: w, accent: a});
      accent = closes ? false : a;
    }
  }
  return out;
};

const lines = (tokens: Token[]) => tokens.filter((t) => t.br).length + 1;

const AVG_CHAR = 0.58; // Ø Zeichenbreite Inter Bold relativ zur Schriftgröße (eher großzügig)

/**
 * Schriftgröße so wählen, dass nichts abgeschnitten wird:
 * - Mit "\n" gesetzte Zeilen werden nie umbrochen → jede Zeile muss in die Breite passen.
 * - Ohne "\n" bricht der Text automatisch um, muss aber in die Höhe der Text-Zone passen.
 */
const fitSize = (tokens: Token[], size: number) => {
  const width = LAYOUT.text.right - LAYOUT.text.left;
  const lines: string[] = [''];
  for (const t of tokens) {
    if (t.br) lines.push('');
    else lines[lines.length - 1] += (lines[lines.length - 1] ? ' ' : '') + t.word;
  }
  let s = size;
  const manual = lines.length > 1;
  for (const l of lines) {
    const need = l.length * AVG_CHAR * s;
    if (manual && need > width) s = width / (l.length * AVG_CHAR);
  }
  const longestWord = Math.max(...tokens.map((t) => t.word.length));
  if (longestWord * AVG_CHAR * s > width) s = width / (longestWord * AVG_CHAR);
  const fits = (sz: number) => {
    const n = lines.reduce((acc, l) => acc + (manual ? 1 : Math.max(1, Math.ceil((l.length * AVG_CHAR * sz) / width))), 0);
    return n * sz * FONT.lineHeight <= LAYOUT.text.height;
  };
  while (!fits(s) && s > 40) s -= 2;
  return Math.floor(s);
};

/**
 * Ein Text-State: Wörter erscheinen nacheinander (leichtes Hochgleiten),
 * Akzentwörter leuchten in Orange auf, wenn sie (geschätzt) gesprochen werden.
 */
export const Caption: React.FC<{
  content: string;
  style?: 'headline' | 'caption';
  align?: 'top' | 'center';
  inFrame: number;
  outFrame: number;
  /** Sprechbereich dieses States (Frames) – für das Akzent-Timing. */
  speakFrom?: number;
  speakTo?: number;
}> = ({content, style = 'headline', align = 'center', inFrame, outFrame, speakFrom, speakTo}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < inFrame - 1 || frame > outFrame + 1) return null;
  const tokens = parseText(content);
  const base = style === 'headline' ? FONT.size.headline : FONT.size.caption;
  const size = fitSize(tokens, base);
  const out = interpolate(frame, [outFrame - MOTION.textOut, outFrame], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const totalChars = tokens.reduce((n, t) => n + t.word.length + 1, 0);
  let chars = 0;
  let wi = 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: LAYOUT.text.left,
        top: LAYOUT.text.top,
        width: LAYOUT.text.right - LAYOUT.text.left,
        height: LAYOUT.text.height,
        display: 'flex',
        alignItems: align === 'top' ? 'flex-start' : 'center',
        justifyContent: 'center',
        opacity: out,
        transform: `translateY(${(1 - out) * -16}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT.family,
          fontWeight: style === 'headline' ? FONT.weights.bold : FONT.weights.semibold,
          fontSize: size,
          lineHeight: FONT.lineHeight,
          letterSpacing: FONT.letterSpacing,
          color: COLORS.text,
          textAlign: 'center',
          textWrap: 'balance',
          whiteSpace: lines(tokens) > 1 ? 'nowrap' : 'normal',
        }}
      >
        {tokens.map((t, i) => {
          if (t.br) return <br key={i} />;
          const start = inFrame + wi * MOTION.wordStagger;
          wi++;
          const p = spring({frame: frame - start, fps, config: MOTION.spring});
          const fade = interpolate(frame, [start, start + MOTION.wordIn], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const charPos = chars / totalChars;
          chars += t.word.length + 1;
          let accentP = 0;
          if (t.accent) {
            const spoken = speakFrom !== undefined && speakTo !== undefined ? speakFrom + (speakTo - speakFrom) * charPos : start;
            accentP = spring({frame: frame - Math.max(start, spoken - 3), fps, config: MOTION.spring});
          }
          const pop = 1 + 0.05 * Math.sin(Math.min(1, accentP) * Math.PI);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: fade,
                transform: `translateY(${(1 - p) * 26}px) scale(${pop})`,
                color: t.accent ? interpolateColors(Math.min(1, accentP), [0, 1], [COLORS.text, COLORS.accent]) : COLORS.text,
                margin: '0 0.15em',
                whiteSpace: 'pre',
              }}
            >
              {t.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
