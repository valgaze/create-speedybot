import {Flags, CliUx} from '@oclif/core'
import {
  CommonFlags,
  argvParser,
  ascii_art,
  menuHandler,
  noOpFunction,
} from './../../util/common'
import {Command} from '@oclif/core'
import {i18n} from './../../i18n'
import inquirer from 'inquirer'
const earlyFlag = argvParser(process.argv) || ''

export default class Go extends Command {
  public t: Function = noOpFunction

  async init(): Promise<void> {
    // do some initialization
    const output = await this.parse(this.ctor)
    const {flags} = output
    const {lang} = flags
    const inst = i18n(lang)
    this.t = inst.t.bind(inst) as Function
  }

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
