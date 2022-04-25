import {Flags, CliUx} from '@oclif/core'
import {CommonFlags, argvParser} from './../../util/common'
import Command from '../../base'
import {i18n} from './../../i18n'
import {url} from '@oclif/core/lib/parser/flags'

const earlyFlag = argvParser(process.argv) || ''

export default class Web extends Command<typeof Command.flags> {
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
    let port = flags.port || 8005
    let urlPath = `https://codepen.io/valgaze/full/PoEpxpb`

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
    this.log(`Opening site available below (press any key to exit): 

${urlPath}`)
    CliUx.ux.open(urlPath)
    await CliUx.ux.anykey()
    this.exit(0)
  }
}
