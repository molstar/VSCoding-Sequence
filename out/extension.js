"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const node_fetch_1 = require("node-fetch");
const vscode = require("vscode");
const ProteinViewerPanel_1 = require("./panels/ProteinViewerPanel");
function activate(context) {
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
            console.log(sequence);
            const file = getfold(sequence);
            console.log(file);
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
async function getfold(sequence) {
    const url = "https://api.esmatlas.com/foldSequence/v1/pdb/";
    const response = await (0, node_fetch_1.default)(url, {
        method: 'POST',
        body: sequence,
        // headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }
    });
    console.log("Output:");
    console.log(response.text());
    console.log(response.body);
    if (!response.ok) { /* Handle */ }
    // If you care about a response:
    if (response.body !== null) {
        // body is ReadableStream<Uint8Array>
        // parse as needed, e.g. reading directly, or
        // console.log(response.body);
        const response_string = response.body.toString(); // new TextDecoder("utf-8").decode(response.body);
        // and further:
        // const asJSON = JSON.parse(asString);  // implicitly 'any', make sure to verify type on runtime.
        //console.log(response_string);
        return response_string;
    }
}
//# sourceMappingURL=extension.js.map