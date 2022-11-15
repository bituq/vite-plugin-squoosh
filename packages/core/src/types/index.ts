import Encoders from "./_encoders"

export interface Image {
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
     * @default: true
     */
    log?: boolean,
    /**
     * Enable/disable compression.
     */
    enabled?: boolean
}