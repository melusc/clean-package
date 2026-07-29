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

import {createRequire} from 'node:module';
import {exit} from 'node:process';
import {parseArgs} from 'node:util';

import {cleanPackage} from './library.ts';

const {positionals, values} = parseArgs({
	allowNegative: true,
	allowPositionals: true,
	options: {
		indent: {
			type: 'string',
			default: '\t',
		},
		'dry-run': {
			type: 'boolean',
			short: 'n',
			default: false,
		},
		sort: {
			type: 'boolean',
			short: 's',
			default: true,
		},
		package: {
			type: 'string',
			short: 'p',
			default: '.',
		},
		help: {
			type: 'boolean',
			short: 'h',
			default: false,
		},
		version: {
			type: 'boolean',
			short: 'v',
			default: false,
		},
	},
});

if (values.help) {
	console.log(String.raw`
    clean-package [options] [...properties]

    Options:
        --indent       Indentation used for package.json.
                       \t or an integer (default \t)
        -n, --dry-run  Print cleaned package.json without overwriting it.
        -s, --sort     Sort properties in package.json (default true)
        -p, --package  Path to package.json or directory with package.json
                       Defaults to current directory
        -h, --help     Display help-text and exit
        -v, --version  Print version and exit

    Examples:

        clean-package devDependencies scripts

        # only remove build-script
        clean-package scripts.build

        # indent with two spaces and don't sort
        clean-package --indent 2 --no-sort devDependencies

        clean-package --package path/to/package.json

        clean-package --help

    License:
        Copyright (C) 2025-2026 by Luca Schnellmann
        @lusc/clean-package is distributed under the GNU General Public License.
        See the file COPYING for details.
`);

	exit(0);
}

if (values.version) {
	const require = createRequire(import.meta.url);

	const packageJson = require('../package.json') as {version: string};

	console.log(packageJson.version);
	exit(0);
}

let indent: string | number;
const indentNumber = Number.parseInt(values.indent);
if (values.indent === '\t' || values.indent === String.raw`\t`) {
	indent = '\t';
} else if (indentNumber >= 0 && Number.isSafeInteger(indentNumber)) {
	indent = indentNumber;
} else {
	throw new Error(
		String.raw`Invalid --indent. Expected \t or integer, got ${values.indent}.`,
	);
}

const output = await cleanPackage({
	sort: values.sort,
	indent,
	packageJson: values.package,
	keys: positionals.map(s => s.split('.')),
	dryRun: values['dry-run'],
});

if (values['dry-run']) {
	console.log(output);
}
