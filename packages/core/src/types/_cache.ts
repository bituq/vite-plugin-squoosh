import { EncoderType } from "./_encoders";

export interface AssetPath {
    from: string
    to: string
}

export default interface PluginCache {
    assets?: { [K in EncoderType]?: AssetPath[] }
}