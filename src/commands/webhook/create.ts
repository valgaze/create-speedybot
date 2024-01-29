import {text} from '@clack/prompts'
import {Command, Flags} from '@oclif/core'
import {SpeedyBot, logoRoll} from 'speedybot'

import {colorLogo} from '../../helpers'
export default class WebhookCreate extends Command {
  static description = 'Create a new webhook for your bot'
  static examples = [
    'npm init speedybot create webhook',
    'npm init speedybot create webhook -t 2kD2rqamZqbmphaulqYrV5amVqu9WOq11Re6bWR9YiW5N9ybFkPnkaeRl5O7mRfIncSe6jaFNsKf6UJEoOZS6lnFJDOU25R3mrrq5uo -w https://abcd123456.execute-api.us-east-1.amazonaws.com/speedybot',
    'npm init speedybot create webhook -t 2kD2rqamZqbmphaulqYrV5amVqu9WOq11Re6bWR9YiW5N9ybFkPnkaeRl5O7mRfIncSe6jaFNsKf6UJEoOZS6lnFJDOU25R3mrrq5uo -w https://abcd123456.execute-api.us-east-1.amazonaws.com/speedybot -s my_webhook_secret ',
  ]

  static flags = {
    noLogo: Flags.boolean({
      char: 'n',
      default: false,
      description: `Don't show the SpeedyBot logo`,
    }),
    secret: Flags.string({
      char: 's',
      description: `A 'secret' to secure your webhook, more info here:  https://speedybot.js.org/webhooks#securing-webhooks
      `,
    }),
    token: Flags.string({
      char: 't',
      description: `WebEx bot access token (if you don't have one, make a new one here: https://developer.webex.com/my-apps/new/bot`,
      // required: true,
    }),
    webhookUrl: Flags.string({
      char: 'w',
      description: `The publicly accessible URL where your bot's webhook events will be delivered`,
    }),
  }

  public BotInst = new SpeedyBot()

  public async run(): Promise<void> {
    const {flags} = await this.parse(WebhookCreate)
    if (!flags.noLogo) {
      this.log(colorLogo(logoRoll()))
    }

    let token = flags.token || ''
    let webhookUrl = flags.webhookUrl || ''
    if (!token) {
      token = (await text({
        message: `Enter a WebEx bot access token (if you don't have one, make a new one here: https://developer.webex.com/my-apps/new/bot`,
        placeholder: '2kD2rqamZqbmphaulqYrV...',
        validate(value) {
          if (value.length < 10) return `A real token is longer`
        },
      })) as string
    }

    const tokenOK = await this.BotInst.validateToken(token)
    if (!tokenOK) {
      this.error(
        'Invalid WebEx token, double-check it or re-generate a token here: https://developer.webex.com/my-apps',
      )
      this.exit(1)
    }

    this.BotInst.setToken(token)

    if (!webhookUrl) {
      webhookUrl = (await text({
        message: `The publicly accessible URL where your bot's webhook events will be delivered`,
        placeholder: 'https://abcd123456.execute-api.us-east-1.amazonaws.com/speedybot',
      })) as string
    }

    // eslint-disable-next-line new-cap
    await this.BotInst.Setup(webhookUrl, flags.secret)

    this.log(`Webhook created! ${webhookUrl}`)
  }
}
