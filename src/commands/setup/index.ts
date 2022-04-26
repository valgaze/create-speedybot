import {Flags, CliUx} from '@oclif/core'
import {CommonFlags, argvParser} from '../../util/common'
import Command from '../../base'
import inquirer from 'inquirer'
import {i18n} from '../../i18n'
import repos, {Repo, RepoHelper} from './../../util/repos/'
const earlyFlag = argvParser(process.argv) || ''

export default class Setup extends Command<typeof Command.flags> {
  static description = i18n(earlyFlag).t('cli.setup.description')
  static examples = [
    '$ npm init speedybot setup',
    '$ npm init speedybot setup -t aaa-bbb-ccc',
  ]

  static flags = {
    token: Flags.string({
      char: 't',
      description: String(i18n(earlyFlag).t('globals.flags.token.description')),
      required: false,
    }),
    repo: Flags.string({
      char: 'r',
      description: String(
        i18n(earlyFlag).t('cli.setup.flags.repo.description'),
      ),
    }),
    directory: Flags.string({
      char: 'd',
      description: String(
        i18n(earlyFlag).t('cli.setup.flags.directory.description'),
      ),
    }),
    ...CommonFlags,
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Setup)
    let token = flags.token ? flags.token : null

    if (!token) {
      token = await CliUx.ux.prompt(
        this.t('globals.prompts.token', {
          url: 'https://developer.webex.com/my-apps/new/bot',
        }),
        {
          required: false,
        },
      )
    }

    let {repo, directory} = flags

    // Handle repo choice
    if (!repo) {
      const transformedChoices = repos.map(({label, keyword}) => {
        return {
          name: label,
          value: keyword,
        }
      })
      const res = await inquirer.prompt([
        {
          type: 'list',
          name: 'repo',
          message: this.t('cli.setup.flags.repo.menu'),
          choices: transformedChoices,
        },
      ])
      repo = res.repo
    } else {
      const valid = Object.values(repos).map((repo) => repo.keyword)
      if (!valid.includes(repo)) {
        this.log("${valid.join(', ')}\n")
        this.error(this.t('cli.setup.flags.repo.error', {repo}))
      }
    }

    const Repo = repos.find(({keyword}) => keyword === repo) as Repo

    if (!directory) {
      directory = await CliUx.ux.prompt(
        this.t('cli.setup.flags.directory.followup', {dir: Repo.defaultDir}),
        {
          default: Repo.defaultDir,
        },
      )
    }

    const config = {
      url: Repo.url,
      targetDir: directory as string,
      token: token as string,
    }
    const inst = new RepoHelper(config)
    inst.runSteps(Repo.boot)
  }
}
