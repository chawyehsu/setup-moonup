# setup-moonup

> GitHub Action to set up [Moonup] and [MoonBit]

[![release][release-badge]][releases]
[![license][license-badge]](LICENSE)

## Usage

```yaml
# Typical usage
# by default, the latest moonup release is installed, then moonbit latest
- uses: chawyehsu/setup-moonup@v1
- run: moon version --all

# pin moonup version (accepts 1.2.3 or v1.2.3)
- uses: chawyehsu/setup-moonup@v1
  with:
    version: 0.5.0

# or specify a version of MoonBit
- uses: chawyehsu/setup-moonup@v1
  with:
    moonbit-version: latest # optional
  run: moonup -V
```

When `version` is omitted, the action resolves and installs the latest moonup release from GitHub.
To smoke test pinning, run a workflow with `with: { version: 0.5.0 }` and then execute `moonup -V`; the output should include `0.5.0`.

## Development

Prerequisites: Volta, Nodejs, Pnpm

```sh
git clone https://github.com/chawyehsu/setup-moonup
cd setup-moonup
pnpm dev
```

## License

**setup-moonup** © [Chawye Hsu](https://github.com/chawyehsu). Released under the [MIT](LICENSE) license.

> [Blog](https://chawyehsu.com) · GitHub [@chawyehsu](https://github.com/chawyehsu) · Twitter [@chawyehsu](https://twitter.com/chawyehsu)

[Moonup]: https://github.com/chawyehsu/moonup
[MoonBit]: https://www.moonbitlang.com/
[release-badge]: https://img.shields.io/github/v/release/chawyehsu/setup-moonup
[releases]: https://github.com/chawyehsu/setup-moonup/releases/latest
[license-badge]: https://img.shields.io/github/license/chawyehsu/setup-moonup
