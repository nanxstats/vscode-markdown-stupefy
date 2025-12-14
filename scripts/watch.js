#!/usr/bin/env node

const { spawn } = require('node:child_process');

/** @type {Array<import('node:child_process').ChildProcess>} */
const children = [];

/**
 * @param {string} name
 * @param {string} command
 * @param {readonly string[]} args
 * @returns {import('node:child_process').ChildProcess}
 */
function start(name, command, args) {
	const child = spawn(command, args, { stdio: 'inherit' });
	child.on('exit', (code) => {
		const exitCode = code ?? 0;
		if (exitCode !== 0) {
			process.exitCode = exitCode;
			shutdown();
		}
	});
	child.on('error', (error) => {
		console.error(`[watch] ${name} failed to start:`, error);
		process.exitCode = 1;
		shutdown();
	});
	children.push(child);
	return child;
}

function shutdown() {
	for (const child of children) {
		if (!child.killed) {
			child.kill('SIGTERM');
		}
	}
}

process.on('SIGINT', () => {
	shutdown();
	process.exit(130);
});
process.on('SIGTERM', () => {
	shutdown();
	process.exit(143);
});

start('esbuild', process.execPath, ['esbuild.js', '--watch']);
start('tsc', process.execPath, [require.resolve('typescript/bin/tsc'), '--noEmit', '--watch', '--project', 'tsconfig.json']);
