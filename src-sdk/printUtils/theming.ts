import { LogLevel } from "../structs/log";
import { ChalkStyleKeys } from "./browserPolify";

export type LogThemeToken = {
  icon: string;
  color: ChalkStyleKeys;
  headerStyle?: ChalkStyleKeys;
  traceColor?: ChalkStyleKeys;
  contextColor?: ChalkStyleKeys;
  configColor?: ChalkStyleKeys;
  metaLabelColor?: ChalkStyleKeys;
  separatorChar?: string;

  // 💡 NEW
  separatorStyle?: ChalkStyleKeys; // e.g., "dim", "bold", etc.
  textTransform?: "uppercase" | "capitalize" | "none";
  showIconInSeparator?: boolean;
};


export type ThemeConfig = Record<LogLevel, LogThemeToken> & {
  common: {
    contextColor: ChalkStyleKeys,
    configColor: ChalkStyleKeys,
    metaLabelColor: ChalkStyleKeys,
    separatorChar: string,
    headerStyle: ChalkStyleKeys, // Moved here as it's common
  }
};

export class ThemeManager {
  private themes: Record<string, ThemeConfig>;
  private currentTheme: string;

  constructor(defaultTheme: string, themes: Record<string, ThemeConfig>) {
    this.themes = themes;
    this.currentTheme = defaultTheme;
  }

  use(theme: string) {
    if (!(theme in this.themes)) throw new Error(`Theme "${theme}" not found.`);
    this.currentTheme = theme;
  }

  getTheme(level: LogLevel): LogThemeToken {
    return {...(this.themes["common"] || {}), ...this.themes[this.currentTheme][level] };
  }

  get current(): string {
    return this.currentTheme;
  }

  listThemes() {
    return Object.keys(this.themes);
  }
}
