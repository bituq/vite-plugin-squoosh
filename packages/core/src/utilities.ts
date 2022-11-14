import fs from "fs";
import path from "path";

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