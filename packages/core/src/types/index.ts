import { CacheLevel, FromTo } from "./_cache"
import EncoderOptions, { EncoderType } from "./_encoders"

export interface ModuleOptions {
    /**
     * @see {@link https://github.com/GoogleChromeLabs/squoosh/blob/dev/libsquoosh/src/codecs.ts}
     */
    codecs?: EncoderOptions
    /**
     * Enable/disable logging.
     * @default: false
     */
    silent?: boolean
    /**
     * File names or extensions to exclude.
     * @example
     * // Exclude all webp and wp2 extensions.
     * { exclude: /.(webp|wp2)$/}
     */
    exclude?: RegExp
    /**
     * Specify what certain file names or extensions will encode to.
     */
    encodeTo?: { from: RegExp, to: EncoderType }[]
    /**
     * Additional directories to include. **WARNING!** These images will be replaced with their encoded versions.
     */
    includeDirs?: string[] | FromTo<string>[]
    /**
     * Toggle asset caching. When enabled, encoded assets will be reused.
     * @default: "None"
     */
    cacheLevel?: CacheLevel
    /**
     * The file path to store the cache to when the cache level is persistent.
     */
    cachePath?: string
    /**
     * The maximum numbers of CPU cores to use.
     * @default: All available CPU cores.
     */
    coreCount?: number
}