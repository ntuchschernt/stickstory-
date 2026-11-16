import React from 'react';
import {Composition} from 'remotion';
import {CANVAS} from './theme';
import {StoryComposition, storyDuration, type StoryProps} from './story/StoryComposition';
import {STORIES} from './stories.generated';

/** Jede Datei in stories/*.json wird automatisch eine eigene Composition (ID = Story-ID). */
export const Root: React.FC = () => (
  <>
    {STORIES.map((story) => (
      <Composition
        key={story.id}
        id={story.id}
        component={StoryComposition as React.FC<StoryProps>}
        width={CANVAS.width}
        height={CANVAS.height}
        fps={CANVAS.fps}
        durationInFrames={storyDuration(story, CANVAS.fps)}
        defaultProps={{story, showSafeZones: false}}
        calculateMetadata={({props}) => ({durationInFrames: storyDuration(props.story, CANVAS.fps)})}
      />
    ))}
  </>
);
