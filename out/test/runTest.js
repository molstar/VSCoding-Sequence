"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const os = require("os");
const test_electron_1 = require("@vscode/test-electron");
async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        // Passed to `--extensionDevelopmentPath`
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');
        // The path to test runner
        // Passed to --extensionTestsPath
        const extensionTestsPath = path.resolve(__dirname, './suite/index');
        // Additional arguments for better debugging
        const launchArgs = [
            '--disable-extensions',
            '--disable-gpu'
        ];
        // Detect platform and architecture
        const platform = os.platform();
        const arch = os.arch();
        // Configure platform-specific settings
        const testConfig = {
            extensionDevelopmentPath,
            extensionTestsPath,
            version: '1.97.1',
            platform: platform === 'darwin' && arch === 'arm64' ? 'darwin-arm64' : platform,
            launchArgs,
            arch: arch
        };
        console.log(`Running tests on ${platform} (${arch})`);
        await (0, test_electron_1.runTests)(testConfig);
    }
    catch (err) {
        console.error('Failed to run tests:', err);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=runTest.js.map