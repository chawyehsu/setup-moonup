import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as hc from '@actions/http-client'
import * as tc from '@actions/tool-cache'
import * as os from 'node:os'
import path from 'node:path'
import * as semver from 'semver'

async function getLatestMoonup(): Promise<string> {
  core.startGroup('Determine the latest moonup version')
  const url = 'https://api.github.com/repos/chawyehsu/moonup/releases/latest'
  const client = new hc.HttpClient('chawyehsu/setup-moonup', [], {
    allowRetries: true,
    maxRetries: 3,
  })

  try {
    const response = await client.getJson<{ name: string }>(url)
    if (!response.result) {
      throw new Error(`chawyehsu/setup-moonup: Could not download latest release from ${url}`)
    }

    const tag = semver.clean(response.result.name)
    if (!tag) {
      throw new Error(`chawyehsu/setup-moonup: Could not parse version from ${response.result.name}`)
    }

    const version = tag.replace(/^v/, '')
    core.info(`Latest moonup version is ${version}`)
    return version
  } catch (error: unknown) {
    throw error
  } finally {
    core.endGroup()
  }
}

function buildMoonupDownloadUrl(version: string): string {
  const platform = os.platform()
  const arch = os.arch()
  const ext = platform === 'win32' ? 'zip' : 'tar.gz'

  let fileName = undefined
  switch (platform) {
    case 'darwin':
      fileName = `moonup-${ arch === 'arm64' ? 'aarch64' : 'x86_64' }-apple-darwin.${ext}`
      break
    case 'linux':
      fileName = `moonup-x86_64-unknown-linux-gnu.${ext}`
      break
    case 'win32':
      fileName = `moonup-x86_64-pc-windows-msvc.${ext}`
      break
    default:
      throw new Error(`chawyehsu/setup-moonup: The platform ${platform} is not supported`)
  }

  return `https://github.com/chawyehsu/moonup/releases/download/v${version}/${fileName}`
}

function getMoonBitVersion(): string | undefined {
  let version = core.getInput('moonbit-version')
  if (version === '') {
    version = 'latest'
  }
  return version
}

async function run() {
  // Setup moonup
  core.startGroup('Download and install moonup')
  try {
    const moonupHome = path.join(os.homedir(), '.moonup')
    const moonupVersion = await getLatestMoonup()

    // Check if moonup is cached
    let moonupBinPath = tc.find('moonup', moonupVersion)
    if (moonupBinPath !== '') {
      core.debug(`moonup ${moonupVersion} is already installed at ${moonupBinPath}`)
    } else {
      const moonupUrl = buildMoonupDownloadUrl(moonupVersion)
      core.info(`Downloading moonup from ${moonupUrl}`)

      const archive = await tc.downloadTool(moonupUrl)
      moonupBinPath = path.join(moonupHome, 'bin')

      os.platform() === 'win32'
      ? await tc.extractZip(archive, moonupBinPath)
      : await tc.extractTar(archive, moonupBinPath)

      await tc.cacheDir(moonupBinPath, 'moonup', moonupVersion)
    }

    core.debug(`moonup is installed to ${moonupHome}`)
    core.addPath(moonupBinPath)
  } catch (error: unknown) {
    throw error
  } finally {
    core.endGroup()
  }

  // Setup MoonBit
  core.startGroup('Download and install MoonBit')
  try {
    const moonbitVersion = getMoonBitVersion()
    const args = ['install']
    if (moonbitVersion) {
      args.push(moonbitVersion)
    }
    await exec.exec('moonup', args)

    const moonHome = path.join(os.homedir(), '.moon')
    const moonBinPath = path.join(moonHome, 'bin')
    core.debug(`MoonBit is installed to ${moonHome}`)
    core.addPath(moonBinPath)
  } catch (error: unknown) {
    throw error
  } finally {
    core.endGroup()
  }
}

run()
