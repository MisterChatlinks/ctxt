import chalk from "chalk";

/**
 * A partial mapping of chalk styling methods to their corresponding CSS styles.
 * This object provides a way to translate chalk's text styling options into
 * browser-compatible CSS styles for use in web applications.
 *
 * @typeParam keyof typeof chalk - Represents the keys of the chalk module, which
 * correspond to various text styling methods.
 * @type {Partial<Record<keyof typeof chalk, string>>} - A partial record where
 * each key is a chalk styling method and the value is the equivalent CSS style.
 *
 * Example usage:
 * ```typescript
 * const cssStyle = chalkCSSPolify.red; // "color: red"
 * ```
 */
/**
 * A CSS Polyfill mapping of core Chalk methods to their equivalent CSS styles.
 *
 * This provides CSS rules suitable for emulating Chalk's styling in browser environments
 * where console output is styled via CSS rather than ANSI escape codes.
 */
export const chalkCSSPolify: Partial<Record<keyof typeof chalk & ChalkStyleKeys, string>> = {
  // --- Modifiers ---
  reset: "color: inherit; background-color: inherit; font-weight: normal; font-style: normal; text-decoration: none; opacity: 1; filter: none;",
  bold: "font-weight: bold;",
  dim: "opacity: 0.6;",
  italic: "font-style: italic;",
  underline: "text-decoration: underline;",
  inverse: "filter: invert(100%);", // Note: This inverts both background and foreground colors.
  hidden: "opacity: 0;", // Makes the text invisible but preserves space.
  strikethrough: "text-decoration: line-through;",
  // strikethrough is an alias for strikethrough in chalk
  // visible: (Chalk doesn't have a 'visible' method, 'reset' or 'hidden' are used)

  // --- Colors (Foreground) ---
  black: "color: black;",
  red: "color: red;",
  green: "color: green;",
  yellow: "color: yellow;",
  blue: "color: blue;",
  magenta: "color: magenta;",
  cyan: "color: cyan;",
  white: "color: white;",
  gray: "color: gray;", // or 'grey'
  grey: "color: grey;",

  // --- Bright Colors (Foreground) ---
  blackBright: "color: #3f3f3f;", // Common mapping for bright black
  redBright: "color: #ff0000;",
  greenBright: "color: #00ff00;",
  yellowBright: "color: #ffff00;",
  blueBright: "color: #0000ff;",
  magentaBright: "color: #ff00ff;",
  cyanBright: "color: #00ffff;",
  whiteBright: "color: #ffffff;",

  // --- Background Colors ---
  bgBlack: "background-color: black;",
  bgRed: "background-color: red;",
  bgGreen: "background-color: green;",
  bgYellow: "background-color: yellow;",
  bgBlue: "background-color: blue;",
  bgMagenta: "background-color: magenta;",
  bgCyan: "background-color: cyan;",
  bgWhite: "background-color: white;",
  bgGray: "background-color: gray;",
  bgGrey: "background-color: grey;",

  // --- Bright Background Colors ---
  bgBlackBright: "background-color: #3f3f3f;",
  bgRedBright: "background-color: #ff0000;",
  bgGreenBright: "background-color: #00ff00;",
  bgYellowBright: "background-color: #ffff00;",
  bgBlueBright: "background-color: #0000ff;",
  bgMagentaBright: "background-color: #ff00ff;",
  bgCyanBright: "background-color: #00ffff;",
  bgWhiteBright: "background-color: #ffffff;",
};

export type ChalkStyleKeys =
  | "reset" | "bold" | "dim" | "italic" | "underline" | "inverse" | "hidden" | "strikethrough"
  | "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray" | "grey"
  | "blackBright" | "redBright" | "greenBright" | "yellowBright" | "blueBright" | "magentaBright" | "cyanBright" | "whiteBright"
  | "bgBlack" | "bgRed" | "bgGreen" | "bgYellow" | "bgBlue" | "bgMagenta" | "bgCyan" | "bgWhite" | "bgGray" | "bgGrey"
  | "bgBlackBright" | "bgRedBright" | "bgGreenBright" | "bgYellowBright" | "bgBlueBright" | "bgMagentaBright" | "bgCyanBright" | "bgWhiteBright";
