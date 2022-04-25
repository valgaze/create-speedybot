// "base class" approach
// https://github.com/oclif/oclif/issues/577#issuecomment-1037019969
// https://github.com/oclif/oclif/issues/225#issuecomment-490555119
// https://oclif.io/docs/base_class

import {Command, Flags} from '@oclif/core'
import {FlagInput, OutputFlags, ParserOutput} from '@oclif/core/lib/interfaces'
import {i18n, availableLanguages} from './i18n/'
import {CommonFlags} from './util/common'
export type InferredFlagsType<T> = T extends FlagInput<infer F>
  ? F & {
      json: boolean | undefined
    }
  : any

type noOp = (
  input: string,
  template?: object,
  languageOverride?: string,
) => string
export default abstract class BaseCommand<
  T extends typeof BaseCommand.flags,
> extends Command {
  public t: Function | noOp = (
    input: string,
    template?: object,
    languageOverride?: string,
  ): string => ''

  static flags = {
    ...CommonFlags,
  }

  protected parsedOutput?: ParserOutput<any, any>

  get processedArgs(): {[name: string]: any} {
    return this.parsedOutput?.args ?? {}
  }

  get processedFlags(): InferredFlagsType<T> {
    return this.parsedOutput?.flags ?? {}
  }

  private get baseFlags() {
    return this.processedFlags as Partial<OutputFlags<typeof BaseCommand.flags>>
  }

  async init() {
    // do some initialization
    this.parsedOutput = await this.parse(this.ctor)
    const {flags} = this.parsedOutput
    const {lang} = flags
    const inst = i18n(lang)
    this.t = inst.t.bind(inst) as Function
  }
}
