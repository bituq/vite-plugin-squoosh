import { debug, extensions } from "./globals";
import { ModuleOptions } from "./types";
import { ResolvedConfig, Logger, createLogger, Plugin } from 'vite';
import path from 'path';
import { isCorrectFormat, readFilesRecursive } from "./utilities";
import chalk from 'chalk';
import { ImagePool } from "@squoosh/lib";
import fs from 'fs';
import os from 'os';
import { defaultEncoderOptions, EncoderAsset, EncoderType } from "./types/_encoders";
import { dim, header } from "./log";
import EncoderOptions from "./types/_encoders";
import PluginCache, { AssetPath } from "./types/_cache";

const transformAssetPath = (assetPath: AssetPath, transform: (file: string) => string): AssetPath => ({
    from: transform(assetPath.from),
    to: transform(assetPath.to)
})

export default function squooshPlugin(options: ModuleOptions = {}): Plugin {
    let outputPath: string
    let publicDir: string
    let config: ResolvedConfig
    let logger: Logger
    let files: AssetPath[] = []

    const pushImageAssets = (files: string[], target: AssetPath[], transformers: { from?: (file: string) => string, to?: (file: string) => string}) =>
        files.filter(file => isCorrectFormat(file, extensions, options.exclude))
        .map(from => ({ from: transformers?.from?.call(transformers, from) ?? from, to: transformers?.to?.call(transformers, from) ?? from}))
        .forEach(({from, to}) => {
            debug(chalk.magentaBright(from), "->", chalk.blueBright(to))
            target.push({from, to})
        })

    return {
        name: 'vite:squoosh',
        apply: 'build',
        enforce: 'post',

        configResolved(resolvedConfig) {
            config = resolvedConfig
            logger = options.silent ? createLogger("silent") : config.logger
            publicDir = config.publicDir
            outputPath = path.resolve(config.root, config.build.outDir)
        },

        async generateBundle(_, bundler) {
            // Filter out images
            pushImageAssets(Object.keys(bundler), files, {
                from: file => path.resolve(outputPath, file),
                to: file => path.resolve(outputPath, file)
            })
        },

        async closeBundle() {
            if (publicDir)
                // Filter out static images
                pushImageAssets(readFilesRecursive(publicDir), files, {
                    from: file => path.resolve(publicDir, file),
                    to: file => path.resolve(outputPath, path.relative(publicDir, file))
                })
            // Filter out additional files
            if (options.includeDirs)
                for (const dir of options.includeDirs)
                    if (typeof dir === "string")
                        pushImageAssets(readFilesRecursive(dir), files, {})
                    else
                        pushImageAssets(readFilesRecursive(dir.from), files, {
                            from: file => path.resolve(config.root, file),
                            to: file => path.resolve(dir.to, path.basename(file))
                        })

            logger.info(header + dim('Processing', files.length, 'assets...'), { clear: true })

            const codecs: EncoderOptions = {}

            if (options.codecs)
                Object.keys(defaultEncoderOptions).forEach(key => codecs[key] = { ...defaultEncoderOptions[key], ...(options.codecs ?? {})[key] })
            
            async function processAsset(asset: AssetPath, encodeWith: EncoderType, imagePool: any) {
                const start = Date.now()
                const oldSize = fs.lstatSync(asset.from).size
                let newSize = oldSize

                const image = imagePool.ingestImage(asset.from)

                // Decode image
                await image.decoded
                
                // Encode image
                await image.encode({[encodeWith]: codecs[encodeWith]})

                const encodedWith = (await (Object.values(image.encodedWith)[0] as Promise<any>))
                debug("to:", encodeWith)
                
                newSize = encodedWith.size

                if (newSize < oldSize) {
                    fs.mkdirSync(path.dirname(asset.to), { recursive: true })
                    fs.writeFileSync(asset.to, encodedWith.binary)
                }

                return { oldSize, newSize, time: Date.now() - start }
            }

            const startTime = Date.now()
            const imagePool = new ImagePool(os.cpus().length)
            
            debug(dim("Running on", os.cpus().length, "cores."))
            debug(dim(files.length, "assets queued."))

            const cache: PluginCache = {}
            
            const newAssetPaths: EncoderAsset[] = files.map(asset => ({
                asset: transformAssetPath(asset, path.normalize),
                logPath: path.normalize(path.join(chalk.dim(config.build.outDir), chalk.blue(path.relative(outputPath, asset.to)))),
                encodeWith: options.encodeTo?.find(value => value.from.test(path.extname(asset.from)))?.to
            }))
            
            const longestPathNameLength = newAssetPaths.sort((a, b) => b.logPath.length - a.logPath.length)[0].logPath.length
            
            newAssetPaths.forEach(asset => {
                const ext = path.extname(asset.asset.from)
                const encodeTo = options.encodeTo?.find(value => value.from.test(ext))?.to  
                asset.encodeWith = encodeTo ?? Object.keys(codecs).find(codec => codecs[codec].extension?.test(ext))
                if (asset.encodeWith && options.useCache) {
                    cache.assets ??= {}
                    cache.assets[asset.encodeWith] ??= []
                    const other = cache.assets[asset.encodeWith].find(other => other.from == asset.asset.from)
                    if (other && fs.existsSync(other.to)) {
                        asset.asset.from = other.to
                        asset.encodeWith = undefined
                    } else
                        cache.assets[asset.encodeWith]?.push({...asset.asset})
                }
                asset.logPath += ' '.repeat(longestPathNameLength - asset.logPath.length)
            })

            let lastTime = 0
            let bytesSaved = 0
            let notHandled: number | undefined

            const handles = newAssetPaths.filter(asset => asset.encodeWith).map(async asset => {
                const { oldSize, newSize, time } = await processAsset(asset.asset, asset.encodeWith as EncoderType, imagePool)
                
                if (newSize >= oldSize) {
                    notHandled ??= 0
                    notHandled++
                    return
                }

                const ratio = Math.round(100 * newSize / oldSize) - 100
                bytesSaved += (oldSize - newSize)

                logger.info(
                    asset.logPath +
                    ' ' +
                    chalk.green(`${ratio}%`) +
                    ' ' +
                    chalk.grey(`${(oldSize / 10**3).toFixed(2)}kb / ${(newSize / 10**3).toFixed(2)}kb`) +
                    ' ' +
                    chalk.magentaBright(`+${time - lastTime}ms`)
                )

                lastTime = time
            })

            await Promise.all(handles)
                
            imagePool.close()

            newAssetPaths.filter(asset => !asset.encodeWith).forEach(asset => {
                fs.mkdirSync(path.dirname(asset.asset.to), { recursive: true })
                fs.copyFileSync(asset.asset.from, asset.asset.to)
                logger.info(
                    asset.logPath +
                    ' ' +
                    chalk.grey(`Copied from ${path.relative(outputPath, asset.asset.from)}`)
                )
            })

            if (notHandled)
                logger.info(header + dim("Excluded", notHandled, `asset${notHandled == 1 ? '' : 's'} due to an unfavorable compression ratio.`))

            logger.info(header + chalk.cyanBright(`~${(bytesSaved / 10**6).toFixed(2)}mb reduced in `) + chalk.magentaBright(`${Date.now() - startTime}ms`))
        }
    }
}