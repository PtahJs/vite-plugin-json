// vite-plugin-json-config.js
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

/**
 * Vite Plugin: JsonConfigPlugin
 *
 * Exposes a virtual module `virtual:JsonConfig` that surfaces configuration
 * from a JSON file.
 *
 * Behavior:
 * - Dev (serve): exports the JSON object directly, with HMR support.
 * - Build: emits the JSON file as an asset (`outputName`) and exports an async
 *   `getConfig()` that fetches it at runtime. It respects `import.meta.env.BASE_URL`.
 *
 * Robustness:
 * - Resolves the JSON path relative to Vite's `root` (works well in monorepos).
 * - Watches and hot-updates when the JSON file changes in dev.
 * - Gracefully falls back to `{}` if the file is missing or invalid.
 * - SSR-safe (returns `{}` when `fetch`/`window` are unavailable).
 *
 * @param {Object} [options]
 * @param {string} [options.path] - JSON source path relative to Vite root.
 * @param {string} [options.outputName="JsonConfig.json"] - Emitted JSON file name in build.
 * @returns {import('vite').Plugin}
 */
export default function JsonConfigPlugin(options = {}) {
  const { path: cfgPath, outputName = "JsonConfig.json" } = options;

  const VIRTUAL_ID = "virtual:JsonConfig";
  const RESOLVED_VIRTUAL_ID = "\0" + VIRTUAL_ID;

  /** @type {'build'|'serve'|null} */
  let command = null;
  /** @type {string} */
  let root = process.cwd();
  /** @type {any} */
  let jsonData = {};
  /** @type {string|null} */
  let absConfigPath = null;

  /**
   * Load and parse JSON from disk into `jsonData`.
   * @param {boolean} [silent=false] - suppress warnings
   */
  function loadJson(silent = false) {
    if (!absConfigPath) {
      jsonData = {};
      return;
    }
    try {
      if (!existsSync(absConfigPath)) {
        if (!silent) {
          console.warn(
            `[JsonConfig] File not found: ${absConfigPath}. Using {}.`
          );
        }
        jsonData = {};
        return;
      }
      const text = readFileSync(absConfigPath, "utf-8");
      jsonData = JSON.parse(text);
    } catch (e) {
      if (!silent) {
        console.warn(
          `[JsonConfig] Failed to read/parse ${absConfigPath}: ${
            e?.message || e
          }`
        );
      }
      jsonData = {};
    }
  }

  return {
    name: "vite-plugin-json-config",
    enforce: "pre",

    /**
     * Capture resolved Vite config to determine `command` and `root`.
     * Compute absolute path to the JSON source and do an initial load.
     */
    configResolved(resolved) {
      command = resolved.command; // 'serve' | 'build'
      root = resolved.root || root;
      if (cfgPath) {
        absConfigPath = resolve(root, cfgPath);
        loadJson(true);
      } else {
        jsonData = {};
      }
    },

    /**
     * Ensure Vite watches the JSON file for changes (dev & build).
     */
    buildStart() {
      if (absConfigPath) this.addWatchFile(absConfigPath);
    },

    /**
     * Map the public virtual ID to an internal resolvable ID.
     */
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      return null;
    },

    /**
     * Provide the module source for the virtual module.
     * - Dev: export the object directly + HMR accept.
     * - Build: export `getConfig()` fetching the emitted asset with BASE_URL.
     */
    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;

      if (command === "serve") {
        const payload = JSON.stringify(jsonData ?? {});
        return `
          // Dev: export JSON object directly
          export const config = ${payload};
          export default config;

          // Accept HMR updates for this virtual module
          if (import.meta.hot) {
            import.meta.hot.accept(() => {});
          }
        `;
      }

      // Build: provide an async getter; also export a harmless placeholder object.
      return `
        export const config = {};
        /**
         * Fetches the emitted JSON config at runtime.
         * Uses import.meta.env.BASE_URL to support custom base paths.
         * Returns {} on any failure or in SSR context.
         */
        export async function getConfig() {
          if (typeof window === 'undefined' || typeof fetch === 'undefined') {
            // SSR or non-browser environment: return {}
            return {};
          }
          const base = (import.meta.env && import.meta.env.BASE_URL) || '/';
          const url = base.replace(/\\/$/, '') + '/' + ${JSON.stringify(
            outputName
          )};
          try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(String(res.status));
            return await res.json();
          } catch {
            return {};
          }
        }
        export default getConfig;
      `;
    },

    /**
     * Emit the JSON as an asset in build so it can be fetched at runtime.
     * Uses Rollup's emitFile to integrate with the asset pipeline.
     */
    generateBundle() {
      if (command !== "build") return;
      // Reload once more to ensure latest content is emitted.
      if (absConfigPath) loadJson(true);

      this.emitFile({
        type: "asset",
        fileName: outputName,
        source: JSON.stringify(jsonData ?? {}, null, 2),
      });
    },

    /**
     * HMR: when the JSON source changes, reload and invalidate the virtual module.
     */
    handleHotUpdate(ctx) {
      if (!absConfigPath || ctx.file !== absConfigPath) return;
      loadJson();
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
      if (mod) {
        ctx.server.moduleGraph.invalidateModule(mod);
        return [mod];
      }
    },
  };
}
