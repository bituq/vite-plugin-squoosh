import chalk from 'chalk'

export const header = chalk.magentaBright('[vite-plugin-squoosh] ')

export const dim = (...args: any[]): string => {
    let result = ''
    args.forEach(arg => {
        if (typeof arg === 'number')
            result += arg
        else
            result += chalk.dim(arg)

        result += ' '
    })
    return result
}