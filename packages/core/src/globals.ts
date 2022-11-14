import Debug from 'debug';

export const debug: (...args: string[]) => void = Debug.debug('vite-squoosh')
export const extensions = /\.(png|jpeg|jpg|bmp|webp)$/i