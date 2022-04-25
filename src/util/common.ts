import {SpeedybotMini} from 'speedybot-mini'
import {Flags} from '@oclif/core'
import {CliUx} from '@oclif/core'
import {availableLanguages} from '../i18n'
import {i18n} from './../i18n'
export * from './logger'

const earlyFlag = argvParser(process.argv) || ''

// Special "global" flag description
export const CommonFlags = {
  lang: Flags.string({
    options: availableLanguages,
    description: String(
      i18n(earlyFlag).t(
        'globals.flags.lang.description',
        {
          languages: availableLanguages,
        },
        earlyFlag,
        `Set the language, ex ${availableLanguages}`,
      ),
    ),
    char: 'l',
    // default: 'en',
  }),
}

export const client = (token: string) => new SpeedybotMini(token)

// HACK HACK HACK: need -l/-lang flags for static methods (ie before class initalizes)
// So jumping right into process.argv
export function argvParser(targets: string[]): string {
  let res = ''
  const variants = [
    '--lang', // on next
    '--lang=',
    '-l=',
    '-l', // on next
  ]

  let targetIndex = -1
  let variantIndex = -1
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    variants.forEach((variant, idx) => {
      if (target.includes(variant)) {
        targetIndex = i
        variantIndex = idx
      }
    })
  }

  if (targetIndex > -1) {
    const val = targets[targetIndex]
    const isLang = val.includes('--lang')
    if (isLang) {
      const useNext = !val.includes('=')
      if (useNext) {
        res = targets[targetIndex + 1]
      } else {
        const [, splitVal] = val.split('=')
        res = splitVal
      }
    } else if (val.includes('-l')) {
      const useNext = !val.includes('=')
      if (useNext) {
        res = targets[targetIndex + 1]
      } else {
        const [, splitVal] = val.split('=')
        res = splitVal
      }
    }
  }

  return res
}
