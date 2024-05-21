/* eslint-disable unicorn/prefer-node-protocol */
import {ExecSyncOptions, execSync} from 'child_process'
import * as fs from 'fs'
import {createWriteStream} from 'fs'
import * as os from 'os'
// eslint-disable-next-line unicorn/import-style
import * as path from 'path'
import {SpeedyBot} from 'speedybot'
import {pipeline} from 'stream/promises'
import * as tar from 'tar'
import * as zlib from 'zlib'

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

const copyProjectFolder = async (tempDir: string, sourcePath: string, targetDirName: null | string) => {
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

/**
 * tar.gz alternative pipeline, much faster, user doesn't need git available
 *
 */

interface RepoConfig {
  branch: string
  name: string
  username: string
}
export async function downloadTarGz(config: RepoConfig, tempDir: string): Promise<string> {
  const url = `https://github.com/${config.username}/${config.name}/archive/refs/heads/${config.branch}.tar.gz`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download tarball from ${url} ${response.status} ${response.statusText}`)
  }

  const tarballPath = path.resolve(tempDir, `${config.name}-${config.branch}.tar.gz`)
  const fileStream = createWriteStream(tarballPath)

  // @ts-expect-error force pipeline source
  await pipeline(response.body, fileStream)

  return tarballPath
}

export async function extractTarGz(
  tarGzFilePath: string,
  tempDir: string,
  stripVFromDirectory = true,
): Promise<string> {
  try {
    const tarGzStream = fs.createReadStream(tarGzFilePath)
    const extractStream = tar.extract({cwd: tempDir})

    // tar.gz stream to zlib [decompress] to tar [extract]
    tarGzStream.pipe(zlib.createGunzip()).pipe(extractStream)

    // Await finish or error events
    await new Promise((resolve, reject) => {
      extractStream.on('finish', resolve)
      extractStream.on('error', reject)
    })

    const stripExtension = path.basename(tarGzFilePath) // 'speedybot-v2.tar.gz'
    const stripGz = path.parse(stripExtension).name // speedybot-v2.tar
    const stripTar = path.parse(stripGz).name // speedybot-v2
    const unpackedDirectory = stripVFromDirectory ? stripTar.replace('v', '') : stripTar // 'speedybot-v2' >> speedybot-2
    return path.resolve(tempDir, unpackedDirectory)
  } catch (error) {
    console.error('Extraction failed:', error)
    throw error // Caller can handle
  }
}

export async function cleanupPaths(paths: string[]): Promise<void> {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const deletePath = async (p: string) => {
    try {
      const stats = await fs.promises.stat(p)
      if (stats.isDirectory()) {
        await fs.promises.rm(p, {force: true, recursive: true})
        // console.log(`Deleted directory: ${p}`)
      } else if (stats.isFile()) {
        await fs.promises.unlink(p)
        // console.log(`Deleted file: ${p}`)
      } else {
        console.warn(`Unknown path type: ${p}`)
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        console.warn(`Path does not exist: ${p}`)
      } else {
        console.error(`Failed to delete path: ${p}`, error)
      }
    }
  }

  await Promise.all(paths.map(deletePath))
}

export async function getProjectTarGz(
  repoConfig: {branch: string; name: string; username: string},
  opts: {destination: string; projectName: string},
) {
  const TEMPORARY_DIRECTORY = fs.mkdtempSync(path.join(os.tmpdir(), 'speedybot-project-')) // Create a temporary directory
  try {
    // 1) download .tar.gz repo to os.tempDir (system temporary directory)
    const tarGzPath = await downloadTarGz(repoConfig, TEMPORARY_DIRECTORY)

    // 2) unpack tar.gz to temporary directory
    const REPO_CONTENTS_DIRECTORY = await extractTarGz(tarGzPath, TEMPORARY_DIRECTORY)

    // 3) Pluck + copy from unpacked directory
    const sourcePath = path.join('examples', opts.projectName) // which project to pluck
    await copyProjectFolder(REPO_CONTENTS_DIRECTORY, sourcePath, opts.destination)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    try {
      // 4) Tidy up temporary directory workspace
      await cleanupPaths([TEMPORARY_DIRECTORY])
    } catch (error) {
      console.error(`Error deleting "${TEMPORARY_DIRECTORY}"`, error)
    }
  }
}
