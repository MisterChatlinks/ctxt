import { ThemeManager } from "../../printUtils/theming";
import { DefaultDevTheme } from "./themes/defaults";

export const themeManager = new ThemeManager("default", {
  default: DefaultDevTheme,
  // darkMode, lightMode, prodTheme, etc.
});
