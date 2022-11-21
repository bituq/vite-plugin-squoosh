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
    includeDirs?: string[] | { from: string, to: string }[]
    /**
     * Toggle asset caching. When enabled, encoded assets will be reused.
     * @default: false
     */
    useCache?: boolean
}