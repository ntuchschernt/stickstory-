import React from 'react';
import {useVideoConfig} from 'remotion';
import {color, FONT} from '../theme';
import {Counter, Dots, Graph, Ground, Label, Spotlight, Stairs, StickFigure} from '../primitives';
import {atToFrame, type TimedScene} from './timeline';
import type {Element} from './types';

/** Übersetzt ein Element aus der Story-JSON in ein Primitive (Sekunden → Frames). */
export const StoryElement: React.FC<{el: Element; ts: TimedScene}> = ({el, ts}) => {
  const {fps} = useVideoConfig();
  const f = (at: Element['at'], fb = 0) => atToFrame(at, ts, fps, fb);
  const inFrame = el.at === undefined ? 0 : f(el.at);
  const outFrame = el.until === undefined ? Infinity : f(el.until);
  const sec = (s: number | undefined, d: number) => Math.round((s ?? d) * fps);
  const common = {inFrame, outFrame};

  switch (el.type) {
    case 'figure':
      return (
        <StickFigure
          {...common}
          x={el.x}
          y={el.y}
          scale={el.scale}
          facing={el.facing}
          color={color(el.color ?? 'figure')}
          opacity={el.opacity}
          poses={el.poses ? [{frame: 0, pose: el.pose ?? 'stand'}, ...el.poses.map((p) => ({frame: f(p.at), pose: p.pose}))] : [{frame: 0, pose: el.pose ?? 'stand'}]}
          path={el.path?.map((p) => ({frame: f(p.at), x: p.x, y: p.y}))}
        />
      );
    case 'stairs':
      return (
        <Stairs
          {...common}
          x={el.x}
          y={el.y}
          steps={el.steps}
          stepW={el.stepW}
          stepH={el.stepH}
          staggerFrames={sec(el.stagger, 0.2)}
          direction={el.direction}
          color={color(el.color ?? 'figure')}
        />
      );
    case 'counter':
      return (
        <Counter
          {...common}
          x={el.x}
          y={el.y}
          from={el.from}
          to={el.to}
          durationFrames={sec(el.duration, 1.5)}
          decimals={el.decimals}
          prefix={el.prefix}
          suffix={el.suffix}
          size={el.size}
          curve={el.curve}
          color={color(el.color ?? 'text')}
        />
      );
    case 'graph':
      return <Graph {...common} x={el.x} y={el.y} w={el.w} h={el.h} curve={el.curve} durationFrames={sec(el.duration, 2.5)} label={el.label} />;
    case 'label':
      return <Label {...common} x={el.x} y={el.y} text={el.text} size={el.size ?? FONT.size.label} weight={el.weight} color={color(el.color ?? 'text')} />;
    case 'ground':
      return <Ground {...common} y={el.y} x1={el.x1} x2={el.x2} color={color(el.color ?? 'line')} />;
    case 'spotlight':
      return <Spotlight {...common} x={el.x} y={el.y} r={el.r} color={color(el.color ?? 'figure')} />;
    case 'dots':
      return (
        <Dots
          {...common}
          x={el.x}
          y={el.y}
          count={el.count}
          cols={el.cols}
          gap={el.gap}
          r={el.r}
          highlight={el.highlight}
          staggerFrames={el.stagger === undefined ? 1 : el.stagger * fps}
          color={color(el.color ?? 'figureDim')}
        />
      );
    default: {
      const unknown: never = el;
      throw new Error(`Unbekannter Element-Typ in Szene ${ts.scene.id}: ${JSON.stringify(unknown)}`);
    }
  }
};
