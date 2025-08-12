import { glob } from 'glob';
import Mocha from 'mocha';
import { resolve as pathResolve } from 'path';

export function run(): Promise<void> {
	const mocha = new Mocha({
		ui: 'tdd',
		color: true
	});

	const testsRoot = pathResolve(__dirname, '..');

	return new Promise((resolve, reject) => {
		glob('**/**.test.js', { cwd: testsRoot })
			.then(files => {
				files.forEach(f => mocha.addFile(pathResolve(testsRoot, f)));

				try {
					mocha.run(failures => {
						if (failures > 0) {
							reject(new Error(`${failures} tests failed.`));
						} else {
							resolve();
						}
					});
				} catch (err) {
					console.error(err);
					reject(err);
				}
			})
			.catch(err => reject(err));
	});
}
