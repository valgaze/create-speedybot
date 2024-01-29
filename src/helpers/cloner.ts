/* eslint-disable unicorn/prefer-node-protocol */
import {ExecSyncOptions, execSync} from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
// eslint-disable-next-line unicorn/import-style
import * as path from 'path'
import * as pc from 'picocolors'
import {logoRoll} from 'speedybot'

type EXAMPLES = 'default' | 'deno' | 'lamba' | 'llm'

export const exampleArray: EXAMPLES[] = ['default', 'deno', 'lamba', 'llm']

export type Color = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white'
export type BackgroundColor = 'bgRed' | 'bgGreen' | 'bgYellow' | 'bgBlue' | 'bgMagenta' | 'bgCyan' | 'bgWhite'

export function getRandomElement<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}

// Configuration
const repositoryURL = 'https://github.com/valgaze/speedybot'
const example: EXAMPLES = 'speedybot-starter'
const sourcePath = `examples/${example}`
const targetDirName = 'BOOMER' // Defaults to the last segment of sourcePath

const isWindows = process.platform === 'win32'

const cloneRepository = async (repositoryURL: string, tempDir: string) => {
  try {
    const stdioOptions: ExecSyncOptions = isWindows ? {stdio: 'ignore'} : {stdio: 'inherit'}
    execSync(`git clone ${repositoryURL} ${tempDir}`, stdioOptions)
  } catch (error) {
    throw new Error('Error cloning repository')
  }
}

const copyProjectFolder = async (tempDir: string, sourcePath: string, targetDirName: string | null) => {
  const sourceFolderPath = path.join(tempDir, sourcePath)
  const destinationPath = path.join('./', targetDirName || path.basename(sourcePath))

  fs.mkdirSync(destinationPath, {recursive: true}) // Create the destination directory

  try {
    copyFolderRecursiveSync(sourceFolderPath, destinationPath)
  } catch (error) {
    throw new Error('Error copying project folder')
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

const getFolder = async (repositoryURL: string, sourcePath: string, targetDirName: string | null = null) => {
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

// Run the process
getFolder(repositoryURL, sourcePath, targetDirName)
