// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ProteinViewerPanel } from "./panels/ProteinViewerPanel";
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {

	const helloCommand = vscode.commands.registerCommand("protein-viewer.start", () => {
		showInputBox().then((accession) => {
			console.log(accession);
			ProteinViewerPanel.render(context.extensionUri, accession);
		});
	});

	const activateFromFile = vscode.commands.registerCommand("protein-viewer.activateFromFile", (file_uri: vscode.Uri)  => {
		ProteinViewerPanel.renderFromFile(context.extensionUri, file_uri);
	});

	//context.subscriptions.push(...[helloCommand, activateFromFile]);
	context.subscriptions.push(helloCommand);
	context.subscriptions.push(activateFromFile);
}

// this method is called when your extension is deactivated
// export function deactivate() {}

async function showInputBox() {
	const accession = await vscode.window.showInputBox({
		value: '',
		placeHolder: 'Enter a PDB accession',
	});
	return accession;
}