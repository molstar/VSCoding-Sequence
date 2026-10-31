import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	tests: [{
		files: 'out/test/**/*.test.js',
		workspaceFolder: '.',
		launchArgs: ['--disable-extensions'],
		mocha: { ui: 'tdd', timeout: 20000 },
	}],
	coverage: {
		exclude: ['**/test/**'],
		reporter: ['text', 'lcov', 'json-summary'],
	},
});
