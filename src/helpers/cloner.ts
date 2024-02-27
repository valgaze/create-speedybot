/* eslint-disable unicorn/prefer-node-protocol */
import {ExecSyncOptions, execSync} from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
// eslint-disable-next-line unicorn/import-style
import * as path from 'path'

export const projectList = [
  'deno',
  'lambda',
  'llm-stream',
  'speedybot-starter',
  'standard-server',
  'worker',
  'voiceflow',
  'voiceflow-kb',
]

export type Color = 'blue' | 'cyan' | 'green' | 'magenta' | 'red' | 'white' | 'yellow'
export type BackgroundColor = 'bgBlue' | 'bgCyan' | 'bgGreen' | 'bgMagenta' | 'bgRed' | 'bgWhite' | 'bgYellow'

export function getRandomElement<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

// Configuration
// const repositoryURL = 'https://github.com/valgaze/speedybot'
// const example: EXAMPLES = 'default'
// const sourcePath = `examples/${example}`
// const targetDirName = 'BOOMER' // Defaults to the last segment of sourcePath
// Run the process
// getProject(repositoryURL, sourcePath, targetDirName)

const isWindows = process.platform === 'win32'

// TODO: tear out git (can't assume installed)
const cloneRepository = async (repositoryURL: string, tempDir: string) => {
  try {
    const stdioOptions: ExecSyncOptions = isWindows ? {stdio: 'ignore'} : {stdio: 'inherit'}
    execSync(`git clone --depth 1 ${repositoryURL} ${tempDir}`, stdioOptions)
  } catch {
    throw new Error('Error cloning repository')
  }
}

export const runCommands = async (commands: string[]) => {
  for (const command of commands) {
    try {
      const stdioOptions: ExecSyncOptions = isWindows ? {stdio: 'ignore'} : {stdio: 'inherit'}
      execSync(command, stdioOptions)
    } catch (error) {
      throw new Error(`Error running command: ${command} [${error}]`)
    }
  }
}

const copyProjectFolder = async (tempDir: string, sourcePath: string, targetDirName: string | null) => {
  const sourceFolderPath = path.join(tempDir, sourcePath)
  const destinationPath = path.join('./', targetDirName || path.basename(sourcePath))

  fs.mkdirSync(destinationPath, {recursive: true}) // Create the destination directory

  try {
    copyFolderRecursiveSync(sourceFolderPath, destinationPath)
  } catch (error) {
    throw new Error('Error copying project folder ' + error)
  }
}

const copyFolderRecursiveSync = (source: string, target: string) => {
  const files = fs.readdirSync(source)
  files.forEach((file) => {
    const sourceFile = path.join(source, file)
    const targetFile = path.join(target, file)

    if (fs.lstatSync(sourceFile).isDirectory()) {
      fs.mkdirSync(targetFile, {recursive: true}) // Create subdirectory
      copyFolderRecursiveSync(sourceFile, targetFile)
    } else {
      fs.copyFileSync(sourceFile, targetFile)
    }
  })
}

const cleanup = (tempDir: string) => {
  fs.rmdirSync(tempDir, {recursive: true})
}

export const getProject = async (repositoryURL: string, sourcePath: string, targetDirName: string | null = null) => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'project-')) // Create a temporary directory

  try {
    await cloneRepository(repositoryURL, tempDir)
    await copyProjectFolder(tempDir, sourcePath, targetDirName)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    cleanup(tempDir)
  }
}
