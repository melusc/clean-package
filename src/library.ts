import {readFile, stat, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import stableStringify from 'json-stable-stringify';

type Options = {
	readonly packageJson: string | URL;
	readonly paths: readonly (readonly string[])[];
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

	for (const path of options.paths) {
		removePath(path, packageJson, packageJsonPath);
	}

	const outPackageJsonStringified = shouldSort
		? stableStringify(packageJson, {
				space: indent,
			})!
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
		return resolvePackageJson(fileURLToPath(packagePath));
	}

	packagePath = path.normalize(packagePath);

	const packageStat = await stat(packagePath);

	if (packageStat.isFile()) {
		return packagePath;
	}

	return resolvePackageJson(path.join(packagePath, 'package.json'));
}

function removePath(path: readonly string[], object: Record<string, unknown>, filePath: string) {
	if (path.length === 0) {
		throw new Error('path cannot be empty.');
	}

	let index = 0;

	while (index < path.length - 1) {
		const key = path[index]!;
		const pathStringified = ['(root)', ...path.slice(0, index)].join('.');

		if (!Object.hasOwn(object, key)) {
			throw new Error(
				`${filePath} does not have property "${path.slice(0, index + 1).join('.')}".`,
			);
		}

		const newObject = object[key];
		if (
			typeof newObject !== 'object' ||
			newObject === null ||
			Array.isArray(newObject)
		) {
			throw new Error(`${filePath}: ${pathStringified}.${key} is not an object.`);
		}

		object = newObject as Record<string, unknown>;
		++index;
	}

	const key = path[index]!;
	// Check if key exists before deleting. Technically not necessary
	// Useful to warn about misspelled keys
	if (!Object.hasOwn(object, key)) {
		throw new Error(`${filePath} does not have property "${path.join('.')}".`);
	}

	// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
	delete object[key];
}
