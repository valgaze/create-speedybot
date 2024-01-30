import {text} from '@clack/prompts'
import {Command, Flags} from '@oclif/core'
import {SpeedyBot, logoRoll} from 'speedybot'

import {botData, colorLogo} from './../helpers'

export default class Token extends Command {
  static description = 'Reveal information about a supplied token'
  static examples = [
    'npm init speedybot token',
    'npm init speedybot token -t 2kD2rqamZqbmphaulqYrV5amVqu9WOq11Re6bWR9YiW5N9ybFkPnkaeRl5O7mRfIncSe6jaFNsKf6UJEoOZS6lnFJDOU25R3mrrq5uo',
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
    }),
  }

  public BotInst = new SpeedyBot()

  public async run(): Promise<void> {
    const {flags} = await this.parse(Token)
    let token = flags.token || ''

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

    if (!flags.noLogo) {
      this.log(colorLogo(logoRoll()))
    }

    console.log(`Here is the data associated with that token`)
    console.table(botData)
  }
}
