/* eslint-disable no-await-in-loop */
/* eslint-disable complexity */
import {select, text} from '@clack/prompts'
import {Command, Flags} from '@oclif/core'
import {SpeedyBot, botTokenKey, logoRoll} from 'speedybot'

import {
  botData,
  colorLogo,
  envDesc,
  getBotToken,
  getCurrentPath,
  getProject,
  getProjectTarGz,
  projectList,
  runCommands,
  writeEnvFile,
} from './../helpers'

export default class Setup extends Command {
  static description = 'Download, scaffold, setup, and even boot SpeedyBot projects locally'
  static examples = [
    'npx -y speedybot@latest setup --help',
    'npx -y speedybot@^2.0.0 setup --project default --boot --install',
    `npx -y speedybot@^2.0.0 setup --project voiceflow-kb -e BOT_TOKEN -e VOICEFLOW_API_KEY --install --boot`,
  ]

  static flags = {
    boot: Flags.boolean({
      char: 'b',
      dependsOn: ['install'],
      description: 'Run the boot command',
    }),
    bun: Flags.boolean({
      dependsOn: ['install'],
      description: 'Use bun to install dependencies',
    }),
    debug: Flags.boolean({
      description: 'Show expanded logs',
    }),
    directory: Flags.string({
      char: 'd',
      description: 'Target directory where project will live (based on where command was run)',
    }),
    env: Flags.string({
      char: 'e',
      description: 'Variables to write to .env (will be prompted + mandatory if set)',
      multiple: true,
    }),
    git: Flags.boolean({
      aliases: ['use-git'],
      char: 'g',
      description: 'Fallback to  force cloning repository (requires git installed and available in shell)',
    }),
    install: Flags.boolean({
      aliases: ['installDeps'],
      char: 'i',
      description: 'Attempt to install dependencies (npm i)',
    }),
    noLogo: Flags.boolean({
      char: 'n',
      default: false,
      description: `Don't show the SpeedyBot logo`,
    }),
    project: Flags.string({
      char: 'p',
      description: `Project name ex, ${projectList.join(', ')}`,
    }),
    token: Flags.string({
      char: 't',
      description: `WebEx bot access token (if you don't have one, make a new one here: https://developer.webex.com/my-apps/new/bot`,
    }),
  }

  public BotInst = new SpeedyBot()

  public async run(): Promise<void> {
    const {flags} = await this.parse(Setup)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const debug = (...payload: any[]): void => {
      if (flags.debug) {
        console.log(...payload)
      }
    }

    if (!flags.noLogo) {
      this.log(colorLogo(logoRoll()))
    }

    let envs = flags.env || []
    let token = flags.token || ''

    // Special handling for bot token
    const isDefaultProject = flags.project === 'default'
    const hasBotTokenKey = envs.includes(botTokenKey)

    if ((!token && isDefaultProject) || (hasBotTokenKey && !token) || (flags.boot && !token)) {
      token = await getBotToken()
      if (hasBotTokenKey) {
        envs = envs.filter((i) => i !== botTokenKey)
      }
    }

    debug('[Flags]:', flags)

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
      console.log(`[BETA DEBUG]`, e)
      console.log(`[BETA DEBUG]`, {token})

      this.error(
        'Invalid WebEx token, double-check it or re-generate a token here: https://developer.webex.com/my-apps',
      )
      this.exit(1)
    }

    this.BotInst.setToken(token)

    if (!flags.project || !['default', ...projectList].includes(flags.project)) {
      this.log(`More examples available at https://speedybot.js.org/examples`)
      flags.project = (await select({
        message: 'Pick a project type.',
        options: [
          {hint: `If you're new, start here`, label: '🐣 Run a bot locally', value: 'speedybot-starter'},
          {hint: 'Serverless', label: '🦖 Deploy to Deno', value: 'deno'},
          {hint: 'Serverless', label: 'λ Deploy to AWS Lambda', value: 'lambda'},
          {hint: 'Can be serverless, example runs locally', label: '📲 LLM streaming responses', value: 'llm-stream'},
          {hint: `You'll need to deploy this to use`, label: '🌐 Express Server', value: 'standard-server'},
          {hint: 'Serverless', label: '🔥 Worker', value: 'worker'},
          {hint: 'LLM system', label: '📂 RAG with Voiceflow (file upload)', value: 'voiceflow-kb'},
          {hint: 'NLU+LLM system', label: '🗣 Connect to Voiceflow', value: 'worker'},
          {hint: 'Ask for location', label: '🌎 Location Prompt', value: 'location'},
        ],
      })) as string
    }

    const project = isDefaultProject ? 'speedybot-starter' : flags.project
    const projectPayload = {
      boot: flags.boot || isDefaultProject, // will attempt to launch w/ run-script
      envs, // will each be prompted and written to env
      installDeps: flags.project === 'default' || flags.install, // run install
      project, // project name
      repositoryURL: 'https://github.com/valgaze/speedybot',
      targetDirectory: flags.directory ?? project, // default to project name
      useBun: flags.bun ?? false,
    }
    debug('[Project Config]', projectPayload)
    try {
      if (flags.git) {
        await getProject(
          projectPayload.repositoryURL,
          `examples/${projectPayload.project}`,
          projectPayload.targetDirectory,
        )
      } else {
        const repoConfig = {
          branch: 'v2',
          name: 'speedybot',
          username: 'valgaze',
        }

        await getProjectTarGz(repoConfig, {
          destination: projectPayload.targetDirectory,
          projectName: projectPayload.project,
        })
      }

      // Special handling w/ token to .env
      if (token) {
        await writeEnvFile({[botTokenKey]: token}, {targetPath: getCurrentPath(projectPayload.targetDirectory, '.env')})
      }

      // prompt + write any other .env's
      for (const env of envs) {
        let label = {message: `Enter a value for ${env}`}
        if (envDesc[env]) {
          label = envDesc[env]
        }

        const tmpEnv = (await text(label)) as string
        await writeEnvFile({[env]: tmpEnv}, {append: true, targetPath: getCurrentPath(projectPayload.project, '.env')})
      }

      if (flags.install) {
        await runCommands([
          `cd ${projectPayload.targetDirectory} && ${projectPayload.useBun ? 'bun install' : 'npm i'}`,
        ])
      }

      this.log(`
📂 Your project is available here: ${getCurrentPath(projectPayload.targetDirectory)}
  `)
      if (flags.boot && token) {
        const isWindows = process.platform === 'win32'
        if (isWindows && flags.bun) {
          this.log(`
It appears you are running Windows/PC, press CTRL-C if the script does not continue in a few seconds

Enter the following commands by hand to boot your SpeedyBot:

cd ${getCurrentPath(projectPayload.targetDirectory)}
bun run dev
          `)
        }

        await runCommands([
          `cd ${getCurrentPath(projectPayload.targetDirectory)} && ${
            projectPayload.useBun ? 'bun util/launch.ts' : 'npm run bot:dev'
          }`,
        ])
      } else {
        this.log(`    
🤖 See the README to get up and running: ${getCurrentPath(getCurrentPath(projectPayload.targetDirectory), 'README.md')}
        `)
      }
    } catch (error) {
      console.log(`❌[ERROR] There was an error setting up this project`)
      console.log(error)
      this.error(`See https://speedybot.js.org/examples/${projectPayload.project} for manual instructions`)
      this.exit(1)
    }
  }
}
