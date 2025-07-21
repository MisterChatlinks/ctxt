import { build, type BuildOptions } from "esbuild";

/**
 * Represents a valid esbuild output format with its corresponding file extension.
 */
export interface OutputFormat {
  format: "cjs" | "esm" | "iife";
  ext: ".cjs" | ".mjs" | ".js";
}


// Define the type for your post-build function
// It will receive the esbuild BuildResult as an argument
type PostBuildFunction = () => void | Promise<void>;


/**
 * Tool for orchestrating multiple esbuild runs with varying options and output formats.
 */
export class EsbuildBuilder {
  private formats: OutputFormat[] = [];
  private variants: Partial<BuildOptions>[] = [];
  private label: string = "UnnamedBuild";
  private postBuildFn!: PostBuildFunction;

  /**
   * Create a new builder instance.
   * @param defaultOptions Base esbuild config applied to all builds.
   * @throws {TypeError} If `defaultOptions` is not a valid object.
   */
  constructor(private defaultOptions: BuildOptions = {}) {
    if (typeof defaultOptions !== "object" || defaultOptions === null) {
      throw new TypeError("Builder: defaultOptions must be an object.");
    }
  }

  /**
   * Set a name or label for the current build session (for logging).
   * @param label A descriptive build label.
   */
  public setLabel(label: string): void {
    this.label = label || "UnnamedBuild";
  }

  /**
   * Load supported output formats for the build.
   * @param formats List of format names like "esm", "cjs", "iife".
   */
  public loadOutputFormats(...formats: OutputFormat["format"][]): void {
    this.formats = useOutput(...formats); // assumes external helper
  }

  /**
   * Load multiple build config variants to be merged into the default config.
   * @param variants An array of partial esbuild options.
   * @throws {TypeError} If input is not an array.
   */
  public loadBuildVariants(variants: Partial<BuildOptions>[]): void {
    if (!Array.isArray(variants)) {
      throw new TypeError("loadBuildVariants expects an array of build configs.");
    }
    this.variants = [...variants];
  }

  /**
 * Loads a function to be executed after the esbuild process completes successfully.
 * This function will receive the esbuild BuildResult.
 * @param fn The function to execute after build.
 */
  public loadPostBuild(fn: PostBuildFunction) {
    this.postBuildFn = fn;
  }

  /**
   * Run esbuild for every combination of build variant and output format.
   * Applies naming rules and outputs structured logs per build.
   */
  public async executeBuilds(): Promise<void> {
    console.log(`\n🚀 Starting build: "${this.label}"\n`);

    for (const variant of this.variants) {
      for (const format of this.formats) {
        const merged = { ...this.defaultOptions, ...variant };

        // Prepare output paths
        let outfile: string | undefined = undefined;
        let outdir: string | undefined = undefined;

        if (merged.outfile) {
          outfile = this.makeOutfileName(merged.outfile, merged, format.ext);
        } else if (merged.outdir) {
          outdir = merged.outdir;
          merged.entryNames = `[name].${format.format}`;
        } else {
          throw new Error(`❌ Missing 'outfile' or 'outdir' in build config:\n${JSON.stringify(merged, null, 2)}`);
        }

        const config: BuildOptions = {
          ...merged,
          format: format.format,
          outfile,
          outdir,
        };

        const label = [
          "BUILD",
          config.minify ? "MINIFY" : "",
          config.bundle ? "BUNDLE" : "",
        ]
          .filter(Boolean)
          .join("+");

        console.log(`→ [${label}] ${outfile || outdir}`);

        try {
          await build(config);
          console.log("✅ Build succeeded.\n");
        } catch (err) {
          console.error("❌ Build failed:", err);
          throw err;
        }
      }
    }

    if (typeof this.postBuildFn === "function") {
      console.log("🔧 Executing post-build function...");

      try {
        await this.postBuildFn();
        console.log("✅ Post-build succeeded.\n");
      } catch (err) {
        console.error("❌ Post-build failed:", err);
      }
    }


    console.log(`🏁 Build "${this.label}" completed.`);
  }

  /**
   * Internal helper to create a descriptive outfile name.
   * Includes format-specific suffixes like `.min`, `.bundle`, etc.
   * @param base Base filename without extension.
   * @param flags Build flags (e.g., minify, bundle, external).
   * @param ext File extension to append (e.g., .mjs).
   */
  private makeOutfileName(
    base: string,
    flags: Partial<BuildOptions>,
    ext: string
  ): string {
    return base +
      (flags.minify ? ".min" : "") +
      (flags.bundle ? ".bundle" : "") +
      (Array.isArray(flags.external) && flags.external.length !== 0 ? ".noext" : "") +
      ext;
  }
}

export type OutputExt = ".mjs" | ".cjs" | ".js";

const extMap: Record<OutputFormat["format"], OutputExt> = {
  esm: ".mjs",
  cjs: ".cjs",
  iife: ".js",
};

/**
 * Create a list of output format objects with appropriate extensions.
 * @param formats List of format strings like "esm", "cjs", "iife"
 * @returns Array of { fmt, ext } objects
 */
export function useOutput(...formats: OutputFormat["format"][]): OutputFormat[] {
  return formats.map(fmt => {
    const ext = extMap[fmt];
    if (!ext) throw new Error(`Unsupported format: ${fmt}`);
    return { format: fmt, ext };
  });
}
