import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
    
// For `vitest`
export default defineConfig({plugins: [tsconfigPaths()]});
