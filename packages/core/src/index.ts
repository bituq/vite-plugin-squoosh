import { debug, extensions } from "./globals";
import { AssetPath, ModuleOptions } from "./types";
import { ResolvedConfig, Logger } from 'vite';
import path from 'path';
import { isCorrectFormat, readFilesRecursive } from "./utilities";
import chalk from 'chalk';
import { ImagePool } from "@squoosh/lib";
import fs from 'fs';
import os from 'os';
import { defaultEncoderOptions } from "./types/_encoders";

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

export default function squooshPlugin(options: ModuleOptions = {}) {
    let outputPath: string
    let publicDir: string
    let config: ResolvedConfig
    let logger: Logger
    let files: AssetPath[] = []

    return {
        name: 'vite:squoosh',
        apply: 'build',
        enforce: 'post',

        configResolved(resolvedConfig: any) {
            config = resolvedConfig
            logger = config.logger
            publicDir = config.publicDir
            outputPath = path.resolve(config.root, config.build.outDir)

            debug('resolvedConfig:', resolvedConfig)
        },

        async generateBundle(_: any, bundler: any) {
            // Filter out images
            pushImageAssets(Object.keys(bundler), files, {
                from: file => path.resolve(outputPath, file),
                to: file => path.resolve(outputPath, file)
            })

            if (!publicDir) return

            // Filter out static images
            pushImageAssets(readFilesRecursive(publicDir), files, {
                from: file => path.resolve(publicDir, file),
                to: from => path.resolve(outputPath, path.relative(publicDir, from))
            })
        },

        async closeBundle() {
            
            async function processAsset(asset: AssetPath, imagePool: any) {
                const start = Date.now()
                const oldSize = fs.lstatSync(asset.from).size
                let newSize = oldSize
                const image = imagePool.ingestImage(asset.from)

                // Decode image
                await image.decoded

                const codecs = {...defaultEncoderOptions, ...(options.codecs ?? {})}
                const ext = path.extname(asset.from) ?? ''

                for (let i = 0; i < Object.values(codecs).length; i++) {
                    const codec = Object.values(codecs)[i];
                    
                    if (codec.extension.test(ext)) {
                        let newCodec = {}

                        newCodec[Object.keys(codecs)[i]] = codec

                        await image.encode(newCodec)

                        const encodedWith = (await (Object.values(image.encodedWith)[0] as Promise<any>))

                        newSize = encodedWith.size

                        fs.mkdirSync(path.dirname(asset.to), { recursive: true })
                        fs.writeFileSync(asset.to, encodedWith.binary)

                        break
                    }
                }

                return { oldSize, newSize, time: Date.now() - start }
            }

            const imagePool = new ImagePool(os.cpus().length)
            
            debug(chalk.dim("Running on"), os.cpus().length, chalk.dim("cores."))
            debug(files.length, "assets queued.")

            const newAssetPaths: {asset: AssetPath, logPath: string}[] = files.map(asset => ({
                asset: transformAssetPath(asset, path.normalize),
                logPath: path.normalize(path.join(chalk.dim(config.build.outDir), chalk.blue(path.relative(outputPath, asset.to))))
            }))

            const longestPathNameLength = newAssetPaths.sort((a, b) => b.logPath.length - a.logPath.length)[0].logPath.length

            newAssetPaths.forEach(asset => asset.logPath += ' '.repeat(longestPathNameLength - asset.logPath.length))

            let lastTime = 0

            const handles = newAssetPaths.map(async (asset, i) => {
                    const { oldSize, newSize, time } = await processAsset(asset.asset, imagePool)
                    const ratio = Math.round(100 * newSize / oldSize) - 100
                    const timeDifference = time - lastTime
                    
                    logger.info(
                        asset.logPath +
                        ' ' +
                        (ratio >= 0 ? chalk.redBright(`+${ratio}%`) : chalk.green(`${ratio}%`)) +
                        ' ' +
                        chalk.grey(`${(oldSize / 10**3).toFixed(2)}kb / ${(newSize / 10**3).toFixed(2)}kb`) +
                        ' ' +
                        chalk.magentaBright(`+${timeDifference}ms`)
                    )

                    lastTime = time
                })

            await Promise.all(handles)
                
            imagePool.close()
            
        }

    }
}