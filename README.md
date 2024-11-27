<p align='center'>
<img src='https://www.ptahjs.com/assets/image/logo.png' alt="@ptahjs/vite-plugin-json - JSON Configuration Management for Vite"><br>
Dynamic JSON Configuration Management for Vite
</p>

<p align='center'>
<a href='https://www.npmjs.com/package/@ptahjs/vite-plugin-json' target="__blank">
<img src='https://img.shields.io/npm/v/@ptahjs/vite-plugin-json?color=33A6B8&label=' alt="NPM version">
</a>
<a href="https://www.npmjs.com/package/@ptahjs/vite-plugin-json" target="__blank">
    <img alt="NPM Downloads" src="https://img.shields.io/npm/dm/@ptahjs/vite-plugin-json?color=476582&label=">
</a>
<a href="https://github.com/PtahJs/vite-plugin-json" target="__blank">
    <img src="https://img.shields.io/static/v1?label=&message=GitHub%20Repo&color=2e859c" alt="GitHub Repo">
</a>
<br>
<a href="https://github.com/PtahJs/vite-plugin-json" target="__blank">
<img alt="GitHub stars" src="https://img.shields.io/github/stars/PtahJs/vite-plugin-json?style=social">
</a>
</p>

## <br>

## 🚀 Features

-   🛠️ **Virtual Module Support**: Use a virtual module to dynamically load JSON configurations.
-   👌 **Flexible Output**: Generates configuration files with customizable paths and filenames.
-   ⚡ **Multiple Build Formats**: Supports CommonJS (CJS), ES Modules (ESM), and UMD formats for compatibility with various environments.
-   🐞 **Error Handling**: Handles missing or invalid JSON files gracefully.
-   🪛 **Customizable**: Configure input paths, output directories, and filenames with ease.

---

## ⚡ Installation

Install the plugin via pnpm:

```bash
pnpm add @ptahjs/vite-plugin-json --dev
```

Or using npm:

```bash
npm install @ptahjs/vite-plugin-json --dev
```

Or using yarn:

```bash
yarn add @ptahjs/vite-plugin-json --dev
```

---

## ⚙️ Usage

Add the plugin to your Vite configuration in `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import JsonConfig from '@ptahjs/vite-plugin-json';

export default defineConfig({
    plugins: [
        JsonConfig({
            path: './src/config.json', // Path to your JSON file
            outputName: 'config.json', // Name of the output file
            outputDirectory: './dist' // Directory to save the output file
        })
    ]
});
```

### Example JSON File

An example `config.json` file:

```json
{
    "apiEndpoint": "https://api.example.com",
    "debug": true
}
```

---

## 🧲 How It Works

### Development Mode (`serve`)

-   The plugin creates a virtual module (`virtual:JsonConfig`) to dynamically provide the JSON configuration.
-   The virtual module can be imported in your application:

```javascript
import JsonConfig from 'virtual:JsonConfig';

JsonConfig((config) => {
    console.log('Loaded config:', config);
});
```

### Build Mode (`build`)

-   The JSON configuration is written to the specified output directory as a file (e.g., `project/config.json`).
-   Your application can fetch this configuration at runtime:

```javascript
fetch('/config.json')
    .then((response) => response.json())
    .then((config) => {
        console.log('Loaded config:', config);
    });
```

---

## ⛏️ Build Output Formats

The plugin supports multiple build formats for compatibility with different environments:

| Format | File Example   | Use Case                                   |
| ------ | -------------- | ------------------------------------------ |
| ESM    | `index.es.js`  | Modern bundlers like Vite, Rollup, Webpack |
| CJS    | `index.cjs.js` | Node.js applications                       |
| UMD    | `index.umd.js` | Browsers and universal environments        |

---

## 📝 Options

| Option            | Type     | Default             | Description                                      |
| ----------------- | -------- | ------------------- | ------------------------------------------------ |
| `path`            | `string` | `undefined`         | Path to the JSON configuration file.             |
| `outputName`      | `string` | `"JsonConfig.json"` | Name of the output configuration file.           |
| `outputDirectory` | `string` | `"./dist"`          | Directory to save the output configuration file. |

---

## 💻 Example Scenarios

1. **Dynamic Configuration in Development**  
   Use the plugin in `serve` mode to load configuration dynamically without rebuilding the project.

2. **Static Configuration in Production**  
   Build the project with a statically generated configuration file for better performance.

---

## 🔧 Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/PtahJs/vite-plugin-json.git
cd vite-plugin-json
pnpm install
```

Build the plugin:

```bash
pnpm build
```

---

## 🔗 Contributing

Contributions are welcome! If you encounter issues or have feature requests, feel free to open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## 📧 Contact

For questions or support, feel free to reach out at [bobofpl@gmail.com](mailto:bobofpl@gmail.com).
