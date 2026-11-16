import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useVideoConfig} from 'remotion';
import {AUDIO} from '../theme';
import {Background, SafeZones} from '../primitives';
import {ensureFonts} from '../fonts';
import {SceneView} from './SceneView';
import {atToFrame, buildTimeline} from './timeline';
import type {Story} from './types';

ensureFonts();

export type StoryProps = {story: Story; showSafeZones?: boolean};

/** Musiklautstärke mit Ducking unter dem Voiceover + Fade-in/-out. */
const musicVolume = (t: number, speech: [number, number][], total: number, vol: number, ducked: number) => {
  const r = AUDIO.duckRampSec;
  let duck = 0;
  for (const [a, b] of speech) {
    // 0 außerhalb, 1 innerhalb eines Sprechbereichs, weiche Rampen davor/danach
    const d = interpolate(t, [a - r, a, b, b + r * 1.6], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    duck = Math.max(duck, d);
  }
  const fade = Math.min(
    interpolate(t, [0, AUDIO.musicFadeInSec], [0, 1], {extrapolateRight: 'clamp'}),
    interpolate(t, [total - AUDIO.musicFadeOutSec, total], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );
  return (vol + (ducked - vol) * duck) * fade;
};

export const StoryComposition: React.FC<StoryProps> = ({story, showSafeZones}) => {
  const {fps} = useVideoConfig();
  const tl = useMemo(() => buildTimeline(story), [story]);
  const vo = story.voiceover === undefined ? 'audio/vo.mp3' : story.voiceover;
  const speech = vo ? tl.speech : [];
  const music = story.music;

  return (
    <AbsoluteFill>
      <Background />
      {tl.scenes.map((ts, i) => {
        const from = Math.round(ts.visStart * fps);
        const dur = Math.round(ts.visEnd * fps) - from;
        return (
          <Sequence key={ts.scene.id} from={from} durationInFrames={dur} name={`Szene ${ts.scene.id}`}>
            <SceneView ts={ts} isFirst={i === 0} isLast={i === tl.scenes.length - 1} />
            {(ts.scene.sfx ?? []).map((s, k) => (
              <Sequence key={k} from={atToFrame(s.at, ts, fps)} name={`SFX ${s.name}`} layout="none">
                <Audio src={staticFile(`sfx/${s.name}.mp3`)} volume={s.volume ?? AUDIO.sfxVolume} />
              </Sequence>
            ))}
          </Sequence>
        );
      })}

      {/* Voiceover: jeder Satz als eigener Ausschnitt → Pausen lassen sich frei verlängern */}
      {vo && tl.scenes.map((ts) => (
        <Sequence key={`vo-${ts.scene.id}`} from={Math.round(ts.speechAt * fps)} durationInFrames={Math.ceil(ts.speechDur * fps) + 1} name={`VO ${ts.scene.id}`} layout="none">
          <Audio src={staticFile(vo)} trimBefore={Math.round(ts.voStart * fps)} durationInFrames={Math.ceil(ts.speechDur * fps)} volume={AUDIO.voVolume} />
        </Sequence>
      ))}

      {music ? (
        <Audio
          src={staticFile(music.src)}
          loop
          loopVolumeCurveBehavior="extend"
          volume={(f) => musicVolume(f / fps, speech, tl.total, music.volume ?? AUDIO.musicVolume, music.ducked ?? AUDIO.musicDucked)}
        />
      ) : null}

      {showSafeZones ? <SafeZones /> : null}
    </AbsoluteFill>
  );
};

export const storyDuration = (story: Story, fps: number) => Math.ceil(buildTimeline(story).total * fps);
