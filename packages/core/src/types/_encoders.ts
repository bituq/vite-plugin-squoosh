interface SharedEncoderOptions {
    quality?: number
}

interface ProgressiveEncoderOptions {
    progressive?: boolean
}

interface EffortEncoderOptions {
    effort?: number
}

export interface MozJPEGEncodeOptions extends SharedEncoderOptions, ProgressiveEncoderOptions {
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

export interface WebPEncodeOptions extends SharedEncoderOptions {
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

export interface AvifEncodeOptions {
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

export interface JxlEncodeOptions extends SharedEncoderOptions, ProgressiveEncoderOptions, EffortEncoderOptions {
    epf?: number
    lossyPalette?: boolean
    decodingSpeedTier?: number
    photonNoiseIso?: number
    lossyModular?: boolean
}

export interface WebP2EncodeOptions extends SharedEncoderOptions, EffortEncoderOptions {
    alpha_quality?: number
    pass?: number
    sns?: number
    uv_mode?: number
    csp_type?: number
    error_diffusion?: number
    use_random_matrix?: boolean
}

export interface OxiPNGEncodeOptions {
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