import {writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import * as pc from 'picocolors' // node 14+
import {TextOptions, text} from '@clack/prompts'

export {getProject, projectList, runCommands} from './cloner'
export const botData: {email: string; id: string; name: string; type: string} = {email: '', id: '', name: '', type: ''}
export const getCurrentPath = (...paths: string[]) => resolve(process.cwd(), ...paths)
export function colorLogo(text: string): string {
  const colorList = [
    {selectedBgColor: 'bgCyan', selectedTextColor: 'blue'},
    {selectedBgColor: 'bgBlue', selectedTextColor: 'green'},
    {selectedBgColor: 'bgRed', selectedTextColor: 'yellow'},
    {selectedBgColor: 'bgBlue', selectedTextColor: 'green'},
    {selectedBgColor: 'bgGreen', selectedTextColor: 'blue'},
    {selectedBgColor: 'bgWhite', selectedTextColor: 'red'},
    {selectedBgColor: 'bgCyan', selectedTextColor: 'red'},
    {selectedBgColor: 'bgBlue', selectedTextColor: 'white'},
    {selectedBgColor: 'bgMagenta', selectedTextColor: 'cyan'},
  ]

  const getRandomElement = <T>(array: T[]): T => {
    const randomIndex = Math.floor(Math.random() * array.length)
    return array[randomIndex]
  }

  const {selectedBgColor, selectedTextColor} = getRandomElement(colorList)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (pc as any)[selectedBgColor]((pc as any)[selectedTextColor](text))
}

export async function writeEnvFile(
  envObject: {[key: string]: string},
  {append = false, targetPath = '.env'}: {append?: boolean; targetPath?: string} = {},
) {
  try {
    const envContents = Object.entries(envObject)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n')

    // Use 'a' flag if append is true, otherwise 'w' flag for write (default behavior)
    const flag = append ? 'a' : 'w'

    await writeFile(targetPath, envContents + '\n', {flag})
  } catch (error) {
    console.error('Error writing to .env:', error)
    // eslint-disable-next-line no-process-exit, unicorn/no-process-exit
    process.exit(1) // catastrophic issues
  }
}

export async function getBotToken() {
  return (await text({
    message: `Enter a WebEx bot access token (if you don't have one, make a new one here: https://developer.webex.com/my-apps/new/bot)`,
    placeholder: '2kD2rqamZqbmphaulqYrV...',
    validate(value) {
      if (value.length < 10) return `A real token is longer`
    },
  })) as string
}

export const envDesc: {[key: string]: TextOptions} = {
  VOICEFLOW_API_KEY: {
    message:
      'Enter your Voiceflow API key (instructions on how to find one for your project: https://developer.voiceflow.com/docs/step-1-get-api-key)',
    placeholder: 'Your API key...',
    validate(value: string) {
      if (value.length < 10) return 'A real API key is longer'
    },
  },
  // Add more key-value pairs as needed
}
