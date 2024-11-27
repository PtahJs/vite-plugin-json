import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import eslintPluginImportX from 'eslint-plugin-import-x';

import oxlint from 'eslint-plugin-oxlint';

export default [
    {
        plugins: {
            'import-x': eslintPluginImportX
        }
    },
    {
        ...eslintPluginPrettier,
        rules: {
            ...eslintPluginPrettier.rules,
            ...eslintConfigPrettier.rules
        }
    },
    oxlint.configs['flat/recommended'],
    {
        ignores: ['node_modules/', 'dist/', 'public/']
    }
];
