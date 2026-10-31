"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const formats_1 = require("../../formats");
suite('molstarFormat', () => {
    const cases = [
        ['/a/3eiy.pdb', 'pdb', false],
        ['/a/3eiy.PDB', 'pdb', false],
        ['/a/x.ent', 'pdb', false],
        ['/a/x.brk', 'pdb', false],
        ['/a/x.pdbqt', 'pdbqt', false],
        ['/a/x.cif', 'mmcif', false],
        ['/a/x.CIF', 'mmcif', false],
        ['/a/x.mmcif', 'mmcif', false],
        ['/a/3eiy.MMCIF', 'mmcif', false],
        ['/a/x.mcif', 'mmcif', false],
        ['/a/x.bcif', 'mmcif', true],
        ['/a/x.sd', 'sdf', false],
        ['/a/x.SDF', 'sdf', false],
        ['/a/x.mol2', 'mol2', false],
        ['/a/x.MOL2', 'mol2', false],
        ['/a/x.gro', 'gro', false],
        ['/a/x.xyz', 'xyz', false],
        ['/dir.v2/x.mol', 'mol', false],
    ];
    for (const [path, format, isBinary] of cases) {
        test(`${path} -> ${format}`, () => {
            assert.deepStrictEqual((0, formats_1.molstarFormat)(path), { format, isBinary });
        });
    }
});
suite('fileLoadCommand', () => {
    test('emits a quoted loadStructureFromUrl call', () => {
        assert.strictEqual((0, formats_1.fileLoadCommand)('https://file+.vscode-resource/a/x.bcif', '/a/x.bcif'), 'viewer.loadStructureFromUrl("https://file+.vscode-resource/a/x.bcif", "mmcif", true);');
    });
    test('escapes quotes in URLs', () => {
        const cmd = (0, formats_1.fileLoadCommand)(`https://h/it's".pdb`, `/it's".pdb`);
        assert.strictEqual(cmd, `viewer.loadStructureFromUrl("https://h/it's\\".pdb", "pdb", false);`);
    });
});
suite('accessionLoadCommand', () => {
    test('4-character IDs load from the PDB', () => {
        assert.strictEqual((0, formats_1.accessionLoadCommand)('3eiy'), 'viewer.loadPdb("3eiy");');
    });
    test('trims whitespace before classifying', () => {
        assert.strictEqual((0, formats_1.accessionLoadCommand)(' 1CRN \n'), 'viewer.loadPdb("1CRN");');
    });
    test('other IDs load from AlphaFold DB', () => {
        assert.strictEqual((0, formats_1.accessionLoadCommand)('P69905'), 'viewer.loadAlphaFoldDb("P69905");');
    });
    test('cannot break out of the string literal', () => {
        assert.strictEqual((0, formats_1.accessionLoadCommand)(`x');alert(1);//`), `viewer.loadAlphaFoldDb("x');alert(1);//");`);
    });
});
//# sourceMappingURL=formats.test.js.map