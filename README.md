# vite-plugin-squoosh [![Build](https://github.com/bituq/vite-plugin-squoosh/actions/workflows/build.yml/badge.svg)](https://github.com/bituq/vite-plugin-squoosh/actions/workflows/build.yml)

A vite plugin for compressing and encoding image assets, using [squoosh](https://github.com/GoogleChromeLabs/squoosh).

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
        codecs: {
            mozjpeg: {
                quality: 30,
                smoothing: 1
            },
            webp: {
                quality: 25
            },
            avif: {
                cqLevel: 20,
                sharpness: 1
            },
            jxl: {
                quality: 30
            },
            wp2: {
                quality: 40
            },
            oxipng: {
                level: 3
            }
        }
    })]
})
```

### Options
| Option | type | description |
| ------ | ---- | ----------- |
| codecs | `Encoders \| undefined` | Codecs to use for processing. [See supported codecs](https://github.com/bituq/vite-plugin-squoosh/blob/master/packages/core/src/types/_encoders.ts). |
| silent    | `boolean` | Enable/disable logging. |

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
