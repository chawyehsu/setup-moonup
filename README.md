# setup-moonup

> GitHub Action to set up [Moonup] and [MoonBit]

[![release][release-badge]][releases]
[![license][license-badge]](LICENSE)

## Usage

```yaml
# Typical usage
# by default, pinned version or the latest version of MoonBit will be installed
- uses: chawyehsu/setup-moonup@v0.1.0
- run: moon version --all

# or specify a version of MoonBit
- uses: chawyehsu/setup-moonup@v0.1.0
  with:
    moonbit-version: latest # optional
```

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
