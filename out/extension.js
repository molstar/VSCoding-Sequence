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
    const activateFromFile = vscode.commands.registerCommand("protein-viewer.activateFromFile", (file_uri) => {
        ProteinViewerPanel_1.ProteinViewerPanel.renderFromFiles(context.extensionUri, [file_uri]);
    });
    const activateFromFolder = vscode.commands.registerCommand("protein-viewer.activateFromFolder", (folder_uri) => {
        vscode.workspace.findFiles(`${vscode.workspace.asRelativePath(folder_uri)}/*.pdb`).then((files_uri) => {
            ProteinViewerPanel_1.ProteinViewerPanel.renderFromFiles(context.extensionUri, files_uri)
        });
    });
    //context.subscriptions.push(...[helloCommand, activateFromFile]);
    context.subscriptions.push(helloCommand);
    context.subscriptions.push(activateFromFile);
    context.subscriptions.push(activateFromFolder);
}
exports.activate = activate;
// this method is called when your extension is deactivated
// export function deactivate() {}
async function showInputBox() {
    const accession = await vscode.window.showInputBox({
        value: '',
        placeHolder: 'Enter a PDB accession',
    });
    return accession;
}
//# sourceMappingURL=extension.js.map