import { runTests } from '@vscode/test-electron';
import { resolve } from 'path';

async function main() {
	try {
		const extensionDevelopmentPath = resolve(__dirname, '../../');
		const extensionTestsPath = resolve(__dirname, './suite/index');

		await runTests({ extensionDevelopmentPath, extensionTestsPath });
	} catch (err) {
		console.error('Failed to run tests', err);
		process.exit(1);
	}
}

main();
