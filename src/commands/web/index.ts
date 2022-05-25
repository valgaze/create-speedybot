import {Flags, CliUx, Command} from '@oclif/core'
import {
  CommonFlags,
  argvParser,
  ascii_art,
  noOpFunction,
} from './../../util/common'
import {i18n} from './../../i18n'

const earlyFlag = argvParser(process.argv) || ''

export default class Web extends Command {
  public t: Function = noOpFunction

  async init(): Promise<void> {
    // do some initialization
    const output = await this.parse(this.ctor)
    const {flags} = output
    const {lang} = flags
    const inst = i18n(lang)
    this.t = inst.t.bind(inst) as Function
  }

  static description = i18n(earlyFlag).t('cli.web.description')
  static examples = ['$ npm init speedybot web']

  static flags = {
    port: Flags.string({
      char: 'p',
      description: String(i18n(earlyFlag).t('cli.web.flags.port.description')),
    }),
    token: Flags.string({
      char: 't',
      description: String(i18n(earlyFlag).t('globals.flags.token.description')),
    }),
    skip: Flags.boolean({
      char: 's',
      description: String(i18n(earlyFlag).t('cli.web.flags.skip.description')),
    }),
    ...CommonFlags,
  }

  // ex. $ npm init speedybot Web delete (action = remove/list/register)

  async run(): Promise<void> {
    const {flags} = await this.parse(Web)
    let token = flags.token ? flags.token : null
    let urlPath = 'https://codepen.io/valgaze/full/PoEpxpb'

    if (!token) {
      token = await CliUx.ux.prompt(
        this.t('globals.prompts.token', {
          url: 'https://developer.webex.com/my-apps/new/bot',
        }),
        {required: false},
      )
    }

    if (token) {
      urlPath = `${urlPath}?access_id=${token}`
    }

    ascii_art()
    this.log(`${this.t('cli.web.lingerMessage')}: 

${urlPath}`)
    CliUx.ux.open(urlPath)
    await CliUx.ux.anykey()
    this.exit(0)
  }
}
