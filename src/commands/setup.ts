import {select, text} from '@clack/prompts'
import {Command, Flags} from '@oclif/core'
import {SpeedyBot, botTokenKey, logoRoll} from 'speedybot'

import {botData, colorLogo, getCurrentPath, getProject, projectList, runCommands, writeEnvFile} from './../helpers'

export default class Setup extends Command {
  static description = 'Reveal information about a supplied token'
  static examples = [
    'npm init speedybot setup',
    'npm init speedybot setup -p default -t 2kD2rqamZqbmphaulqYrV5amVqu9WOq11Re6bWR9YiW5N9ybFkPnkaeRl5O7mRfIncSe6jaFNsKf6UJEoOZS6lnFJDOU25R3mrrq5uo',
  ]

  static flags = {
    directory: Flags.string({
      char: 'd',
      description: 'Target directory where project will live (based on current directory)',
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
    if (!flags.noLogo) {
      this.log(colorLogo(logoRoll()))
    }

    let token = flags.token || ''

    if (!token && flags.project === 'default') {
      token = (await text({
        message: `Enter a WebEx bot access token (if you don't have one, make a new one here: https://developer.webex.com/my-apps/new/bot`,
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

    if (!flags.project || !['default', ...projectList].includes(flags.project)) {
      this.log(`More examples available at https://speedybot.js.org/examples`)
      flags.project = (await select({
        message: 'Pick a project type.',
        options: [
          {hint: 'Serverless', label: '🦖 Deploy to Deno', value: 'deno'},
          {hint: 'Serverless', label: 'λ Deploy to AWS Lambda', value: 'lambda'},
          {hint: 'Can be serverless, example runs locally', label: '📲 LLM streaming responses', value: 'llm-stream'},
          {label: '🐣 Run a bot locally', value: 'speedybot-starter'},
          {hint: `You'll need to deploy this to use`, label: '🌐 Express Server', value: 'standard-server'},
          {hint: 'Serverless', label: '🔥 Worker', value: 'worker'},
        ],
      })) as string
    }

    const project = flags.project === 'default' ? 'speedybot-starter' : flags.project
    const projectPayload = {
      installDeps: flags.project === 'default',
      project,
      repositoryURL: 'https://github.com/valgaze/speedybot',
      targetDirectory: flags.directory ?? project,
    }
    try {
      await getProject(
        projectPayload.repositoryURL,
        `examples/${projectPayload.project}`,
        projectPayload.targetDirectory,
      )

      if (flags.project === 'default' || projectPayload.installDeps) {
        await writeEnvFile({[botTokenKey]: token}, {targetPath: getCurrentPath(projectPayload.project, '.env')})
        await runCommands([`cd ${projectPayload.targetDirectory} && npm i`])
        if (flags.project === 'default') {
          await runCommands([`cd ${projectPayload.targetDirectory} && npm run bot:dev`])
        }
      }
    } catch (error) {
      this.log('There was an error setting up this project')
      console.log(error)
      this.error(`See https://speedybot.js.org/examples/${projectPayload.project} for manual instructions`)
    }

    this.log(`Your project is available here: ${getCurrentPath(projectPayload.targetDirectory)}
    
Read the README to get up and running: ${getCurrentPath(getCurrentPath(projectPayload.targetDirectory), 'README.md')}
`)
  }
}
