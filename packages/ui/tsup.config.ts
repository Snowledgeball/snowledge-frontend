import { Options, defineConfig } from "tsup";
import path from "path";

export default defineConfig((options: Options) => ({
  entry: ["index.ts"],
  banner: {
    js: "'use client'",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react"],
  injectStyle: true,
  alias: {
    "@": path.resolve(__dirname, "."),
  },
  ...options,
}));
