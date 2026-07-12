import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

import {cleanPackage} from '../src/library.ts';

const fixtureDirectory = new URL('fixtures/', import.meta.url);
const packageFixture = new URL('package.json', fixtureDirectory);

// cleanPackage returns a string so no need to serialise
const serializers = [(t: unknown) => t];

await test('Passing directory', async t => {
	await t.test('URL', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: fixtureDirectory,
				keys: [],
				dryRun: true,
			}),
			{serializers},
		);
	});

	await t.test('String', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: fileURLToPath(fixtureDirectory),
				keys: [],
				dryRun: true,
			}),
			{serializers},
		);
	});

	await t.test('Non-existant directory', async t => {
		await t.assert.rejects(async () => {
			await cleanPackage({
				packageJson: new URL('./', import.meta.url),
				keys: [],
			});
		}, /enoent/i);
	});
});

await test('Passing path to file', async t => {
	await t.test('package.json exists', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: packageFixture,
				keys: [],
				dryRun: true,
			}),
			{serializers},
		);
	});

	await t.test('Non-existant file', async t => {
		await t.assert.rejects(async () => {
			await cleanPackage({
				packageJson: new URL('package.json', import.meta.url),
				keys: [],
			});
		}, /enoent/i);
	});
});

await test('Options', async t => {
	await t.test('sort=false', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: packageFixture,
				keys: [],
				dryRun: true,
				sort: false,
			}),
			{serializers},
		);
	});

	await t.test('sort=true', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: packageFixture,
				keys: [],
				dryRun: true,
			}),
			{serializers},
		);
	});

	await t.test('indent=0', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: packageFixture,
				keys: [],
				dryRun: true,
				indent: 0,
			}),
			{serializers},
		);
	});

	await t.test('indent=4', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: packageFixture,
				keys: [],
				dryRun: true,
				indent: 4,
			}),
			{serializers},
		);
	});

	await t.test('keys=name', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: packageFixture,
				keys: [['name']],
				dryRun: true,
			}),
			{serializers},
		);
	});

	await t.test('keys=deep.a', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: packageFixture,
				keys: [['deep', 'a']],
				dryRun: true,
			}),
			{serializers},
		);
	});

	await t.test('keys=(all)', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: packageFixture,
				keys: [['deep'], ['name'], ['scripts']],
				dryRun: true,
			}),
			{serializers},
		);
	});
});
