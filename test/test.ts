import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

import {cleanPackage} from '../src/library.ts';

const fixtureDirectory = new URL('fixtures/', import.meta.url);
const packageFixture = new URL('package.json', fixtureDirectory);

// cleanPackage returns a string so no need to serialise
const serializers = [(t: unknown) => t];

await test('Passing directory', async () => {
	await test('URL', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: fixtureDirectory,
				keys: [],
				dryRun: true,
			}),
			{serializers},
		);
	});

	await test('String', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: fileURLToPath(fixtureDirectory),
				keys: [],
				dryRun: true,
			}),
			{serializers},
		);
	});

	await test('Non-existant directory', async t => {
		try {
			await cleanPackage({
				packageJson: new URL('./', import.meta.url),
				keys: [],
			});
			t.assert.fail();
		} catch (error: unknown) {
			t.assert.match((error as Error).message, /enoent/i);
		}
	});
});

await test('Passing path to file', async () => {
	await test('package.json exists', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: packageFixture,
				keys: [],
				dryRun: true,
			}),
			{serializers},
		);
	});

	await test('Non-existant file', async t => {
		try {
			await cleanPackage({
				packageJson: new URL('package.json', import.meta.url),
				keys: [],
			});

			t.assert.fail();
		} catch (error: unknown) {
			t.assert.match((error as Error).message, /enoent/i);
		}
	});
});

await test('Options', async () => {
	await test('sort=false', async t => {
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

	await test('sort=true', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: packageFixture,
				keys: [],
				dryRun: true,
			}),
			{serializers},
		);
	});

	await test('indent=0', async t => {
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

	await test('indent=4', async t => {
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

	await test('keys=name', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: packageFixture,
				keys: [['name']],
				dryRun: true,
			}),
			{serializers},
		);
	});

	await test('keys=deep.a', async t => {
		t.assert.snapshot(
			await cleanPackage({
				packageJson: packageFixture,
				keys: [['deep', 'a']],
				dryRun: true,
			}),
			{serializers},
		);
	});

	await test('keys=(all)', async t => {
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
