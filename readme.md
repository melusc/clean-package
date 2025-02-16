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

See my [publish.yml](https://github.com/melusc/clean-package/blob/main/.github/workflows/publish.yml#L22) Github Actions workflow to see how I use this package.

## Options

### Sort

By default, the keys of the clean `package.json` will be sorted. Use `--no-sort` to disable this behaviour.

### Dry-run

Use `--dry-run` or `-n` to check how `package.json` will be modified. The cleaned `package.json` will be printed to stdout instead.

### Indent

By default, tabs are used for indentation. Use `--indent` to overwrite this.

## Prior Art

[clean-package](https://github.com/roydukkey/clean-package) by [roydukkey](https://github.com/roydukkey)
