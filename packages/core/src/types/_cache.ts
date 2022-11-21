import EncoderOptions, { EncoderType } from "./_encoders";

export type CacheLevel = "None" | "PerSession" | "Persistent"

export interface AssetPath {
    from: string
    to: string
}

export default interface PluginCache {
    options?: EncoderOptions
    assets?: { [K in EncoderType]?: AssetPath[] }
}