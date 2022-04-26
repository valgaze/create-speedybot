import {Command} from '@oclif/core'
import {CommonFlags, ascii_art, argvParser, menuHandler} from './../util/common'
import {i18n} from './../i18n'

const earlyFlag = argvParser(process.argv) || ''

import inquirer from 'inquirer'

export default class Hello extends Command {
  async run(): Promise<void> {}

  async showHelp() {
    ascii_art()
    let action = ''
    if (!action) {
      const res = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: String(i18n(earlyFlag).t('cli.go.menu.description')),
          choices: i18n(earlyFlag).t('cli.go.menu.choices', {}, '', '', true),
        },
      ])
      action = res.action
    }

    menuHandler(action)
  }

  formatCommand() {}
}
