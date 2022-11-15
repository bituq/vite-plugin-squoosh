import Encoders from "./_encoders"

export interface AssetPath {
    from: string
    to: string
}

export interface ModuleOptions {
    /**
     * @see {@link https://github.com/GoogleChromeLabs/squoosh/blob/dev/libsquoosh/src/codecs.ts}
     */
    codecs?: Encoders
    /**
     * Enable/disable logging.
     * @default: false
     */
    silent?: boolean,
    /**
     * Enable/disable compression.
     * @default: false
     */
    disabled?: boolean
}