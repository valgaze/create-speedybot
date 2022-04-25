import {writeFileSync} from 'fs'
import path from 'path'
import {execSync} from 'child_process'
export const delay = (d = 5000) =>
  new Promise((resolve) => setTimeout(resolve, d))

export type ProjectConfig = {
  url: string // repo url
  targetDir: string // dir for project
  token?: string // credentials
  cjsonPath?: string // path to config.json (to store credentials other autoconfig)
}

export interface Repo {
  url: string
  label: string
  keyword: string
  defaultDir: string
  boot: string[]
}

export class RepoHelper {
  public cwd = process.cwd()
  private specials = ['<@write_token>', '<@if_token>', '<@remark>']
  constructor(private config: ProjectConfig) {
    if (!this.config.cjsonPath) {
      this.config.cjsonPath = path.resolve(
        this.config.targetDir,
        'settings',
        'config.json',
      )
    }
  }

  public writeCJSON(content: {token: string}): void {
    const pretty = `${JSON.stringify(content, null, 2)}\n`
    const writePath = path.resolve(this.config.cjsonPath as string)
    return writeFileSync(writePath, pretty, 'utf8')
  }

  public fillTemplate(utterance: string, template: any): string {
    let payload = utterance
    const replacer = (
      utterance: string,
      target: string,
      replacement: string,
    ): string => {
      if (!utterance.includes(`$[${target}]`)) {
        return utterance
      } else {
        return replacer(
          utterance.replace(`$[${target}]`, replacement),
          target,
          replacement,
        )
      }
    }
    for (let key in template) {
      const val = template[key]
      if (val) {
        payload = replacer(payload, key, val)
      }
    }
    return payload
  }

  public log(...payload: any[]): void {
    console.log.apply(console, payload as [any?, ...any[]])
  }

  private bad(...payload: any[]) {
    this.log('\n\n# ----------------PROBLEM!------------------- #\n\n')
    this.log(...payload)
    this.log('\n\n# ------------------------------------------- #\n\n')
  }

  public async runSteps(steps: string[]): Promise<void> {
    for (let i = 0; i < steps.length; i++) {
      const cmd = steps[i]
      if (i > 0) {
        this.cwd = this.config.targetDir as string
      }
      const isSpecial =
        this.specials.findIndex((test) => cmd.includes(test)) > -1
          ? true
          : false
      if (isSpecial) {
        await this._Special(cmd)
      } else {
        await this.run(cmd)
      }
    }
  }

  private async _Special(command: string) {
    if (command.includes('<@write_token>')) {
      if (this.config.token) {
        await this.writeCJSON({token: this.config.token})
        this.cwd = this.config.targetDir
      }
    }

    if (command.includes('<@remark>')) {
      const cmd = command.replace('<@remark>', '')
      this.log(cmd)
    }

    if (command.includes('<@if_token>')) {
      if (this.config.token) {
        const cmd = command.replace('<@if_token>', '')
        if (cmd.length) {
          await this.run(cmd)
        }
      }
    }
  }

  public run(command: string, prevOutput = '') {
    const config = {
      ...this.config,
      prevOutput,
      command,
    }
    const templatized = this.fillTemplate(command, config)
    return execSync(templatized, {
      cwd: this.cwd,
      stdio: 'inherit',
    })
  }
}

const repos: Repo[] = [
  {
    url: 'https://github.com/valgaze/speedybot-starter',
    label: '🚀 speedybot-starter (default)',
    defaultDir: 'speedybot-starter',
    keyword: 'starter',
    boot: [
      'git clone $[url] $[targetDir]',
      'npm i',
      '<@write_token>',
      '<@if_token>npm start',
    ],
  },
  {
    url: 'https://github.com/valgaze/speedybot-superpowers',
    label:
      '🌟 speedybot-superpowers (give your bot $uperpowers like processing *.xlsx)',
    defaultDir: 'speedybot-superpowers',
    keyword: 'superpowers',
    boot: [
      'git clone $[url] $[targetDir]',
      'npm i',
      '<@write_token>',
      '<@if_token>npm start',
    ],
  },
  {
    url: 'https://github.com/valgaze/speedybot-voiceflow',
    label:
      '🍦 speedybot-voiceflow (connect to an NLU service & order ice cream',
    defaultDir: 'speedybot-voiceflow',
    keyword: 'voiceflow',
    boot: [
      'git clone $[url] $[targetDir]',
      'npm i',
      '<@write_token>',
      '<@remark>Add token for Voiceflow/NLU https://github.com/valgaze/speedybot-voiceflow/blob/master/README.md#2-webex-token',
    ],
  },
  {
    url: 'https://github.com/valgaze/speedybot-serverless-experiment',
    label:
      '📡 speedybot-serverless (easy-to-deploy serverless lambda function [EXPERIMENTAL])',
    keyword: 'serverless',
    defaultDir: 'speedybot-serverless-experiment',
    boot: [
      'git clone $[url] $[targetDir]',
      'npm i',
      `npm run info || echo 'Install serverless, ex: $ npm i serverless'`,
      '<@remark>Install AWS tokens + serverless, quickstart here: https://github.com/valgaze/speedybot-serverless-experiment/blob/master/README.md',
    ],
  },
]

export default repos
