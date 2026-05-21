import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import * as tc from '@actions/tool-cache'
import * as os from 'node:os'
import path from 'node:path'

async function getLatestMoonup(): Promise<string> {
  core.startGroup('Determine the latest moonup version')
  const token = core.getInput('token')
  const octokit = github.getOctokit(token)

  try {
    const { data } = await octokit.rest.repos.getLatestRelease({
      owner: 'chawyehsu',
      repo: 'moonup',
    })

    const version = data.tag_name.replace(/^v/, '')
    if (!version) {
      throw new Error(`chawyehsu/setup-moonup: Could not parse version from ${data.tag_name}`)
    }

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

  let fileName: string
  switch (platform) {
    case 'darwin':
      fileName = `moonup-aarch64-apple-darwin.${ext}`
      break
    case 'linux':
      fileName = arch === 'arm64'
        ? `moonup-aarch64-unknown-linux-gnu.${ext}`
        : `moonup-x86_64-unknown-linux-gnu.${ext}`
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

function getPinnedMoonupVersion(): string | undefined {
  const pinnedVersion = core.getInput('version').trim()
  if (pinnedVersion === '') {
    return undefined
  }

  const normalizedVersion = pinnedVersion.replace(/^v/, '')
  if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(normalizedVersion)) {
    core.warning(
      `Pinned moonup version "${pinnedVersion}" does not look like semver, trying to use it as a release tag.`,
    )
  }

  return normalizedVersion
}

async function run() {
  // Setup moonup
  core.startGroup('Download and install moonup')
  try {
    const moonupHome = path.join(os.homedir(), '.moonup')
    const pinnedVersion = getPinnedMoonupVersion()
    let moonupVersion: string
    if (pinnedVersion) {
      moonupVersion = pinnedVersion
      core.info(`Using pinned moonup version ${moonupVersion}`)
    } else {
      moonupVersion = await getLatestMoonup()
      core.info(`Using latest moonup version ${moonupVersion}`)
    }

    // Check if moonup is cached
    let moonupBinPath = tc.find('moonup', moonupVersion)
    if (moonupBinPath !== '') {
      core.debug(`moonup ${moonupVersion} is already installed at ${moonupBinPath}`)
    } else {
      const moonupUrl = buildMoonupDownloadUrl(moonupVersion)
      core.info(`Downloading moonup from ${moonupUrl}`)

      let archive: string
      try {
        archive = await tc.downloadTool(moonupUrl)
      } catch (error: unknown) {
        if (pinnedVersion) {
          const message = error instanceof Error ? error.message : String(error)
          throw new Error(`Failed to download moonup version ${pinnedVersion}: ${message}`)
        }
        throw error
      }
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
