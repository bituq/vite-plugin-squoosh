import fs, { PathOrFileDescriptor, readFileSync } from "fs";
import path from "path";
import { defaultEncoderOptions, Encoder } from "./types/_encoders";
import { AssetPath } from "./types/_cache";
import { debug, extensions } from "./globals";
import chalk from "chalk";

/**
 * Transform a path.
 */
type TransformFunction = (path: string) => string

/**
 * Transform an AssetPath.
 */
export const transformAssetPath = (assetPath: AssetPath, transform: TransformFunction): AssetPath => ({
    from: transform(assetPath.from),
    to: transform(assetPath.to)
})

export const pushImageAssets = (filePaths: string[], target: AssetPath[], transformers: { from?: TransformFunction, to?: TransformFunction}, exclude?: RegExp) => 
    filePaths.filter(path => isCorrectFormat(path, extensions, exclude))
    .map(from => ({
        from: transformers?.from?.call(transformers, from) ?? from,
        to: transformers?.to?.call(transformers, from) ?? from
    }))
    .forEach(({from, to}) => {
        debug(chalk.magentaBright(from), '->', chalk.blueBright(to))
        target.push({from, to})
    })

export function readFilesRecursive(root: string, reg?: RegExp) {
    let resultArr: string[] = []
    try {
        // Check if the root path exists and is a directory.
        if (fs.existsSync(root) && fs.lstatSync(root).isDirectory())
            // Read all files in the root directory, and recursively read files in subdirectories.
            fs.readdirSync(root).forEach((file) => resultArr = resultArr.concat(readFilesRecursive(path.join(root, '/', file))))
        else
            // If the root path is a file, check if it matched the regex.
            if (reg === undefined || reg?.test(root))
                    resultArr.push(root)
    } catch (error) {
        console.log(error)
    }

    return resultArr
}

export function isCorrectFormat(fileName: string, include: RegExp, exclude?: RegExp) {
    if (!fileName || !include) return false
    return !exclude?.test(fileName) && (include.test(fileName) || Object.values(defaultEncoderOptions).some((encoder: Encoder) => encoder.extension?.test(fileName)))
}

export const forEachKey = <T extends {}>(object: T, callbackfn: (key: string, value: T, index: number) => any) =>
    Object.keys(object).forEach((key, index) => callbackfn(key, object[key], index))

export function getFileId(path: PathOrFileDescriptor): string {
    let id = ""
    const fileBytes = new Uint8Array(readFileSync(path).buffer.slice(-8));
    fileBytes.forEach(byte => id += byte)
    return id
}