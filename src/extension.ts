// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ProteinViewerPanel } from "./panels/ProteinViewerPanel";

export function activate(context: vscode.ExtensionContext) {

	const helloCommand = vscode.commands.registerCommand("protein-viewer.start", () => {
		showInputBox().then((accession) => {
			console.log(accession);
			ProteinViewerPanel.render(context.extensionUri, accession);
		});
	});

	const activateFromFiles = vscode.commands.registerCommand("protein-viewer.activateFromFiles", (file_uri: vscode.Uri, selectedFiles: vscode.Uri[]) => {
		console.log(file_uri);
		console.log(selectedFiles);
		ProteinViewerPanel.renderFromFiles(context.extensionUri, selectedFiles);
	});

	const activateFromFolder = vscode.commands.registerCommand("protein-viewer.activateFromFolder", (folder_uri: vscode.Uri) => {
		vscode.workspace.findFiles(`${vscode.workspace.asRelativePath(folder_uri)}/*.pdb`).then((files_uri) => {
			ProteinViewerPanel.renderFromFiles(context.extensionUri, files_uri)
		});
	});

	const viewCurrentPDB = vscode.commands.registerCommand("protein-viewer.viewCurrentPDB", () => {
		const activeEditor = vscode.window.activeTextEditor?.document.uri;
		if (activeEditor) {
			ProteinViewerPanel.renderFromFiles(context.extensionUri, [activeEditor])
		}
	});

	//context.subscriptions.push(...[helloCommand, activateFromFile]);
	context.subscriptions.push(helloCommand);
	context.subscriptions.push(activateFromFiles);
	context.subscriptions.push(activateFromFolder);
	context.subscriptions.push(viewCurrentPDB);
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
