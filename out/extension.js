"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const node_fetch_1 = require("node-fetch");
const vscode = require("vscode");
const ProteinViewerPanel_1 = require("./panels/ProteinViewerPanel");
const path = require('node:path');
async function activate(context) {
    const helloCommand = vscode.commands.registerCommand("protein-viewer.start", () => {
        showInputBox().then((accession) => {
            console.log(accession);
            ProteinViewerPanel_1.ProteinViewerPanel.render(context.extensionUri, accession);
        });
    });
    const activateFromFiles = vscode.commands.registerCommand("protein-viewer.activateFromFiles", (file_uri, selectedFiles) => {
        console.log(file_uri);
        console.log(selectedFiles);
        ProteinViewerPanel_1.ProteinViewerPanel.renderFromFiles(context.extensionUri, selectedFiles);
    });
    const activateFromFolder = vscode.commands.registerCommand("protein-viewer.activateFromFolder", (folder_uri) => {
        vscode.workspace.findFiles(`${vscode.workspace.asRelativePath(folder_uri)}/*.pdb`).then((files_uri) => {
            ProteinViewerPanel_1.ProteinViewerPanel.renderFromFiles(context.extensionUri, files_uri);
        });
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
    //context.subscriptions.push(...[helloCommand, activateFromFile]);
    context.subscriptions.push(helloCommand);
    context.subscriptions.push(activateFromFiles);
    context.subscriptions.push(activateFromFolder);
    context.subscriptions.push(ESMFold);
}
exports.activate = activate;
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