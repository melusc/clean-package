import {cwd, exit} from 'node:process';
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
			default: cwd(),
		},
		help: {
			type: 'boolean',
			short: 'h',
			default: false,
		},
	},
});

if (values.help) {
	console.log(`
    clean-package [options] [...properties]

    Options:
        --indent       Indentation used for package.json.
                       \\t or an integer (default \\t)
        -n, --dry-run  Print cleaned package.json without overwriting it.
        -s, --sort     Sort properties in package.json (default true)
        -p, --package  Path to package.json or directory with package.json
                       Defaults to current directory
        -h, --help     Display help-text

    Examples:

        clean-package devDependencies scripts

        # only remove build-script
        clean-package scripts.build

        # indent with two spaces and don't sort
        clean-package --indent 2 --no-sort devDependencies

        clean-package --package path/to/package.json

        clean-package --help

    MIT (c) Luca Schnellmann, 2025
`);

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
		`Invalid --indent. Expected \\t or integer, got ${values.indent}.`,
	);
}

const output = await cleanPackage({
	sort: values.sort,
	indent,
	packageJson: values.package,
	paths: positionals.map(s => s.split('.')),
	dryRun: values['dry-run'],
});

if (values['dry-run']) {
	console.log(output);
}
