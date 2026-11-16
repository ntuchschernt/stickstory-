import {continueRender, delayRender, staticFile} from 'remotion';

/** Lädt Inter aus public/fonts, bevor gerendert wird (keine Abhängigkeit von System-Fonts). */
const FILES: [string, number][] = [
  ['Inter-Regular.otf', 400],
  ['Inter-SemiBold.otf', 600],
  ['Inter-Bold.otf', 700],
];

let loaded = false;
export const ensureFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Inter laden');
  Promise.all(
    FILES.map(([file, weight]) => {
      const face = new FontFace('Inter', `url(${staticFile(`fonts/${file}`)}) format('opentype')`, {weight: String(weight)});
      return face.load().then((f) => document.fonts.add(f));
    }),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error('Font-Fehler', e);
      continueRender(handle);
    });
};
