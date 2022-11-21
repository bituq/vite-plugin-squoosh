import { AssetPath } from "./_cache"

interface SharedEncoderOptions {
    quality?: number
}

export interface Encoder {
    extension?: RegExp
}

interface ProgressiveEncoderOptions {
    progressive?: boolean
}

interface EffortEncoderOptions {
    effort?: number
}

export interface MozJPEGEncodeOptions extends SharedEncoderOptions, ProgressiveEncoderOptions, Encoder {
    baseline?: boolean
    arithmetic?: boolean
    optimize_coding?: boolean
    smoothing?: number
    color_space?: number
    trellis_multipass?: boolean
    trellis_opt_zero?: boolean
    trellis_opt_table?: boolean,
    trellis_loops?: number
    auto_subsample?: boolean
    chroma_subsample?: number
    separate_chroma_quality?: boolean
    chroma_quality?: number
    quant_table?: number
}

export interface WebPEncodeOptions extends SharedEncoderOptions, Encoder {
    target_size?: number
    target_PSNR?: number
    method?: number
    sns_strength?: number
    filter_strength?: number
    filter_sharpness?: number
    filter_type?: number
    partitions?: number
    segments?: number
    pass?: number
    show_compressed?: number
    preprocessing?: number
    autofilter?: number
    partition_limit?: number
    alpha_compression?: number
    alpha_filtering?: number
    alpha_quality?: number
    lossless?: number
    exact?: number
    image_hint?: number
    emulate_jpeg_size?: number
    thread_level?: number
    low_memory?: number
    near_lossless?: number
    use_delta_palette?: number
    use_sharp_yuv?: number
}

export interface AvifEncodeOptions extends Encoder {
    cqLevel?: number
    cqAlphaLevel?: number
    denoiseLevel?: number
    tileColsLog2?: number
    tileRowsLog2?: number
    speed?: number
    subsample?: number
    chromaDeltaQ?: boolean
    sharpness?: number
    tune?: number
}

export interface JxlEncodeOptions extends SharedEncoderOptions, ProgressiveEncoderOptions, EffortEncoderOptions, Encoder {
    epf?: number
    lossyPalette?: boolean
    decodingSpeedTier?: number
    photonNoiseIso?: number
    lossyModular?: boolean
}

export interface WebP2EncodeOptions extends SharedEncoderOptions, EffortEncoderOptions, Encoder {
    alpha_quality?: number
    pass?: number
    sns?: number
    uv_mode?: number
    csp_type?: number
    error_diffusion?: number
    use_random_matrix?: boolean
}

export interface OxiPNGEncodeOptions extends Encoder {
    level?: number
}

export default interface EncoderOptions {
    mozjpeg?: MozJPEGEncodeOptions
    webp?: WebPEncodeOptions
    avif?: AvifEncodeOptions
    jxl?: JxlEncodeOptions
    wp2?: WebP2EncodeOptions
    oxipng?: OxiPNGEncodeOptions
}

export type EncoderType = "mozjpeg" | "webp" | "avif" | "jxl" | "wp2" | "oxipng"

export interface EncoderAsset {asset: AssetPath, logPath: string, encodeWith?: string | EncoderType, size?: number}

export const defaultEncoderOptions: EncoderOptions = {
    mozjpeg: {
        extension: /.(jpg|jpeg)$/,
        quality: 75,
        baseline: false,
        arithmetic: false,
        progressive: true,
        optimize_coding: true,
        smoothing: 0,
        color_space: 3 /*YCbCr*/,
        quant_table: 3,
        trellis_multipass: false,
        trellis_opt_zero: false,
        trellis_opt_table: false,
        trellis_loops: 1,
        auto_subsample: true,
        chroma_subsample: 2,
        separate_chroma_quality: false,
        chroma_quality: 75,
    },
    webp: {
        extension: /.webp$/,
        quality: 75,
        target_size: 0,
        target_PSNR: 0,
        method: 4,
        sns_strength: 50,
        filter_strength: 60,
        filter_sharpness: 0,
        filter_type: 1,
        partitions: 0,
        segments: 4,
        pass: 1,
        show_compressed: 0,
        preprocessing: 0,
        autofilter: 0,
        partition_limit: 0,
        alpha_compression: 1,
        alpha_filtering: 1,
        alpha_quality: 100,
        lossless: 0,
        exact: 0,
        image_hint: 0,
        emulate_jpeg_size: 0,
        thread_level: 0,
        low_memory: 0,
        near_lossless: 100,
        use_delta_palette: 0,
        use_sharp_yuv: 0,
    },
    avif: {
        extension: /.avif$/,
        cqLevel: 33,
        cqAlphaLevel: -1,
        denoiseLevel: 0,
        tileColsLog2: 0,
        tileRowsLog2: 0,
        speed: 6,
        subsample: 1,
        chromaDeltaQ: false,
        sharpness: 0,
        tune: 0 /* AVIFTune.auto */,
    },
    jxl: {
        extension: /.jxl$/,
        effort: 1,
        quality: 75,
        progressive: false,
        epf: -1,
        lossyPalette: false,
        decodingSpeedTier: 0,
        photonNoiseIso: 0,
        lossyModular: false,
    },
    wp2: {
        extension: /.wp2$/,
        quality: 75,
        alpha_quality: 75,
        effort: 5,
        pass: 1,
        sns: 50,
        uv_mode: 0 /*UVMode.UVModeAuto*/,
        csp_type: 0 /*Csp.kYCoCg*/,
        error_diffusion: 0,
        use_random_matrix: false,
    },
    oxipng: {
        extension: /.png$/,
        level: 2,
    }
}