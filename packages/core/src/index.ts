import { debug } from "./globals";
import { ModuleOptions } from "./types";
import { ResolvedConfig, Logger } from 'vite';
import { OutputOptions } from 'rollup';
import path from 'path';

export default function squooshPlugin(options: ModuleOptions = {}) {
    let outputPath: string
    let publicDir: string
    let config: ResolvedConfig
    let logger: Logger

    return {
        name: 'vite:squoosh',
        apply: 'build',
        enforce: 'post',

        configResolved(resolvedConfig) {
            config = resolvedConfig
            logger = config.logger
            publicDir = config.publicDir
            outputPath = path.resolve(config.root, config.build.outDir)

            debug('resolvedConfig:', resolvedConfig)
        },

        async generateBundle(_, bundler) {
            Object.keys(bundler).forEach(key => debug(key))
        },

        async closeBundle() {
            
        }

    }
}