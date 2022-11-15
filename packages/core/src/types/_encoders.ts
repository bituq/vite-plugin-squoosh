interface SharedEncoderOptions {
    quality?: number
}

export interface Encoder {
    extension: RegExp
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
    trellis_loops?: number
    auto_subsample?: boolean
    chroma_subsample?: number
    separate_chroma_quality?: boolean
    chroma_quality?: number
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

export default interface Encoders {
    mozjpeg?: MozJPEGEncodeOptions
    webp?: WebPEncodeOptions
    avif?: AvifEncodeOptions
    jxl?: JxlEncodeOptions
    wp2?: WebP2EncodeOptions
    oxipng?: OxiPNGEncodeOptions
}

export const defaultEncoderOptions: Encoders = {
    mozjpeg: {
        extension: /.(jpg|jpeg)/,
        quality: 20,
    },
    webp: {
        extension: /.webp/
    },
    avif: {
        extension: /.avif/
    },
    jxl: {
        extension: /.jxl/
    },
    wp2: {
        extension: /.wp2/,
        quality: 30,
    },
    oxipng: {
        extension: /.png/,
    }
}