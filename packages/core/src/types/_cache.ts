import EncoderOptions, { EncoderType } from "./_encoders";

export type CacheLevel = "None" | "PerSession" | "Persistent"

export interface FromTo<T> { from: T, to: T}

export type AssetPath = FromTo<string>

export interface CacheItem {
    paths: AssetPath
    id: string
}

export default interface PluginCache {
    options?: EncoderOptions
    assets?: { [K in EncoderType]?: CacheItem[] }
}