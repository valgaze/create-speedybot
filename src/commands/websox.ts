import {Args, Command, Flags} from '@oclif/core'
import {SpeedyBot, logoRoll} from 'speedybot'

import {botData, colorLogo, getBotToken} from './../helpers'
export default class Websox extends Command {
  static args = {
    reset: Args.string({description: 'reset websocket'}),
  }

  static description = 'Utilities for websocket connections'

  static flags = {
    debug: Flags.boolean({
      description: 'Show expanded logs',
    }),
    force: Flags.boolean({char: 'f'}),
    token: Flags.string({
      char: 't',
      description: `WebEx bot access token (if you don't have one, make a new one here: https://developer.webex.com/my-apps/new/bot`,
    }),
  }

  public BotInst = new SpeedyBot()

  public async resetDevices() {
    type Device = {
      services: unknown
      url: string
      webSocketUrl: string
    }

    try {
      const deviceListResponse = await fetch('https://wdm-a.wbx2.com/wdm/api/v1/devices', {
        headers: {
          Authorization: `Bearer ${this.BotInst.getToken()}`,
        },
      })

      if (!deviceListResponse.ok) {
        if (deviceListResponse.status === 401) {
          this.log(`Reset devices invalid token`)
          throw new Error(`Invalid token supplied to reset device`)
        }

        throw new Error('Request failure')
      }

      const {devices = []}: {devices: Device[]} = (await deviceListResponse.json()) as {devices: Device[]}

      for (const device of devices) {
        const {url} = device
        if (url) {
          // eslint-disable-next-line no-await-in-loop
          const deleteResponse = await fetch(url, {
            headers: {
              Authorization: `Bearer ${this.BotInst.getToken()}`,
            },
            method: 'DELETE',
          })

          if (!deleteResponse.ok) {
            throw new Error('Request failed')
          }
        }
      }

      return true
    } catch (error) {
      console.log('Error', error)
    }
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Websox)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const debug = (...payload: any[]): void => {
      if (flags.debug) {
        console.log(...payload)
      }
    }

    let token = flags.token || ''

    if (!token) {
      token = await getBotToken()
    }

    try {
      if (token) {
        const isValid = await this.BotInst.getSelf(token.trim()) // trim bc lots of people have newlines/spaces
        const {displayName, emails, id, type} = isValid
        const [email] = emails
        botData.name = displayName
        botData.email = email
        botData.id = id
        botData.type = type
      }
    } catch (e) {
      this.error(
        'Invalid WebEx token, double-check it or re-generate a token here: https://developer.webex.com/my-apps',
      )
      this.exit(1)
    }

    this.BotInst.setToken(token)
    if (!flags.noLogo) {
      this.log(colorLogo(logoRoll()))
    }

    if (args.reset) {
      try {
        await this.resetDevices()
        this.log('✅ Websockets reset')
      } catch (error) {
        this.log('❌ There was an error resetting devices')
        debug(error)
      }
    }
  }
}
