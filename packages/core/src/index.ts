import { debug, extensions } from "./globals";
import { AssetPath, ModuleOptions } from "./types";
import { ResolvedConfig, Logger, createLogger, Plugin } from 'vite';
import path from 'path';
import { isCorrectFormat, readFilesRecursive } from "./utilities";
import chalk from 'chalk';
import { ImagePool } from "@squoosh/lib";
import fs from 'fs';
import os from 'os';
import Encoders, { defaultEncoderOptions } from "./types/_encoders";
import { dim, header } from "./log";

const pushImageAssets = (files: string[], target: AssetPath[], transformers: { from?: (file: string) => string, to?: (file: string) => string}) =>
    files.filter(file => isCorrectFormat(file, extensions))
    .map(from => ({ from: transformers?.from?.call(transformers, from) ?? from, to: transformers?.to?.call(transformers, from) ?? from}))
    .forEach(({from, to}) => {
        debug(chalk.magentaBright(from), "->", chalk.blueBright(to))
        target.push({from, to})
    })

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
                    to: from => path.resolve(outputPath, path.relative(publicDir, from))
                })

            logger.info(header + dim('Processing', files.length, 'assets...'), { clear: true })

            const codecs: Encoders = {}

            if (options.codecs)
                Object.keys(defaultEncoderOptions).forEach(key => codecs[key] = { ...defaultEncoderOptions[key], ...(options.codecs ?? {})[key] })
            
            async function processAsset(asset: AssetPath, imagePool: any) {
                const start = Date.now()
                const oldSize = fs.lstatSync(asset.from).size
                let newSize = oldSize
                const image = imagePool.ingestImage(asset.from)

                // Decode image
                await image.decoded

                const ext = path.extname(asset.from) ?? ''

                for (let i = 0; i < Object.values(codecs).length; i++) {
                    const codec = Object.values(codecs)[i];
                    
                    if (codec.extension?.test(ext)) {
                        let newCodec = {}

                        newCodec[Object.keys(codecs)[i]] = codec

                        await image.encode(newCodec)

                        const encodedWith = (await (Object.values(image.encodedWith)[0] as Promise<any>))

                        debug("encoded with extension:", encodedWith.extension)

                        newSize = encodedWith.size

                        if (newSize < oldSize) {
                            fs.mkdirSync(path.dirname(asset.to), { recursive: true })
                            fs.writeFileSync(asset.to, encodedWith.binary)
                        }

                        break
                    }
                }

                return { oldSize, newSize, time: Date.now() - start }
            }

            const imagePool = new ImagePool(os.cpus().length)
            
            debug(dim("Running on", os.cpus().length, "cores."))
            debug(dim(files.length, "assets queued."))

            const newAssetPaths: {asset: AssetPath, logPath: string}[] = files.map(asset => ({
                asset: transformAssetPath(asset, path.normalize),
                logPath: path.normalize(path.join(chalk.dim(config.build.outDir), chalk.blue(path.relative(outputPath, asset.to))))
            }))

            const longestPathNameLength = newAssetPaths.sort((a, b) => b.logPath.length - a.logPath.length)[0].logPath.length

            newAssetPaths.forEach(asset => asset.logPath += ' '.repeat(longestPathNameLength - asset.logPath.length))

            let lastTime = 0
            let bytesSaved = 0
            let notHandled: number | undefined

            const handles = newAssetPaths.map(async (asset, i) => {
                    const { oldSize, newSize, time } = await processAsset(asset.asset, imagePool)
                    
                    if (newSize >= oldSize) {
                        notHandled ??= 0
                        notHandled++
                        return
                    }

                    const ratio = Math.round(100 * newSize / oldSize) - 100
                    const timeDifference = time - lastTime
                    bytesSaved += (oldSize - newSize)

                    logger.info(
                        asset.logPath +
                        ' ' +
                        chalk.green(`${ratio}%`) +
                        ' ' +
                        chalk.grey(`${(oldSize / 10**3).toFixed(2)}kb / ${(newSize / 10**3).toFixed(2)}kb`) +
                        ' ' +
                        chalk.magentaBright(`+${timeDifference}ms`)
                    )

                    lastTime = time
                })

            await Promise.all(handles)
                
            imagePool.close()

            if (notHandled)
                logger.info(header + dim("Excluded", notHandled, `asset${notHandled == 1 ? '' : 's'} due to an unfavorable compression ratio.`))

            logger.info(header + chalk.cyanBright(`~${(bytesSaved / 10**6).toFixed(2)}mb reduced`))
        }
    }
}