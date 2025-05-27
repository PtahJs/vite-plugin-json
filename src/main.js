import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * JsonConfigPlugin
 * @param {Object} options - Plugin options.
 * @param {string} [options.path] - The path to the configuration JSON file.
 * @param {string} [options.outputName="JsonConfig.json"] - Name of the output JSON file.
 * @param {string} [options.outputDirectory="./dist"] - Directory where the output file will be written.
 * @returns {Object} Rollup/Vite plugin object.
 */
export default (options = {}) => {
    const virtualModuleId = 'virtual:JsonConfig';
    const resolvedVirtualModuleId = `\0${virtualModuleId}`;
    let $command = null;
    let jsonData = null;

    // Load JSON data if the `path` option is provided.
    if (options.path) {
        try {
            const filePath = join(process.cwd(), options.path);
            jsonData = JSON.parse(readFileSync(filePath, { encoding: 'utf-8' }));
        } catch (error) {
            console.error('Error reading JSON configuration file:', error);
            jsonData = {}; // Fallback to an empty JSON string.
        }
    }

    const outputName = options.outputName || 'config.json';
    const outputDirectory = options.outputDirectory || './dist';

    return {
        name: 'VitePluginJson',

        /**
         * Rollup/Vite hook: Config handler
         * @param {Object} config - The resolved configuration object.
         * @param {Object} context - Context object containing the command (`build` or `serve`).
         */
        config(config, { command }) {
            $command = command;
        },

        /**
         * Rollup/Vite hook: Resolve virtual module ID.
         * @param {string} id - Module ID being resolved.
         * @returns {string|null} Resolved ID or null if not matched.
         */
        resolveId(id) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
            return null;
        },

        /**
         * Rollup/Vite hook: Load virtual module.
         * @param {string} id - The resolved module ID.
         * @returns {string|null} Module code or null if not matched.
         */
        load(id) {
            if (id === resolvedVirtualModuleId) {
                if ($command === 'serve') {
                    return `export default (callback) => callback(${JSON.stringify(jsonData)});`;
                } else {
                    return `export default callback=>{fetch("./${outputName}").then(response=>response.json()).then(callback).catch(()=>callback({}))};`;
                }
            }
            return null;
        },

        /**
         * Rollup/Vite hook: Write additional assets during the bundle process.
         * Writes the JSON data to the specified output directory.
         */
        writeBundle() {
            if ($command !== 'build') return;
            try {
                // Ensure the output directory exists, create if necessary.
                if (!existsSync(outputDirectory)) {
                    mkdirSync(outputDirectory, { recursive: true });
                }

                // Write the JSON data to the specified file.
                writeFileSync(
                    join(outputDirectory, outputName),
                    jsonData.toString(),
                    'utf8'
                );
                console.log(
                    `Configuration file written to ${join(outputDirectory, outputName)}`
                );
            } catch (error) {
                console.error('Error writing configuration file:', error);
            }
        }
    };
};
