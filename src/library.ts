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

	// eslint-disable-next-line security/detect-non-literal-fs-filename
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
		// eslint-disable-next-line security/detect-non-literal-fs-filename
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

	// eslint-disable-next-line security/detect-non-literal-fs-filename
	const packageStat = await stat(packagePath);

	if (packageStat.isFile()) {
		return packagePath;
	}

	return resolvePackageJson(path.join(packagePath, 'package.json'));
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
		const pathStringified = ['(root)', ...keyPath.slice(0, index)].join('.');

		if (!Object.hasOwn(object, key)) {
			throw new Error(
				`${filePath} does not have property "${keyPath.slice(0, index + 1).join('.')}".`,
			);
		}

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

function jsonStringifySorted(object: unknown, indent: string | number) {
	return JSON.stringify(
		object,
		(_key, value: unknown) => {
			if (typeof value !== 'object' || Array.isArray(value) || value === null) {
				return value;
			}

			const object = value as Record<string, unknown>;
			const keys = Object.keys(object).toSorted();

			return Object.fromEntries(keys.map(key => [key, object[key]]));
		},
		indent,
	);
}
