import {Flags, CliUx} from '@oclif/core'
import {client, bad, CommonFlags, argvParser} from './../../util/common'
import Command from '../../base'
import {i18n} from './../../i18n'

/**
 *
 * Checks if token valid
 *
 */

const earlyFlag = argvParser(process.argv) || ''
export default class Token extends Command<typeof Command.flags> {
  static description = i18n(earlyFlag).t('cli.token.description')

  static examples = [
    '$ npm init speedybot token',
    '$ npm init speedybot token aaa-bbb-cccf-ddd-eee',
    '$ npm init speedybot token --token=aaa-bbb-cccf-ddd-eee',
    '$ npm init speedybot token -t=aaa-bbb-cccf-ddd-eee',
  ]

  static args = [{name: 'token'}]
  static flags = {
    token: Flags.string({
      char: 't',
      description: String(
        i18n(earlyFlag).t('globals.flags.token.description', {
          url: 'https://developer.webex.com/my-apps/new/bot',
        }),
      ),
    }),
    ...CommonFlags,
  }

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Token)
    let token = flags.token ? flags.token : args.token
    if (!token) {
      token = await CliUx.ux.prompt(
        this.t('cli.token.prompt', {
          url: 'https://developer.webex.com/my-apps/new/bot',
        }),
        {required: true},
      )
    }

    try {
      const res = await client(token).getSelf()
      const {data} = res
      const {displayName, emails, created, type} = data

      if (type !== 'bot') {
        return this.log(this.t('cli.token.not_bot'))
      }

      this.log(this.t('cli.token.success'))

      const transformData = [
        {
          displayName,
          emails,
          created,
        },
      ]
      CliUx.ux.table(transformData, {
        displayName: {},
        created: {},
        emails: {
          minWidth: 10,
        },
      })
      console.log(JSON.stringify(res.data, null, 2))
    } catch (error: any) {
      const {response} = error
      bad(response.status === 401 ? this.t('cli.token.errors.invalid') : 'm')
    }
  }
}
