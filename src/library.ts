/**
 *
 * This file is part of @lusc/clean-package, a tool to remove superfluous
 * fields from a package.json for publishing.
 * Copyright (C) 2026, Luca Schnellmann <oss@lusc.ch>

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

type Options = {
	readonly packageJson: string | URL;
	readonly keys: readonly (readonly string[])[];
	readonly indent?: string | number | undefined;
	readonly sort?: boolean | undefined;
	readonly dryRun?: boolean | undefined;
};
export async function cleanPackage(options: Options): Promise<string> {
	const indent = options.indent ?? '\t';
	const shouldSort = options.sort ?? true;
	const dryRun = options.dryRun ?? false;
	const packageJsonPath = await resolvePackageJson(options.packageJson);

	const inputPackageJsonRaw = await readFile(packageJsonPath, 'utf8');
	const packageJson = JSON.parse(inputPackageJsonRaw) as Record<
		string,
		unknown
	>;

	for (const keyPath of options.keys) {
		removePath(keyPath, packageJson, packageJsonPath);
	}

	const outPackageJsonStringified = shouldSort
		? jsonStringifySorted(packageJson, indent)
		: JSON.stringify(packageJson, undefined, indent);

	if (!dryRun) {
		await writeFile(packageJsonPath, outPackageJsonStringified);
	}

	return outPackageJsonStringified;
}

// I'm not looking for the package.json
// Either the path is the file already
// or it is the directory with the package.json
async function resolvePackageJson(packagePath: string | URL) {
	if (typeof packagePath !== 'string') {
		packagePath = fileURLToPath(packagePath);
	}

	packagePath = path.normalize(packagePath);

	let packageStat = await stat(packagePath);

	if (packageStat.isFile()) {
		return packagePath;
	}

	packagePath = path.join(packagePath, 'package.json');

	packageStat = await stat(packagePath);
	if (packageStat.isFile()) {
		return packagePath;
	}

	throw new Error('Could not find package.json.');
}

function removePath(
	keyPath: readonly string[],
	object: Record<string, unknown>,
	filePath: string,
) {
	if (keyPath.length === 0) {
		throw new Error('path cannot be empty.');
	}

	let index = 0;

	while (index < keyPath.length - 1) {
		const key = keyPath[index]!;
		if (!Object.hasOwn(object, key)) {
			throw new Error(
				`${filePath} does not have property "${keyPath.slice(0, index + 1).join('.')}".`,
			);
		}

		const pathStringified = ['(root)', ...keyPath.slice(0, index)].join('.');
		const newObject = object[key];
		if (
			typeof newObject !== 'object' ||
			newObject === null ||
			Array.isArray(newObject)
		) {
			throw new Error(
				`${filePath}: ${pathStringified}.${key} is not an object.`,
			);
		}

		object = newObject as Record<string, unknown>;
		++index;
	}

	const key = keyPath[index]!;
	// Check if key exists before deleting. Technically not necessary
	// Useful to warn about misspelled keys
	if (!Object.hasOwn(object, key)) {
		throw new Error(
			`${filePath} does not have property "${keyPath.join('.')}".`,
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
	delete object[key];
}

const collator = new Intl.Collator('en-GB', {
	numeric: true,
	sensitivity: 'base',
});

function jsonStringifySorted(rootObject: unknown, indent: string | number) {
	return JSON.stringify(
		rootObject,
		(_key, value: unknown) => {
			if (value === null || typeof value !== 'object' || Array.isArray(value)) {
				return value;
			}

			const object = value as Record<string, unknown>;
			const keys = Object.keys(object).toSorted(collator.compare);

			// Prune empty objects, except root object
			if (object !== rootObject && keys.length === 0) {
				return;
			}

			return Object.fromEntries(keys.map(key => [key, object[key]]));
		},
		indent,
	);
}
