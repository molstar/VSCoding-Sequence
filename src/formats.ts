// Pure helpers (no `vscode` import) so they can be unit tested in plain Node.

// File extension -> Mol* trajectory format. Anything else is passed through as-is.
const FORMAT_ALIASES: Record<string, string> = {
  cif: 'mmcif',
  mcif: 'mmcif',
  bcif: 'mmcif',
  ent: 'pdb',
  brk: 'pdb',
  sd: 'sdf',
};

export function molstarFormat(filePath: string): { format: string; isBinary: boolean } {
  const ext = (filePath.split('/').pop()?.split('.').pop() ?? '').toLowerCase();
  return { format: FORMAT_ALIASES[ext] ?? ext, isBinary: ext === 'bcif' };
}

export function fileLoadCommand(url: string, filePath: string): string {
  const { format, isBinary } = molstarFormat(filePath);
  return `viewer.loadStructureFromUrl(${JSON.stringify(url)}, ${JSON.stringify(format)}, ${isBinary});`;
}

// 4-character IDs are PDB entries; anything else is treated as a UniProt accession for AlphaFold DB.
export function accessionLoadCommand(accession: string): string {
  const id = accession.trim();
  return id.length === 4
    ? `viewer.loadPdb(${JSON.stringify(id)});`
    : `viewer.loadAlphaFoldDb(${JSON.stringify(id)});`;
}
