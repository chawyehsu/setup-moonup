import * as core from '@actions/core'
import * as os from 'node:os'
import { chmod, rename, rm } from 'node:fs/promises'
import { credentialState } from './state'

async function cleanupMooncakesCredentials() {
  if (core.getState(credentialState.configured) !== 'true') {
    return
  }

  const credentialsPath = core.getState(credentialState.path)
  const backupPath = core.getState(credentialState.backupPath)
  const backupDirectory = core.getState(credentialState.backupDirectory)
  const originalMode = core.getState(credentialState.originalMode)

  if (credentialsPath === '') {
    throw new Error('Missing Mooncakes credentials path for post-step cleanup')
  }

  core.startGroup('Clean up Mooncakes credentials')
  let restored = false
  try {
    await rm(credentialsPath, { force: true })
    if (backupPath !== '') {
      await rename(backupPath, credentialsPath)
      if (os.platform() !== 'win32' && originalMode !== '') {
        await chmod(credentialsPath, Number.parseInt(originalMode, 8))
      }
      restored = true
      core.info('Restored pre-existing Mooncakes credentials')
    } else {
      core.info('Removed Mooncakes credentials')
    }
  } finally {
    if (backupDirectory !== '' && (backupPath === '' || restored)) {
      await rm(backupDirectory, { recursive: true, force: true })
    }
    core.endGroup()
  }
}

cleanupMooncakesCredentials()
