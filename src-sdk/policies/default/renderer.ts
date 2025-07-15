import { ThemeManager } from "../../printUtils/theming";
import { cols as colors } from "../../printUtils/colorPack";
import { LogLevel } from "../../structs/log";
import { getTerminalWidth } from "../../printUtils/prettyPrint";

// renderer.ts
export function createStyledRenderer(themeManager: ThemeManager, cols: typeof colors) {
  return {
    header(level: LogLevel, msg: string[]): string[] {
      const theme = themeManager.getTheme(level);
      const color = cols[theme.color];
      const style = cols[theme.headerStyle || "bold"];
      return [
        `${style(color(`${theme.icon} [${level.toUpperCase()}]`))} ${cols.whiteBright(msg.join(" "))}`,
      ];
    },

    trace(level: LogLevel, trace: any): string[] {
      const theme = themeManager.getTheme(level);
      const lines: string[] = [];
      lines.push(`${cols[theme.metaLabelColor || "white"]("📌 StackTraceInfo:\n")}`);
      if (trace.callerName) lines.push(`    • ${cols.bold("Caller:")}   ${trace.callerName}`);
      if (trace.fileName) lines.push(`    • ${cols.bold("File:")}     ${trace.fileName}`);
      if (trace.lineNumber) lines.push(`    • ${cols.bold("Line:")}     ${trace.lineNumber}`);
      if (trace.columnNumber) lines.push(`    • ${cols.bold("Column:")}   ${trace.columnNumber}`);
      return lines;
    },

    fullTrace(level: LogLevel, fullTrace: string[] | undefined): string[] {
      const theme = themeManager.getTheme(level);
      const lines: string[] = [];
      lines.push(`${cols[theme.metaLabelColor || "white"]("📜 Full Trace:\n")}`);
      if (Array.isArray(fullTrace) && fullTrace.length > 0) {
        lines.push(...fullTrace.map(f => `   - ${f}`));
      } else {
        lines.push(`   No stack trace available.`);
      }
      return lines;
    },

    context(level: LogLevel, context: Record<string, any> | string): string[] {
      const theme = themeManager.getTheme(level);
      const lines: string[] = [];
      lines.push(`${cols[theme.contextColor || "white"]("📦 Context:")}`);
      if (!context) return ["   - No context available."];
      if (typeof context !== "object" || Object.keys(context).length !== 0) return [`   - ${context}`];
      
      const entries = Object.entries(context).map(([k, v]) => `   - ${k}: ${v}`).join("")

      return entries.trim() == "" ?[" - No context available."] : lines.concat(entries);

    },

    config(level: LogLevel, config: Record<string, any> | string): string[] {
      const theme = themeManager.getTheme(level);
      const lines: string[] = [];
      lines.push(`\n${cols[theme.configColor || "white"]("⚙️  Config:")}`);
      if (!config) return ["   - No config available."];
      if (typeof config !== "object") return [`   - ${config}`];
      return lines.concat(
        Object.entries(config).map(([k, v]) => `   - ${k}: ${v}`),
      );
    },

    separator(
      level: LogLevel,
      text: string = "",
      align: "center" | "left" = "center",
      override?: {
        pad?: boolean;
        icon?: boolean;
        style?: keyof typeof colors;
        transform?: "uppercase" | "capitalize" | "none";
      }
    ): string[] {
      const theme = themeManager.getTheme(level);
      const char = theme.separatorChar ?? "-";
      const color = cols[theme.color];

      const width = getTerminalWidth();

      // Style options: priority = override > theme > default
      const styleFn = cols[
        override?.style ?? theme.separatorStyle ?? "bold"
      ];

      const transform =
        override?.transform ?? theme.textTransform ?? "none";

      const showIcon =
        override?.icon ?? theme.showIconInSeparator ?? true;

      // Build label
      let label = text.trim();
      if (transform === "uppercase") label = label.toUpperCase();
      if (transform === "capitalize")
        label = label[0].toUpperCase() + label.slice(1);

      if (showIcon) label = `${theme.icon} ${label}`;
      const finalLabel = `${align == "center" ? " " : "" }${label} `;

      const lineLen = (Math.max(0, width - finalLabel.length));
      const left = align === "center" ? Math.floor(lineLen / 2) : 0;
      const right = Math.floor(lineLen) - left;

      const line = (char.repeat(left) + finalLabel + char.repeat(right)).split("");

      while(width - 1 < line.length){
        line.pop()
      }

      return [color(styleFn(line.join("")))];
    }

    // separator(level: LogLevel, text: string = "", align: "center" | "left" = "center"): string[] {
    //   const theme = themeManager.getTheme(level);
    //   const char = theme.separatorChar ?? "-";
    //   const color = cols[theme.color];

    //   const termWidth = getTerminalWidth();
    //   const label = ` ${text} `;
    //   const labelLen = label.length;

    //   if (align === "left") {
    //     const rightLen = Math.max(0, termWidth - labelLen);
    //     return [color(label + char.repeat(rightLen))];
    //   }

    //   // center alignment
    //   const totalPadding = Math.max(0, termWidth - labelLen);
    //   const padLeft = Math.floor(totalPadding / 2);
    //   const padRight = totalPadding - padLeft;

    //   return [color(char.repeat(padLeft) + label + char.repeat(padRight))];
    // }
  };
}
