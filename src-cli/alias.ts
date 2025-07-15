// import { existsSync } from "fs";
// import { join } from "path";
// import { writeFileSync, readFileSync } from "fs";
// import { jsonFormat } from "../src/utils/jsonFormat";

// export function injectPathAliasIfPossible(root: string, runtimeFile: string) {
//     const relPath = "./" + runtimeFile;
//     const alias = "#monitext-runtime";

//     // Try package.json (Node ESM resolution)
//     const pkgJsonPath = join(root, "package.json");
//     if (existsSync(pkgJsonPath)) {
//         const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
//         pkg.imports = pkg.imports || {};
//         pkg.imports[alias] = relPath;
//         writeFileSync(pkgJsonPath, jsonFormat(pkg), "utf-8");
//         console.log("✅ Added monitext/runtime to package.json 'imports'");
//     }

//     // Try tsconfig.json (TypeScript)
//     const tsconfigPath = join(root, "tsconfig.json");
//     if (existsSync(tsconfigPath)) {
//         const ts = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
//         ts.compilerOptions = ts.compilerOptions || {};
//         ts.compilerOptions.paths = ts.compilerOptions.paths || {};
//         ts.compilerOptions.paths[alias] = [relPath];
//         writeFileSync(tsconfigPath, jsonFormat(ts), "utf-8");
//         console.log("✅ Added monitext/runtime to tsconfig.json 'paths'");
//     }

//     // Try deno.json (Deno)
//     const denoConfigPath = join(root, "deno.json");
//     if (existsSync(denoConfigPath)) {
//         const deno = JSON.parse(readFileSync(denoConfigPath, "utf-8"));
//         deno.imports = deno.imports || {};
//         deno.imports[alias] = relPath;
//         writeFileSync(denoConfigPath, jsonFormat(deno), "utf-8");
//         console.log("✅ Added monitext/runtime to deno.json 'imports'");
//     }
// }
