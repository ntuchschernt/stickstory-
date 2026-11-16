import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CANVAS, LAYOUT, SAFE} from '../theme';

/** Debug-Overlay: zeigt TikTok-UI-Bereiche (rot) und Text-Zone (grün). Nur für Kontrollbilder. */
export const SafeZones: React.FC = () => {
  const red = 'rgba(255,40,40,0.22)';
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: CANVAS.width, height: SAFE.top, background: red}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: CANVAS.width, height: SAFE.bottom, background: red}} />
      <div style={{position: 'absolute', right: 0, top: 900, width: SAFE.right, height: CANVAS.height - 900 - SAFE.bottom, background: red}} />
      <div
        style={{
          position: 'absolute',
          left: LAYOUT.text.left,
          top: LAYOUT.text.top,
          width: LAYOUT.text.right - LAYOUT.text.left,
          height: LAYOUT.text.height,
          border: '3px dashed rgba(40,255,120,0.6)',
        }}
      />
    </AbsoluteFill>
  );
};
