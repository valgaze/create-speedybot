import {locales} from './locales'
import axios from 'axios'

export const availableLanguages = Object.keys(locales)
import get from './../util/get'
const _ = {get}
export const pickRandom = (list: any[]) =>
  list[Math.floor(Math.random() * list.length)]
export function log(...payload: any[]) {
  console.log.apply(console, payload as [any?, ...any[]])
}

// Cheap'o version of i18n, yolo

export type Locale = {
  [key: string]: any
}
export type Config = {
  debug?: boolean
  locales: Locale
  defaultLanguage: string
}

class YoloTranslate {
  private fallback = 'en'
  private debug = false
  private locales
  private language: Locale

  constructor(public config: Config) {
    const {locales, debug} = config
    this.locales = locales
    this.debug = debug !== undefined ? debug : false
    this.language = this.locales[this.fallback]
    this.init(config)
  }

  public init(config: Config) {
    const {defaultLanguage} = config
    this.setLanguage(defaultLanguage)
  }

  public setLanguage(languageKey: string) {
    const lang = this.locales[languageKey]
    if (lang) {
      // set language
      this.language = lang
    } else {
      // use fallback
      this.language = this.locales[this.fallback]
    }
  }

  t<T = any>(
    input: string,
    template: object = {},
    languageOverride?: string,
    fallback?: string,
    returnRaw = false,
  ): string | string[] | T {
    if (languageOverride) {
      this.setLanguage(languageOverride)
    }

    const msg = _.get(this.language, input, null)
    if (!msg) {
      if (!fallback) {
        console.log(
          `🚨🚨 There was a problem with this translation look-up: '${input}'`,
        )
        return `${input}`
      }

      return fallback
    }

    if (returnRaw) {
      return msg
    }

    return this.fillTemplate(msg, template)
  }

  public setFallback(fallback: string) {
    this.fallback = fallback
  }

  public fillTemplate(
    utterances: string | string[],
    template: {[key: string]: any},
  ): string {
    let payload: string
    if (typeof utterances !== 'string') {
      payload = pickRandom(utterances) || ''
    } else {
      payload = utterances
    }

    const replacer = (
      utterance: string,
      target: string,
      replacement: string,
    ): string => {
      if (!utterance.includes(`$[${target}]`)) {
        return utterance
      }

      return replacer(
        utterance.replace(`$[${target}]`, replacement),
        target,
        replacement,
      )
    }

    for (const key in template) {
      const val = template[key]
      payload = replacer(payload, key, val)
    }

    return payload
  }

  private log(...payload: any[]) {
    if (this.debug) {
      console.log.apply(console, payload as [any?, ...any[]])
    }
  }
}

export const i18n = (defaultLanguage = 'en') => {
  const inst = new YoloTranslate({locales, defaultLanguage})
  return inst
}

export default i18n
