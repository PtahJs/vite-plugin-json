import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/main.js'),
            name: 'vite-plugin-json',
            fileName: (format) => `index.${format}.js`,
            formats: ['es', 'cjs']
        },
        rollupOptions: {
            // 确保外部化处理不打包到库中的依赖
            external: ['fs', 'path'], // 外部依赖，根据你的插件需求添加
            output: {
                globals: {
                    // 为外部依赖提供全局变量名称
                    fs: 'fs',
                    path: 'path'
                }
            }
        }
    }
});
