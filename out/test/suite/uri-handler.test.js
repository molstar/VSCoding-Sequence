"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const vscode = require("vscode");
const extension_1 = require("../../extension");
suite('URI Handler Test Suite', () => {
    test('parses repeated file params from launch uri', () => {
        const launchUri = vscode.Uri.parse('vscode://ArianJamasb.protein-viewer/open?file=%2Ftmp%2Fa.pdb&file=%2Ftmp%2Fb.cif');
        const files = (0, extension_1.getFilesFromLaunchUri)(launchUri);
        assert.strictEqual(files.length, 2);
        assert.strictEqual(files[0].fsPath, '/tmp/a.pdb');
        assert.strictEqual(files[1].fsPath, '/tmp/b.cif');
    });
    test('ignores non-open uri path', () => {
        const launchUri = vscode.Uri.parse('vscode://ArianJamasb.protein-viewer/other?file=%2Ftmp%2Fa.pdb');
        const files = (0, extension_1.getFilesFromLaunchUri)(launchUri);
        assert.strictEqual(files.length, 0);
    });
});
//# sourceMappingURL=uri-handler.test.js.map