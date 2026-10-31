"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const node_fetch_1 = require("node-fetch");
const vscode = require("vscode");
const ProteinViewerPanel_1 = require("./panels/ProteinViewerPanel");
const path = require('node:path');
const supportedFileTypes = [
    'pdb',
    "PDB",
    'cif',
    'bcif',
    'mmcif',
    'mcif',
    'ent',
    'brk',
    'pqr',
    'xyz',
    'sdf',
    'sd',
    'gro',
    'prmtop',
    'parm',
    'psf',
    'top',
    'mol2',
    'MOL2'
];
async function activate(context) {
    const helloCommand = vscode.commands.registerCommand("protein-viewer.start", () => {
        showInputBox().then((accession) => {
            if (!accession) {
                return;
            }
            ProteinViewerPanel_1.ProteinViewerPanel.render(context.extensionUri, accession);
        });
    });
    const activateFromFiles = vscode.commands.registerCommand("protein-viewer.activateFromFiles", (fileUri, selectedFiles) => {
        try {
            const candidateUris = [];
            if (Array.isArray(selectedFiles) && selectedFiles.length > 0) {
                candidateUris.push(...selectedFiles);
            }
            else if (fileUri) {
                candidateUris.push(fileUri);
            }
            else {
                const activeUri = vscode.window.activeTextEditor?.document.uri;
                if (activeUri) {
                    candidateUris.push(activeUri);
                }
            }
            if (candidateUris.length === 0) {
                vscode.window.showErrorMessage("Protein Viewer: No structure file available for this command.");
                return;
            }
            console.log(candidateUris);
            ProteinViewerPanel_1.ProteinViewerPanel.renderFromFiles(context.extensionUri, candidateUris);
        }
        catch (error) {
            console.error("Error in activateFromFiles:", error);
            vscode.window.showErrorMessage("Protein Viewer: Failed to open selected structure file(s).");
        }
    });
    const activateFromFolder = vscode.commands.registerCommand("protein-viewer.activateFromFolder", async (folderUri) => {
        try {
            const relativePath = vscode.workspace.asRelativePath(folderUri);
            const files = await vscode.workspace.findFiles(`${relativePath}/*.{${supportedFileTypes.join(',')}}`);
            if (!files.length) {
                vscode.window.showErrorMessage("Protein Viewer: No supported structure files found in the selected folder.");
                return;
            }
            ProteinViewerPanel_1.ProteinViewerPanel.renderFromFiles(context.extensionUri, files);
        }
        catch (error) {
            console.error("Error in activateFromFolder:", error);
            vscode.window.showErrorMessage("Protein Viewer: Failed to open folder structure file(s).");
        }
    });
    const ESMFold = vscode.commands.registerCommand("protein-viewer.ESMFold", () => {
        showSequenceInputBox().then((sequence) => {
            const uri = getfold(sequence).then((pdb) => {
                writeFoldToFile(pdb).then(async (file_uri) => {
                    console.log(file_uri);
                    ProteinViewerPanel_1.ProteinViewerPanel.renderFromFiles(context.extensionUri, [vscode.Uri.file(file_uri)]);
                });
            });
        });
    });
    context.subscriptions.push(helloCommand, activateFromFiles, activateFromFolder, ESMFold);
}
// this method is called when your extension is deactivated
// export function deactivate() {}
async function showInputBox() {
    const accession = await vscode.window.showInputBox({
        value: '',
        placeHolder: 'Enter a PDB or AlphaFoldDB (UniProt) accession',
    });
    return accession;
}
async function showSequenceInputBox() {
    const sequence = await vscode.window.showInputBox({
        value: '',
        placeHolder: 'Enter a protein sequence',
    });
    return sequence;
}
async function writeFoldToFile(file_contents) {
    const time = new Date().getTime();
    const fname = "/esmfold_" + time.toString() + ".pdb";
    const setting = vscode.Uri.parse("untitled:" + vscode.workspace.rootPath + fname);
    await vscode.workspace.openTextDocument(setting).then((a) => {
        vscode.window.showTextDocument(a, 1, false).then(e => {
            e.edit(edit => {
                edit.insert(new vscode.Position(0, 0), file_contents);
                a.save();
            });
        });
    });
    console.log("wrote to test file.");
    console.log(setting);
    return setting.fsPath;
}
async function getfold(sequence) {
    const url = "https://api.esmatlas.com/foldSequence/v1/pdb/";
    console.log(sequence);
    const response = await (0, node_fetch_1.default)(url, {
        method: 'POST',
        body: sequence,
    });
    const body = await response.text();
    return body;
}
//# sourceMappingURL=extension.js.map