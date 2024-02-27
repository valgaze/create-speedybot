import {cancel, confirm, text} from '@clack/prompts'
import {Command, Flags} from '@oclif/core'
import {SpeedyBot, logoRoll} from 'speedybot'

import {botData, colorLogo} from '../../helpers'

export default class WebhookRemove extends Command {
  static description = 'Remove some or all webhooks associated with your bot'
  static examples = [
    'npx -y speedybot webook remove --help',
    'npx -y speedybot webhook remove --all',
    'npx -y speedybot webhook remove -t 2kD2rqamZqbmphaulqYrV5amVqu9WOq11Re6bWR9YiW5N9ybFkPnkaeRl5O7mRfIncSe6jaFNsKf6UJEoOZS6lnFJDOU25R3mrrq5uo -w https://abcd123456.execute-api.us-east-1.amazonaws.com/speedybot',
  ]

  static flags = {
    all: Flags.boolean({
      char: 'a',
      default: false,
      description: `Destroy all webhooks, don't ask for confirmation just doo it 👹`,
    }),
    noLogo: Flags.boolean({
      char: 'n',
      default: false,
      description: `Don't show the SpeedyBot logo`,
    }),
    token: Flags.string({
      char: 't',
      description: `WebEx bot access token (if you don't have one, make a new one here: https://developer.webex.com/my-apps/new/bot`,
    }),
    webhookUrl: Flags.string({
      char: 'w',
      description: `The publicly accessible URL webhook`,
    }),
  }

  public BotInst = new SpeedyBot()

  public async run(): Promise<void> {
    const {flags} = await this.parse(WebhookRemove)
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

    if (!flags.webhookUrl && !flags.all) {
      const shouldContinue = await confirm({
        initialValue: false,
        message: `You didn't supply a target webhook or specify an "all" flag, do you want to just destroy all webhooks? (selecting no will exit)`,
      })
      if (shouldContinue) {
        flags.all = true
      } else {
        cancel(`Exiting...`)
        this.exit(1)
      }
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
    const hitlist: string[] = []

    const webhooks = await this.BotInst.fetchWebhooks()
    if (webhooks.length === 0) {
      this.log(`No Webhooks are registered with the bot ${botData.name} (${botData.email})`)
    } else {
      for (const webhook of webhooks) {
        let shouldKill = flags.all || false
        if (!shouldKill) {
          shouldKill = webhook.targetUrl === flags.webhookUrl
        }

        if (shouldKill) {
          // eslint-disable-next-line no-await-in-loop
          await this.BotInst.deleteWebhook(webhook.id)
          if (!hitlist.includes(webhook.targetUrl)) {
            hitlist.push(webhook.targetUrl)
          }
        }
      }

      if (hitlist.length > 0) {
        this.log(
          `${hitlist.length === 0 ? `This webhook was` : `These webhooks were`} destroyed: ${hitlist.join(', ')}`,
        )
      } else if (webhooks.length > 0) {
        this.log('No webhooks removed')
      }
    }
  }
}
