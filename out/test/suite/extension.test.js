"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const extension_1 = require("../../extension");
suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('Sample test', () => {
        assert.strictEqual(-1, [1, 2, 3].indexOf(5));
        assert.strictEqual(-1, [1, 2, 3].indexOf(0));
    });
    test('getFileUrisToOpen prefers selected files', () => {
        const fileUri = vscode.Uri.file('/tmp/single.pdb');
        const selectedA = vscode.Uri.file('/tmp/a.pdb');
        const selectedB = vscode.Uri.file('/tmp/b.pdb');
        const active = vscode.Uri.file('/tmp/active.pdb');
        const result = (0, extension_1.getFileUrisToOpen)(fileUri, [selectedA, selectedB], active);
        assert.deepStrictEqual(result, [selectedA, selectedB]);
    });
    test('getFileUrisToOpen falls back to command uri', () => {
        const fileUri = vscode.Uri.file('/tmp/single.pdb');
        const active = vscode.Uri.file('/tmp/active.pdb');
        const result = (0, extension_1.getFileUrisToOpen)(fileUri, undefined, active);
        assert.deepStrictEqual(result, [fileUri]);
    });
    test('getFileUrisToOpen falls back to active editor uri', () => {
        const active = vscode.Uri.file('/tmp/active.pdb');
        const result = (0, extension_1.getFileUrisToOpen)(undefined, undefined, active);
        assert.deepStrictEqual(result, [active]);
    });
    test('getFileUrisToOpen returns empty when no uris exist', () => {
        const result = (0, extension_1.getFileUrisToOpen)(undefined, undefined, undefined);
        assert.deepStrictEqual(result, []);
    });
});
//# sourceMappingURL=extension.test.js.map