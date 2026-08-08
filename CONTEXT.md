# Setup Moonup

This context covers the GitHub Action that installs Moonup and MoonBit, including its temporary Mooncakes authentication configuration.

## Language

**Mooncakes credentials**:
The Mooncakes username and token stored in MoonBit's `credentials.json` file so MoonBit can authenticate with mooncakes.io.
_Avoid_: Mooncakes token, registry credentials

**Credential lifecycle**:
The action-owned period from configuring Mooncakes credentials through restoring or removing them in the post-step.
_Avoid_: credential cleanup, token handling

**Credential backup**:
A private temporary file containing the pre-existing Mooncakes credentials while the action's credentials are active.
_Avoid_: action-state credentials, saved token
