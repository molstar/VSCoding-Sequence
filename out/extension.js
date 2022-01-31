"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
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
    //context.subscriptions.push(...[helloCommand, activateFromFile]);
    context.subscriptions.push(helloCommand);
    context.subscriptions.push(activateFromFiles);
    context.subscriptions.push(activateFromFolder);
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
//# sourceMappingURL=extension.js.map