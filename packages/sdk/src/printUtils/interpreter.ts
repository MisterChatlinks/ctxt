import chalk from "chalk";
import { chalkCSSPolify, ChalkStyleKeys } from "./browserPolify";

export function createStyleTag(style: string, ...message: string[]) {
  return `[mtxt-style[${style}]]${message.join("")}[mtxt-style-end]`;
}

type StyleObject = { style: string[]; content: (string | StyleObject)[] };

const TagRegex = /(\[mtxt-style\[[^\]]+\]\])|(\[mtxt-style-end\])/g;
const startTagRegex = /\[mtxt-style\[([^\]]+)\]\]/;
const endTag = "[mtxt-style-end]";

export function parseStyleTags(str: string): (string | StyleObject)[] {
  const input = str.split(TagRegex).filter(Boolean);
  const output: (string | StyleObject)[] = [];
  const stack: StyleObject[] = [];

  const pushTo = (v: string | StyleObject) => {
    if (stack.length > 0) stack[stack.length - 1].content.push(v);
    else output.push(v);
  };

  for (const part of input) {
    if (startTagRegex.test(part)) {
      const [, styles] = part.match(startTagRegex)!;
      const styleObj: StyleObject = { style: styles.split(" "), content: [] };
      stack.push(styleObj);
    } else if (part === endTag) {
      const finished = stack.pop()!;
      pushTo(finished);
    } else {
      pushTo(part);
    }
  }

  return output;
}

export function renderStyleTreeNode(tree: (string | StyleObject)[]): string {
  const result = tree.map(
    (el) => {
      if (typeof el === "string") { 
        return el; 
      }

      const rendered = renderStyleTreeNode(el.content);

      const apply = el.style.reduce((acc, s) => {
        return (acc as any)[s] ?? acc;
      }, chalk as any);

      return apply(rendered);
    }
  ).join("");

  return result
}

export function renderStyleTreeBrowser(
  tree: (string | StyleObject)[],
): [string, string[]] {
  let outStr = "";
  const styleList: string[] = [];

  const walk = (nodes: (string | StyleObject)[], currentStyle: string = "") => {
    for (const el of nodes) {
      if (typeof el === "string") {
        outStr += "%c" + el;
        styleList.push(currentStyle);
      } else {
        const newStyle = el.style.map(mapToCss).join("; ") + ";";
        walk(el.content, newStyle);
      }
    }
  };

  walk(tree);
  return [outStr, styleList];
}

function mapToCss(style: string): string {
  return (chalkCSSPolify[style as keyof typeof chalk & ChalkStyleKeys] || "");
}
