import Debug from 'debug';

export const debug: (...args: any[]) => void = Debug.debug('vite-plugin-squoosh')
export const extensions = /\.(png|jpeg|jpg|bmp|webp)$/i