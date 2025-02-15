import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {argv, cwd} from 'node:process';

import stableStringify from 'json-stable-stringify';

const argvPaths = argv[0] === 'clean-package' ? argv.slice(1) : argv.slice(2);
const pathsToRemove = argvPaths.map(s => s.split('.'));

const packageJsonPath = path.join(cwd(), 'package.json')

function removePath(path: string[], object: Record<string, unknown>) {
	if (path.length === 0) {
		throw new Error('path cannot be empty.');
	}

	let index = 0;

	while (index < path.length - 1) {
		const key = path[index]!;
		const pathStringified = ['(root)', ...path.slice(0, index)].join('.');

		if (!Object.hasOwn(object, key)) {
			throw new Error(`${pathStringified} does not have property "${key}".`);
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

	// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
	delete object[path[index]!];
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

const outPackageJsonRaw = stableStringify(packageJson, {
	space: '\t',
})!;

await writeFile(packageJsonPath, outPackageJsonRaw);
