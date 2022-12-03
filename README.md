# vite-plugin-squoosh [![Build](https://github.com/bituq/vite-plugin-squoosh/actions/workflows/build.yml/badge.svg)](https://github.com/bituq/vite-plugin-squoosh/actions/workflows/build.yml)

a build plugin for Vite that uses the [squoosh](https://github.com/GoogleChromeLabs/squoosh) library to compress images. It offers persistent caching and parallel processing, and supports a range of image formats. This can help improve performance and reduce image size in web applications.

## Install

- **Node:** version 16.x
- **Vite:** version >=2.x
- **vite-plugin-squoosh:** [see on NPM](https://www.npmjs.com/package/vite-plugin-squoosh)

## Usage

**Using NPM:**
```
npm install --save-dev vite-plugin-squoosh
```
**Using yarn:**
```
yarn add -D vite-plugin-squoosh
```

> Vite configuration in `vite.config.ts`
```ts
import squooshPlugin from 'vite-plugin-squoosh';

export default () => ({
    plugins: [squooshPlugin({
        // Specify codec options.
        codecs: {
            mozjpeg: { quality: 30, smoothing: 1 },
            webp: { quality: 25 },
            avif: { cqLevel: 20, sharpness: 1 },
            jxl: { quality: 30 },
            wp2: { quality: 40 },
            oxipng: { level: 3 }
        },
        // Do not encode .wp2 and .webp files.
        exclude: /.(wp2|webp)$/,
        // Encode png to webp.
        encodeTo: [{ from: /.png$/, to: "webp" }]
    })]
})
```

### Plugin options
The `squooshPlugin` function takes an options object as its only argument. The possible properties of this options object are:

| Option           | Description                                                                                                                 |
|------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `cacheLevel`     | A string that determines how aggressively to use caching to speed up processing. This can be `"None"`, `"PerSession"`, or `"Persistent"`. |
| `cachePath`      | A string that specifies the path to the cache file on the filesystem.                                                            |
| `codecs`         | An object that specifies the codecs to use for encoding the images.                                                              |
| `coreCount`      | An optional integer that specifies the number of CPU cores to use for processing the images.                                      |
| `exclude`        | An array of glob patterns that specify which files to exclude from processing.                                                    |
| `includeDirs`    | An array of strings or objects that specify additional directories to search for images to process.                               |
| `silent`         | A boolean that specifies whether to suppress logging output from the plugin.     

## Build locally

Pnpm *(version 7.x)* is a requirement.

```
npm install -g pnpm
```

Next, run 'install' with pnpm. This will install all the right dependencies for the workspaces.
```
pnpm install
```

### (Optional)
To see debug logs, set the `DEBUG` environment variable to `vite-plugin-squoosh`.
```
set DEBUG=vite-plugin-squoosh
```

## Run examples
This will run all the examples in the `packages/examples/` directory.
```
pnpm run build:ex
```
