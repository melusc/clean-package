import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {cwd} from 'node:process';

import stableStringify from 'json-stable-stringify';

import {options, positionals} from './cli.ts';

const pathsToRemove = positionals.map(s => s.split('.'));

const packageJsonPath = path.join(cwd(), 'package.json');

function removePath(path: string[], object: Record<string, unknown>) {
	if (path.length === 0) {
		throw new Error('path cannot be empty.');
	}

	let index = 0;

	while (index < path.length - 1) {
		const key = path[index]!;
		const pathStringified = ['(root)', ...path.slice(0, index)].join('.');

		if (!Object.hasOwn(object, key)) {
			throw new Error(`package.json does not have property "${path.slice(0, index + 1).join('.')}".`);
		}

		const newObject = object[key];
		if (
			typeof newObject !== 'object' ||
			newObject === null ||
			Array.isArray(newObject)
		) {
			throw new Error(`${pathStringified}.${key} is not an object.`);
		}

		object = newObject as Record<string, unknown>;
		++index;
	}

	const key = path[index]!;
	// Check if key exists before deleting. Technically not necessary
	// Useful to warn about misspelled keys
	if (!Object.hasOwn(object, key)) {
		throw new Error(`package.json does not have property "${path.join('.')}".`);
	}
	
	// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
	delete object[key];
}

let inputPackageJsonRaw: string;

try {
	inputPackageJsonRaw = await readFile(packageJsonPath, 'utf8');
} catch {
	throw new Error(
		'Could not read package.json. package.json needs to be in current directory.',
	);
}

const packageJson = JSON.parse(inputPackageJsonRaw) as Record<string, unknown>;
for (const path of pathsToRemove) {
	removePath(path, packageJson);
}

const outPackageJsonStringified = options.sort
	? stableStringify(packageJson, {
			space: options.indent,
		})!
	: JSON.stringify(packageJson, undefined, options.indent);

if (options.dryRun) {
	console.log(outPackageJsonStringified);
} else {
	await writeFile(packageJsonPath, outPackageJsonStringified);
}
