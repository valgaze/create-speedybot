import {Flags, CliUx, Command} from '@oclif/core'
import {CommonFlags, argvParser, noOp, noOpFunction} from './../../util/common'
import {WebhookClient, bad} from './../../util/common'
import {i18n} from './../../i18n'
import {ArgInput, OutputArgs} from '@oclif/core/lib/interfaces'

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

export default class Webhook extends Command {
  public t: Function = noOpFunction

  async init(): Promise<void> {
    // do some initialization
    const output = await this.parse(this.ctor)
    const {flags} = output
    const {lang} = flags
    const inst = i18n(lang)
    this.t = inst.t.bind(inst) as Function
  }

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
    secret: Flags.string({
      char: 's',
      description: String(
        i18n(earlyFlag).t('cli.webhook.flags.secret.description'),
      ),
    }),
    ...CommonFlags,
  }

  /**
   * Webhook secret parsing: bit of a nightmare
   // https://developer.webex.com/blog/using-a-webhook-secret
   // https://github.com/WebexSamples/webex-node-bot-framework/blob/39324f3f23face40c80bcec9ab589677f0bf431a/lib/webhook.js#L43-L52
   ```ts

    /**
     * signature: xxxaaabbbcccdef
     * secret: mysecret
     * requestBody: {id: 'Y2aaabbbcc', name:'blabhblah', data: { roomId: 'aaa', personId: 'bb' }
     * *
    const crypto = require('crypto');
    const validate = (signature, requestBody, secret) => {
      const hmac = crypto.createHmac('sha1', secret);
      if (typeof requestBody === 'string') {
        hmac.update(requestBody);
      } else {
        hmac.update(JSON.stringify(requestBody));
      }

      const isValid = hmac.digest('hex') == signature;
      return isValid;
    }
  ```https://speedybot-hub.valgaze.workers.dev/beer
  **/
  // ex. $ npm init speedybot webhook delete (action = remove/list/register)
  static args = [{name: 'action'}]

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Webhook)
    let webhookUrl = flags.webhookUrl
    let token = flags.token ? flags.token : null
    const secret = flags.secret ? flags.secret : undefined

    if (!token) {
      token = await CliUx.ux.prompt(
        this.t('globals.prompts.token', {
          url: 'https://developer.webex.com/my-apps/new/bot',
        }),
        {required: true},
      )
    }

    const inst = WebhookClient(token as string)
    if (args.action === 'list') {
      const list = await inst.getWebhooks()
      if (list && list.data.items.length > 0) {
        this.log(`\n\n## ${this.t('cli.webhook.currentWebhooks')} ## \n\n`)
        this.log(JSON.stringify(list.data.items, null, 2))
      } else {
        this.log(this.t('cli.webhook.nowebhooks'))
      }
    }

    if (args.action === 'remove' || args.action === 'delete') {
      if (!webhookUrl) {
        if (!flags.forceDelete) {
          const proceed = await CliUx.ux.confirm(this.t('cli.webhook.warning'))
          if (proceed) {
            const list = await inst.getWebhooks()
            // eslint-disable-next-line max-depth
            if (list) {
              await inst.killAllWebhooks(list.data.items)
              this.log(this.t('cli.webhook.deletesuccess'))
            } else {
              this.log(this.t('cli.webhook.nowebhooks'))
            }
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
          .Setup(webhookUrl, secret)
          .then((_) => {
            this.log(this.t('cli.webhook.success'))
          })
          .catch((error) => {
            if (error.response?.status === 409) {
              bad(
                this.t('cli.webhook.errors.existingwebhook', {url: webhookUrl}),
              )
            } else {
              bad(this.t('globals.errors.invalid_token'))
            }
          })
      }
    }
  }
}
