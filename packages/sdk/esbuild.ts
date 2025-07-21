import { join } from "node:path";
import { EsbuildBuilder } from "../../tools/build/esbuilder";
import { dependencies , devDependencies } from "./package.json";
import { rmSync } from "node:fs"

const external = [
    ...Object.keys(dependencies || {}),
    ...Object.keys(devDependencies || {})
];

const Builder = new EsbuildBuilder({
    target: "es2015",
    platform: "neutral",
    outfile: "./dist/monitext",
    entryPoints: ["./src/index.ts"],
    tsconfig: "./tsconfig.build.json",
});

Builder.setLabel("SDK BUILD")

Builder.loadOutputFormats("cjs", "esm", "iife");

Builder.loadBuildVariants([
    {
        external,
        bundle: true,
        minify: false,
    },
    {
        external,
        bundle: true,
        minify: true,
        minifyIdentifiers: false, // preserve fn names for d.ts match
    },
    {
        external: [], // include everything
        bundle: true,
        minify: true,
        minifyIdentifiers: false, // keep names aligned with types
        minifySyntax: true,
        minifyWhitespace: true,
        treeShaking: true,
    },
]);

Builder.loadPostBuild(function(){
    console.log("   - Removing types declaration folder\n")
    rmSync(join(__dirname, "dist", "types"), { recursive: true })
})

Builder.executeBuilds();
