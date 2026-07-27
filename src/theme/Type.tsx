import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from './ThemeProvider';
import { fonts } from './useAppFonts';
import { typeScale } from './tokens';

interface Props extends TextProps {
  color?: string;
  center?: boolean;
}

function make(fontFamily: string, fontSize: number, lineHeight: number) {
  return function Comp({ style, color, center, ...rest }: Props) {
    const { palette } = useTheme();
    return (
      <Text
        {...rest}
        style={[
          { fontFamily, fontSize, lineHeight, color: color ?? palette.text },
          center && { textAlign: 'center' },
          style,
        ]}
      />
    );
  };
}

/** Big serif reassurance line — the app's "voice", used sparingly. */
export const Whisper = make(fonts.displayItalicMedium, typeScale.title, 34);
export const WhisperLarge = make(fonts.displayItalicMedium, typeScale.display, 44);

export const Display = make(fonts.displaySemibold, typeScale.display, 42);
export const Title = make(fonts.displaySemibold, typeScale.title, 32);
export const Headline = make(fonts.bodySemibold, typeScale.headline, 27);
export const Body = make(fonts.body, typeScale.body, 25);
export const BodyMedium = make(fonts.bodyMedium, typeScale.body, 25);
export const Callout = make(fonts.body, typeScale.callout, 21);
export const Caption = make(fonts.bodyMedium, typeScale.caption, 18);
