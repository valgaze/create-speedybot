import {text} from '@clack/prompts'
import {Command, Flags} from '@oclif/core'
import {SpeedyBot, logoRoll} from 'speedybot'

import {botData, colorLogo} from '../../helpers'
export default class WebhookList extends Command {
  static description = 'List webhooks'
  static examples = [
    'npx -y speedybot@latest webhook list --token 2kD2rqamZqbmphaulqYrV5amVqu9WOq11Re6bWR9YiW5N9ybFkPnkaeRl5O7mRfIncSe6jaFNsKf6UJEoOZS6lnFJDOU25R3mrrq5uo',
    'npm init speedybot@latest webhook list',
    'npm init speedybot@latest webhook list -- --t 2kD2rqamZqbmphaulqYrV5amVqu9WOq11Re6bWR9YiW5N9ybFkPnkaeRl5O7mRfIncSe6jaFNsKf6UJEoOZS6lnFJDOU25R3mrrq5uo',
  ]

  static flags = {
    noLogo: Flags.boolean({
      char: 'n',
      default: false,
      description: `Don't show the SpeedyBot logo`,
    }),

    token: Flags.string({
      char: 't',
      description: `WebEx bot access token (if you don't have one, make a new one here: https://developer.webex.com/my-apps/new/bot`,
      // required: true,
    }),
  }

  public BotInst = new SpeedyBot()

  public async run(): Promise<void> {
    const {flags} = await this.parse(WebhookList)
    let token = flags.token || ''
    if (!flags.noLogo) {
      this.log(colorLogo(logoRoll()))
    }

    if (!token) {
      token = (await text({
        message: `Enter a WebEx bot access token (if you don't have one, make a new one here: https://developer.webex.com/my-apps/new/bot)`,
        placeholder: '2kD2rqamZqbmphaulqYrV...',
        validate(value) {
          if (value.length < 10) return `A real token is longer`
        },
      })) as string
    }

    try {
      const isValid = await this.BotInst.getSelf(token.trim()) // trim bc lots of people have newlines/spaces
      const {displayName, emails, id, type} = isValid
      const [email] = emails
      botData.name = displayName
      botData.email = email
      botData.id = id
      botData.type = type
    } catch {
      this.error(
        'Invalid WebEx token, double-check it or re-generate a token here: https://developer.webex.com/my-apps',
      )
      this.exit(1)
    }

    this.BotInst.setToken(token)

    const {items: webhooks} = await this.BotInst.getWebhooks()

    if (webhooks.length === 0) {
      this.log(`No Webhooks are registered with the bot ${botData.name} (${botData.email})`)
    } else {
      this.log(`The following webooks are registered for ${botData.name} (${botData.email})`)
      for (const webhook of webhooks) {
        const payload = {
          active: webhook.status === 'active',
          created: new Date(webhook.created).toLocaleString(),
          hasSecret: Boolean(webhook.secret),
          id: webhook.id,
          name: webhook.name,
          resource: webhook.resource,
          targetUrl: webhook.targetUrl,
        }
        console.table(payload) // Trick to avoid index on column, an array gets an ugly index column
      }
    }
  }
}
