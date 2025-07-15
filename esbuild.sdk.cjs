const { build } = require("esbuild");
const { dependencies, peerDependencies } = require("./package.json");
const { rmSync, statSync } = require("fs");

const external = [
  ...Object.keys(dependencies || {}),
  ...Object.keys(peerDependencies || {}),
];

const formats = [
  { format: "esm", ext: ".mjs" },
  { format: "cjs", ext: ".cjs" },
  { format: "iife", ext: ".js" },
];

const entry = "./src-sdk/index";
const outdir = "./lib/sdk";
const target = "es2015";
const platform = "neutral";
const tsconfig = "./tsconfig.json";

/**
 * Build a file with given options and name suffix.
 */
async function runBuild({ format, ext }, options, suffix) {
  await build({
    entryPoints: [entry],
    outfile: `${outdir}/monitext.${format}${suffix}${ext}`,
    format,
    target,
    platform,
    tsconfig,
    ...options,
  }).catch(() => process.exit(1));
}

(async function () {
  for (const fmt of formats) {
    const name = `${outdir}/monitext.${fmt.format}${fmt.ext}`;

    // Regular bundle (no externals, readable)
    console.log(`🔨 [BUILD]        → ${name}`);
    await runBuild(fmt, {
      bundle: true,
      external,
      minify: false,
    }, "");

    // Minified bundle (no externals, size-focused)
    console.log(
      `🧹 [MINIFY]       → ${name.replace(fmt.ext, `.min${fmt.ext}`)}`,
    );
    await runBuild(fmt, {
      bundle: true,
      external,
      minify: true,
      minifyIdentifiers: false, // preserve fn names for d.ts match
    }, ".min");

    // Fully bundled (no externals), production mode
    console.log(
      `📦 [BUNDLE+MIN]   → ${name.replace(fmt.ext, `.min.bundle${fmt.ext}`)}`,
    );
    await runBuild(fmt, {
      bundle: true,
      external: [], // include everything
      minify: true,
      minifyIdentifiers: false, // keep names aligned with types
      minifySyntax: true,
      minifyWhitespace: true,
      treeShaking: true,
    }, ".min.bundle");

    console.log("");
  }

  console.log("🧹 Post-Build: Cleaning intermediate types...");
  rmSync("./lib/types", { recursive: true, force: true });
  const sizeKb = (statSync("./lib/sdk/index.d.ts").size / 1024).toFixed(2);
  console.log(`📦 Final .d.ts size: ${sizeKb} KB`);
  console.log("✅ Build Completed");
})();


