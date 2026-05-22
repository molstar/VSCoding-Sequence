"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilesFromLaunchUri = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const node_fetch_1 = require("node-fetch");
const vscode = require("vscode");
const ProteinViewerPanel_1 = require("./panels/ProteinViewerPanel");
const path = require('node:path');
const URI_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
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
        const filesToOpen = selectedFiles?.length ? selectedFiles : (file_uri ? [file_uri] : []);
        if (filesToOpen.length > 0) {
            ProteinViewerPanel_1.ProteinViewerPanel.renderFromFiles(context.extensionUri, filesToOpen);
        }
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
    const uriHandler = vscode.window.registerUriHandler({
        handleUri(uri) {
            const filesToOpen = getFilesFromLaunchUri(uri);
            if (filesToOpen.length === 0) {
                vscode.window.showErrorMessage("Protein Viewer: no files were provided in URI. Use ?file=/abs/path/to/file.pdb (repeat file for multiple files).");
                return;
            }
            ProteinViewerPanel_1.ProteinViewerPanel.renderFromFiles(context.extensionUri, filesToOpen);
        }
    });
    //context.subscriptions.push(...[helloCommand, activateFromFile]);
    context.subscriptions.push(helloCommand);
    context.subscriptions.push(activateFromFiles);
    context.subscriptions.push(activateFromFolder);
    context.subscriptions.push(ESMFold);
    context.subscriptions.push(uriHandler);
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
function getFilesFromLaunchUri(uri) {
    if (uri.path !== "/open") {
        return [];
    }
    const params = new URLSearchParams(uri.query);
    const files = params.getAll("file")
        .map(file => file.trim())
        .filter(file => file.length > 0)
        .map(file => file.match(URI_SCHEME_PATTERN) ? vscode.Uri.parse(file, true) : vscode.Uri.file(file));
    return files;
}
exports.getFilesFromLaunchUri = getFilesFromLaunchUri;
//# sourceMappingURL=extension.js.map