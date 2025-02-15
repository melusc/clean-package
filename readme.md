# clean-package

Clean `package.json` for publishing. Remove properties that don't need to be in the published package.json, e.g. `devDependencies` or `prettier`.

This tool is intentionally minimal. Use git to restore the original `package.json`.

## Installation

```bash
yarn add -D @lusc/clean-package
```

## Usage

```bash
cd path/to/repo
# package.json is in current directory
clean-package devDependencies scripts.build
# supports nested removal     ^^^^^^^^^^^^^

# Publish
npm publish
[...]

# After publish, if necessary
git checkout HEAD -- package.json
```

## Prior Art

[clean-package](https://github.com/roydukkey/clean-package) by [roydukkey](https://github.com/roydukkey)
