import fs from "fs";
import path from "path";
import { defaultEncoderOptions, Encoder } from "./types/_encoders";

export function readFilesRecursive(root: string, reg?: RegExp) {
    let resultArr: string[] = []
    try {
        if (fs.existsSync(root))
            if (fs.lstatSync(root).isDirectory())
                fs.readdirSync(root)
                    .forEach((file) => resultArr = resultArr.concat(readFilesRecursive(path.join(root, '/', file))))
            else
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