import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {CANVAS, MOTION} from '../theme';
import {Camera, Caption} from '../primitives';
import {StoryElement} from './elements';
import {atToFrame, resolveAt, type TimedScene} from './timeline';

/** Eine Szene: Kamera + Bühne (SVG) + Text-States, mit weichem Ein-/Ausblenden. */
export const SceneView: React.FC<{ts: TimedScene; isFirst: boolean; isLast: boolean}> = ({ts, isFirst, isLast}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const fadeIn = isFirst ? 1 : interpolate(frame, [0, MOTION.sceneFade], [0, 1], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [durationInFrames - MOTION.sceneFade, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'});
  const opacity = fadeIn * (isLast ? 1 : fadeOut);
  const {scene} = ts;

  const states = scene.text ?? [];
  const speechEndFrame = atToFrame('end', ts, fps);

  return (
    <AbsoluteFill style={{opacity}}>
      <svg width={CANVAS.width} height={CANVAS.height} viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`} style={{position: 'absolute', inset: 0}}>
        <Camera from={scene.camera?.from} to={scene.camera?.to} ease={scene.camera?.ease}>
          {(scene.elements ?? []).map((el, i) => (
            <StoryElement key={i} el={el} ts={ts} />
          ))}
        </Camera>
      </svg>
      {states.map((st, i) => {
        const inFrame = Math.max(0, atToFrame(st.at ?? (i === 0 ? -0.2 : 0), ts, fps));
        const next = states[i + 1];
        const outFrame = next ? atToFrame(next.at ?? 0, ts, fps) : isLast ? durationInFrames + 30 : durationInFrames;
        const speakTo = next ? outFrame : speechEndFrame;
        return (
          <Caption
            key={i}
            content={st.content}
            style={st.style}
            align={st.align}
            inFrame={inFrame}
            outFrame={outFrame}
            speakFrom={Math.max(inFrame, atToFrame(resolveAt(st.at, ts, 0), ts, fps))}
            speakTo={speakTo}
          />
        );
      })}
    </AbsoluteFill>
  );
};
