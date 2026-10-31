"use strict";
// Pure helpers (no `vscode` import) so they can be unit tested in plain Node.
Object.defineProperty(exports, "__esModule", { value: true });
exports.molstarFormat = molstarFormat;
exports.fileLoadCommand = fileLoadCommand;
exports.accessionLoadCommand = accessionLoadCommand;
// File extension -> Mol* trajectory format. Anything else is passed through as-is.
const FORMAT_ALIASES = {
    cif: 'mmcif',
    mcif: 'mmcif',
    bcif: 'mmcif',
    ent: 'pdb',
    brk: 'pdb',
    sd: 'sdf',
};
function molstarFormat(filePath) {
    const ext = (filePath.split('/').pop()?.split('.').pop() ?? '').toLowerCase();
    return { format: FORMAT_ALIASES[ext] ?? ext, isBinary: ext === 'bcif' };
}
function fileLoadCommand(url, filePath) {
    const { format, isBinary } = molstarFormat(filePath);
    return `viewer.loadStructureFromUrl(${JSON.stringify(url)}, ${JSON.stringify(format)}, ${isBinary});`;
}
// 4-character IDs are PDB entries; anything else is treated as a UniProt accession for AlphaFold DB.
function accessionLoadCommand(accession) {
    const id = accession.trim();
    return id.length === 4
        ? `viewer.loadPdb(${JSON.stringify(id)});`
        : `viewer.loadAlphaFoldDb(${JSON.stringify(id)});`;
}
//# sourceMappingURL=formats.js.map