import {exit} from 'node:process';
import {parseArgs} from 'node:util';

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
        -h, --help     Display help-text

    Examples:

        clean-package devDependencies scripts
        clean-package scripts.build
        clean-package --indent 2 --no-sort devDependencies
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

const options = {
	sort: values.sort,
	indent,
	dryRun: values['dry-run'],
} as const;

export {options, positionals};
