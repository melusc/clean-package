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

### Package

By default, the `package.json` in the current directory is modified. Pass a different directory to `--package` or `-p` if the `package.json` isn't found in the current directory.

If the file to be modified isn't called `package.json` pass the path to the file to `--package` and it will just as well.

## Library

`@lusc/clean-package` can be used as a library too. Simply import it as so:

```typescript
import {cleanPackage} from '@lusc/clean-package';
```

### Typing

```typescript
function cleanPackage(options: {
	// Path to package.json or the directory containing it
	// required
	packageJson: string | URL;

	// Keys to remove from package.json
	// e.g. `keys: [['devDependencies'], ['scripts']]`
	// Supports nested keys, e.g. [['scripts', 'test']] -> delete packageJson.scripts.test
	// required
	keys: string[][];

	// Indentation to use. Same usage as with `JSON.stringify`
	// default `\t`
	indent?: string | number;

	// Sort keys (sorts deeply)
	// default true
	sort?: boolean;

	// Don't write result to file
	// default false
	dryRun?: boolean;

	// Why a string? Ensure that the returned result is identical
	// to the written result, namely the sorting and indentation
}): Promise<string>;
```

## Prior Art

[clean-package](https://github.com/roydukkey/clean-package) by [roydukkey](https://github.com/roydukkey)
