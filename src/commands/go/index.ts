import {Flags, CliUx} from '@oclif/core'
import {
  CommonFlags,
  argvParser,
  ascii_art,
  menuHandler,
} from './../../util/common'
import Command from '../../base'
import {i18n} from './../../i18n'
import inquirer from 'inquirer'
const earlyFlag = argvParser(process.argv) || ''

export default class Go extends Command<typeof Command.flags> {
  static description = i18n(earlyFlag).t('cli.go.description')
  static examples = ['$ npm init speedybot go']

  static flags = {
    port: Flags.string({
      char: 'p',
      description: String(i18n(earlyFlag).t('globals.flags.port.description')),
    }),

    ...CommonFlags,
  }

  static args = [{name: 'shortcut_action'}]

  async run(): Promise<void> {
    const {flags, args} = await this.parse(Go)
    ascii_art()
    let action = args.shortcut_action
    if (!action) {
      const res = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: this.t('cli.go.menu.description'),
          choices: this.t('cli.go.menu.choices', {}, '', '', true),
        },
      ])
      action = res.action
    }

    menuHandler(action)
  }
}
