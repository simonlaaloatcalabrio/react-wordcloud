import * as d3Cloud from 'd3-cloud';
import * as React from 'react';
import tippy from 'tippy.js';

import { useResponsiveSVG } from './hooks';
import render from './render';
import { Callbacks, MinMaxPair, Options, Scale, Spiral, Word } from './types';
import {
  getDefaultColors,
  getFontScale,
  getText,
  rotate,
  TIPPY_CLASS,
} from './utils';

const { useEffect } = React;

const d3 = { cloud: d3Cloud };

export const defaultCallbacks: Callbacks = {
  getWordTooltip: ({ count, text }: Word) => `${text} (${count})`,
};

export const defaultOptions: Options = {
  colors: getDefaultColors(),
  enableTooltip: true,
  fontFamily: 'impact',
  fontSizes: [5, 40],
  fontStyle: 'normal',
  fontWeight: 'normal',
  padding: 1,
  rotationAngles: [-90, 90],
  rotations: undefined,
  scale: Scale.Sqrt,
  spiral: Spiral.Archimedean,
  transitionDuration: 600,
};

interface Props {
  callbacks: Callbacks;
  minSize: MinMaxPair;
  maxWords: number;
  options: Options;
  size: MinMaxPair;
  words: Word[];
}

function Wordcloud({
  callbacks,
  maxWords,
  options,
  minSize,
  size: initialSize,
  words,
}: Props): React.ReactNode {
  const [ref, selection, size] = useResponsiveSVG(minSize, initialSize);
  const layout = d3.cloud();

  // render viz
  useEffect(() => {
    if (selection && size) {
      const {
        enableTooltip,
        fontFamily,
        fontStyle,
        fontSizes,
        fontWeight,
        rotations,
        rotationAngles,
        spiral,
        scale,
      } = options;

      if (enableTooltip) {
        tippy(`.${TIPPY_CLASS}`);
      }

      const sortedWords = words
        .concat()
        .sort()
        .slice(0, maxWords);

      if (rotations !== undefined) {
        layout.rotate(() => rotate(rotations, rotationAngles));
      }

      layout
        .size(size)
        .padding(1)
        .words(words)
        .spiral(spiral)
        .text(getText)
        .font(fontFamily)
        .fontSize((word: Word) => {
          const fontScale = getFontScale(words, fontSizes, scale);
          return fontScale(word.count);
        })
        .fontStyle(fontStyle)
        .fontWeight(fontWeight)
        .on('end', () => {
          // merge options and callbacks to handle missing values
          const mergedCallbacks = { ...defaultCallbacks, ...callbacks };
          const mergedOptions = { ...defaultOptions, ...options };
          render(selection, sortedWords, mergedOptions, mergedCallbacks);
        })
        .start();
    }
  }, [options, maxWords, selection, size, words]);

  return <div ref={ref} />;
}

Wordcloud.defaultProps = {
  callbacks: defaultCallbacks,
  maxWords: 100,
  minSize: [200, 150],
  options: defaultOptions,
};

export default Wordcloud;