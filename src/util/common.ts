import {SpeedybotMini} from 'speedybot-mini'
import {Flags} from '@oclif/core'
import {CliUx} from '@oclif/core'
import {execSync, exec} from 'child_process'
import {availableLanguages} from '../i18n'
import {i18n} from './../i18n'
import {resolve} from 'path'
import {stat} from 'fs'
import {ascii_art} from './logger'
export * from './logger'

const fileExists = (filePath: string) => {
  return new Promise((resolve) => {
    stat(filePath, function (err, stat) {
      if (err == null) {
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

const earlyFlag = argvParser(process.argv) || ''

// Special "global" flag description
export const CommonFlags = {
  lang: Flags.string({
    options: availableLanguages,
    description: String(
      i18n(earlyFlag).t(
        'globals.flags.lang.description',
        {
          languages: availableLanguages,
        },
        earlyFlag,
        `Set the language, ex ${availableLanguages}`,
      ),
    ),
    char: 'l',
    // default: 'en',
  }),
}

export const client = (token: string) => new SpeedybotMini(token)

// HACK HACK HACK: need -l/-lang flags for static methods (ie before class initalizes)
// So jumping right into process.argv
export function argvParser(targets: string[]): string {
  let res = ''
  const variants = [
    '--lang', // on next
    '--lang=',
    '-l=',
    '-l', // on next
  ]

  let targetIndex = -1
  let variantIndex = -1
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    variants.forEach((variant, idx) => {
      if (target.includes(variant)) {
        targetIndex = i
        variantIndex = idx
      }
    })
  }

  if (targetIndex > -1) {
    const val = targets[targetIndex]
    const isLang = val.includes('--lang')
    if (isLang) {
      const useNext = !val.includes('=')
      if (useNext) {
        res = targets[targetIndex + 1]
      } else {
        const [, splitVal] = val.split('=')
        res = splitVal
      }
    } else if (val.includes('-l')) {
      const useNext = !val.includes('=')
      if (useNext) {
        res = targets[targetIndex + 1]
      } else {
        const [, splitVal] = val.split('=')
        res = splitVal
      }
    }
  }

  return res
}

const runSync = (cmd: string) =>
  execSync(cmd, {
    cwd: process.cwd(),
    stdio: 'inherit',
  })

export const menuHandler = async (action: string, flags: {port?: any} = {}) => {
  const oneOf = (choices: string[]) => choices.includes(action?.toLowerCase())
  if (action === 'setup') {
    runSync(`npm init speedybot setup`)
  }

  if (oneOf(['debug', 'info', 'bongo'])) {
    runSync(`npx envinfo`)
  }

  if (action === 'tunnel') {
    let portNum = flags.port
    if (!flags.port) {
      portNum = await CliUx.ux.prompt('Which port do you want to tunnel?')
    }
    runSync(`npx speedyhelper tunnel ${portNum}`)
  }

  if (oneOf(['web', 'ui'])) {
    runSync(`npm init speedybot web`)
  }

  if (action === 'token') {
    runSync(`npm init speedybot token`)
  }

  if (action === 'webhook:create') {
    runSync(`npm init speedybot webhook create`)
  }

  if (action === 'webhook:remove') {
    runSync(`npm init speedybot webhook remove`)
  }

  if (action === 'webhook:list') {
    runSync(`npm init speedybot webhook list`)
  }

  if (action === 'tellmemore') {
    CliUx.ux.open('https://www.npmjs.com/package/speedybot')
  }

  if (action === 'showhelp') {
    runSync('npm init speedybot help')
  }

  if (action === 'speedtest') {
    runSync('npx speed-test')
  }

  if (oneOf(['vtop', 'analyze', 'explore'])) {
    runSync('npx vtop')
  }

  if (oneOf(['check', 'serverless:info'])) {
    const res = await extractURL()
    if (res) {
      console.log(res)
    }
  }

  if (oneOf(['ascii'])) {
    ascii_art()
  }
}

// for serverless framework
export const extractURL = async (fileName = 'serverless.yml') => {
  // does serverless.yml exist in process.cwd()?
  const activeDir = process.cwd()
  const filePath = resolve(activeDir, fileName)
  const doesExist = await fileExists(filePath)
  let url = ''
  if (doesExist) {
    const getUrl = (): Promise<string> =>
      new Promise((resolve) => {
        exec(
          'npx serverless info',
          {cwd: process.cwd()},
          (error: any, stdout: any, stderr: any) => {
            if (stdout.includes('POST -')) {
              const [, url] = stdout
                ?.split('\n')
                .find((item: string) => item.includes('POST -'))
                .split('- ')
              resolve(url)
            } else {
              resolve('')
            }
          },
        )
      })
    url = await getUrl()
  } else {
    return ''
  }
  return url
}
