import { debug } from "./globals";
import { ModuleOptions } from "./types";
import { ResolvedConfig, Logger, createLogger, Plugin } from 'vite';
import path from 'path';
import { forEachKey, getFileId, pushImageAssets, readFilesRecursive, transformAssetPath } from "./utilities";
import chalk from 'chalk';
import { ImagePool } from "@squoosh/lib";
import fs from 'fs';
import os from 'os';
import { defaultEncoderOptions, EncoderAsset, EncoderType } from "./types/_encoders";
import { dim, header } from "./log";
import EncoderOptions from "./types/_encoders";
import PluginCache, { AssetPath, CacheItem } from "./types/_cache";

export default function squooshPlugin(options: ModuleOptions = {}): Plugin {
    let outputPath: string
    let publicDir: string
    let config: ResolvedConfig
    let logger: Logger
    let files: AssetPath[] = []

    options.cacheLevel ??= "None"
    options.cachePath ??= "./vite-plugin-squoosh-cache.json"

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
            }, options.exclude)
        },

        async closeBundle() {
            if (publicDir)
                // Filter out static images
                pushImageAssets(readFilesRecursive(publicDir), files, {
                    from: file => path.resolve(publicDir, file),
                    to: file => path.resolve(outputPath, path.relative(publicDir, file))
                }, options.exclude)
                
            // Filter out additional files
            if (options.includeDirs)
                for (const dir of options.includeDirs)
                    if (typeof dir === "string")
                        pushImageAssets(readFilesRecursive(dir), files, {}, options.exclude)
                    else
                        pushImageAssets(readFilesRecursive(dir.from), files, {
                            from: file => path.resolve(config.root, file),
                            to: file => path.resolve(dir.to, path.basename(file))
                        }, options.exclude)

            logger.info(header + dim('Processing', files.length, 'assets...'), { clear: true })

            const codecs: EncoderOptions = {}

            // Merge the default codecs with the selected codecs.
            if (options.codecs)
                forEachKey(defaultEncoderOptions, (key, value) => codecs[key] = {...value, ...(options.codecs ?? {})[key]})
            
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

            let cache: PluginCache = {options: codecs}

            if (options.cacheLevel === "Persistent" && options.cachePath)
                if (fs.existsSync(options.cachePath))
                    cache = JSON.parse(fs.readFileSync(options.cachePath, {encoding: "utf8"}))

            const reuse: {[K in EncoderType]?: boolean} = {}

            forEachKey(codecs, (key, codec) => reuse[key] = JSON.stringify(cache.options?.[key]) == JSON.stringify(codec))

            forEachKey(reuse, (key, codec) => {
                if (!codec && cache.assets)
                    cache.assets[key] = []
            })
            
            const relativePath = (p: string) => path.normalize(path.join(chalk.dim(config.build.outDir), chalk.blue(path.relative(outputPath, p))))

            const newAssetPaths: EncoderAsset[] = files.map(asset => ({
                asset: transformAssetPath(asset, path.normalize),
                logPath: relativePath(asset.to),
                encodeWith: options.encodeTo?.find(value => value.from.test(path.extname(asset.from)))?.to
            }))
            
            const longestPathNameLength = newAssetPaths.sort((a, b) => b.logPath.length - a.logPath.length)[0].logPath.length
            
            Object.keys(reuse).forEach(codec => debug(codec, '=>', reuse[codec]))

            newAssetPaths.forEach(asset => {
                const ext = path.extname(asset.asset.from)
                const encodeTo = options.encodeTo?.find(value => value.from.test(ext))?.to  
                
                asset.encodeWith = encodeTo ?? Object.keys(codecs).find(codec => codecs[codec].extension?.test(ext))
                asset.size = fs.lstatSync(asset.asset.from).size

                if (asset.encodeWith && options.cacheLevel != "None") {
                    cache.assets ??= {}
                    cache.assets[asset.encodeWith] ??= []
                    const id = getFileId(asset.asset.from)
                    const other: CacheItem | undefined = cache.assets[asset.encodeWith].find((other: CacheItem) => other.id === id && other.paths.from === asset.asset.from)

                    if (reuse[asset.encodeWith] && other && fs.lstatSync(other.paths.to).size < fs.lstatSync(asset.asset.from).size) {
                        if (fs.existsSync(other.paths.to)) {
                            asset.asset.from = other.paths.to
                            asset.encodeWith = undefined
                        }
                    } else
                        cache.assets[asset.encodeWith]?.push({id, paths: asset.asset})
                }

                asset.logPath += ' '.repeat(longestPathNameLength - asset.logPath.length)
            })

            let lastTime = 0
            let bytesSaved = 0
            let notHandled: number | undefined

            const handles = newAssetPaths.filter(asset => asset.encodeWith).map(async ({asset, encodeWith, logPath}) => {
                const { oldSize, newSize, time } = await processAsset(asset, encodeWith as EncoderType, imagePool)
                
                if (newSize >= oldSize) {
                    notHandled ??= 0
                    notHandled++
                    return
                }

                const ratio = Math.round(100 * newSize / oldSize) - 100
                bytesSaved += (oldSize - newSize)

                logger.info(
                    logPath +
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

            newAssetPaths.filter(asset => !asset.encodeWith).forEach(({asset, logPath, size}) => {
                if (asset.from === asset.to) return;

                fs.mkdirSync(path.dirname(asset.to), { recursive: true })
                fs.copyFileSync(asset.from, asset.to)
                logger.info(
                    logPath +
                    ' ' +
                    chalk.grey(`Copied from ${relativePath(asset.from)}`)
                )

                if (size)
                    bytesSaved += (size - fs.lstatSync(asset.to).size)
            })

            if (options.cacheLevel == "Persistent" && options.cachePath) {
                cache.options = codecs
                fs.mkdirSync(path.dirname(options.cachePath), {recursive: true})
                fs.writeFileSync(options.cachePath, JSON.stringify(cache))
            }

            if (notHandled)
                logger.info(header + dim("Excluded", notHandled, `asset${notHandled == 1 ? '' : 's'} due to an unfavorable compression ratio.`))

            logger.info(header + chalk.cyanBright(`~${(bytesSaved / 10**6).toFixed(2)}mb reduced in `) + chalk.magentaBright(`${Date.now() - startTime}ms`))
        }
    }
}