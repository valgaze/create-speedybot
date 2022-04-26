import {Flags, CliUx} from '@oclif/core'
import {CommonFlags, argvParser} from './../../util/common'
import {client, good, bad} from './../../util/common'
import Command from '../../base'
import {i18n} from './../../i18n'

/**
 *
 * Dealing with webhooks (CRUD) is a bit of a nightmare
 *
 * Below are some useful convenience functions
 **/
export interface WebhookConfig {
  name: string
  targetUrl: string
  resource?: string // 'all',
  event?: string // 'all',
  secret?: string
}

const earlyFlag = argvParser(process.argv) || ''

export default class Webhook extends Command<typeof Command.flags> {
  static description = i18n(earlyFlag).t('cli.webhook.description')
  static examples = [
    '$ npm init speedybot webhoook',
    '$ npm init speedybot webhoook list',
    '$ npm init speedybot webhoook create',
    '$ npm init speedybot webhook get',
    '$ npm init speedybot webhook destroy',
    '$ npm init speedybot webhoook list -t aaa-bbb-ccc',
    '$ npm init speedybot webhoook create -t aaa-bbb-ccc -w https://aaabbbcccdddeee.execute-api.us-east-1.amazonaws.com',
    '$ npm init speedybot webhoook destroy -t aaa-bbb-ccc -w https://aaabbbcccdddeee.execute-api.us-east-1.amazonaws.com',
  ]

  static flags = {
    token: Flags.string({
      char: 't',
      description: String(
        i18n(earlyFlag).t('cli.webhook.flags.token.description'),
      ),
    }),
    webhookUrl: Flags.string({
      char: 'w',
      description: String(
        i18n(earlyFlag).t('cli.webhook.flags.webhookUrl.description'),
      ),
    }),
    forceDelete: Flags.boolean({
      char: 'f',
      description: String(
        i18n(earlyFlag).t('cli.webhook.flags.forceDelete.description'),
      ),
    }),
    ...CommonFlags,
  }

  // ex. $ npm init speedybot webhook delete (action = remove/list/register)
  static args = [{name: 'action'}]

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Webhook)
    const {file} = args
    let webhookUrl = flags.webhookUrl
    let token = flags.token ? flags.token : null

    if (!token) {
      token = await CliUx.ux.prompt(
        this.t('globals.prompts.token', {
          url: 'https://developer.webex.com/my-apps/new/bot',
        }),
        {required: true},
      )
    }
    const inst = client(token as string)
    if (args.action === 'list') {
      const list = await inst.getWebhooks()
      this.log(`\n\n## ${this.t('cli.webhook.currentWebhooks')} ## \n\n`)
      if (list.data.items.length) {
        this.log(JSON.stringify(list.data.items, null, 2))
      } else {
        this.log('this.cli.webhook.nowebhooks')
      }
    }
    if (args.action === 'remove') {
      if (!webhookUrl) {
        if (!flags.forceDelete) {
          const proceed = await CliUx.ux.confirm(this.t('cli.webhook.warning'))
          if (proceed) {
            const list = await inst.getWebhooks()
            await inst.killAllWebhooks(list.data.items)
            this.log(this.t('cli.webhook.deletesuccess'))
          } else {
            this.log(this.t('cli.webhook.exiting'))
          }
        } else {
          const list = await inst.getWebhooks()
          await inst.killAllWebhooks(list.data.items)
          this.log(this.t('cli.webhook.deletesuccess'))
        }
      } else {
        await inst.killWebhooksByUrl(webhookUrl)
        this.log(this.t('cli.webhook.deleteacknowledge'))
      }
    }

    if (args.action === 'create') {
      if (!webhookUrl) {
        const ans = await CliUx.ux.prompt(
          this.t('cli.webhook.flags.webhookUrl.prompt'),
        )
        webhookUrl = ans as string
      }
      if (webhookUrl) {
        await inst
          .Setup(webhookUrl)
          .then((_) => {
            this.log(this.t('cli.webhook.success'))
          })
          .catch((e) => {
            if (e.response?.status === 409) {
              bad(
                this.t('cli.webhook.errors.existingwebhook', {url: webhookUrl}),
              )
            } else {
              bad(e.response)
            }
          })
      }
    }
  }
}
