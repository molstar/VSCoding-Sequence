// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import fetch from 'node-fetch';
import * as vscode from 'vscode';
import { ProteinViewerPanel } from "./panels/ProteinViewerPanel";
const path = require('node:path');

export async function activate(context: vscode.ExtensionContext) {

	const helloCommand = vscode.commands.registerCommand("protein-viewer.start", () => {
		showInputBox().then((accession) => {
			console.log(accession);
			ProteinViewerPanel.render(context.extensionUri, accession);
		});
	});

	const activateFromFiles = vscode.commands.registerCommand("protein-viewer.activateFromFiles", (file_uri: vscode.Uri, selectedFiles: vscode.Uri[]) => {
		console.log(file_uri);
		console.log(selectedFiles);
		const filesToOpen = selectedFiles?.length ? selectedFiles : (file_uri ? [file_uri] : []);
		if (filesToOpen.length > 0) {
			ProteinViewerPanel.renderFromFiles(context.extensionUri, filesToOpen);
		}
	});

	const activateFromFolder = vscode.commands.registerCommand("protein-viewer.activateFromFolder", (folder_uri: vscode.Uri) => {
		vscode.workspace.findFiles(`${vscode.workspace.asRelativePath(folder_uri)}/*.pdb`).then((files_uri) => {
			ProteinViewerPanel.renderFromFiles(context.extensionUri, files_uri)
		});
	});

	const ESMFold = vscode.commands.registerCommand("protein-viewer.ESMFold", () => {
		showSequenceInputBox().then((sequence) => {
			const uri = getfold(sequence).then((pdb) => {
				writeFoldToFile(pdb).then(
					async (file_uri) => {
						console.log(file_uri);
						ProteinViewerPanel.renderFromFiles(context.extensionUri, [vscode.Uri.file(file_uri)]);
					}
				)
			})

		});
	});
	const uriHandler = vscode.window.registerUriHandler({
		handleUri(uri: vscode.Uri) {
			const filesToOpen = getFilesFromLaunchUri(uri);
			if (filesToOpen.length === 0) {
				vscode.window.showErrorMessage("Protein Viewer: no files were provided in URI. Use ?file=/abs/path/to/file.pdb (repeat file for multiple files).");
				return;
			}
			ProteinViewerPanel.renderFromFiles(context.extensionUri, filesToOpen);
		}
	});
	//context.subscriptions.push(...[helloCommand, activateFromFile]);
	context.subscriptions.push(helloCommand);
	context.subscriptions.push(activateFromFiles);
	context.subscriptions.push(activateFromFolder);
	context.subscriptions.push(ESMFold);
	context.subscriptions.push(uriHandler);
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

async function writeFoldToFile(file_contents: string) {
	const time = new Date().getTime();
	const fname = "/esmfold_" + time.toString() + ".pdb";

	const setting: vscode.Uri = vscode.Uri.parse("untitled:" + vscode.workspace.rootPath + fname);
	await vscode.workspace.openTextDocument(setting).then((a: vscode.TextDocument) => {
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


async function getfold(sequence: string | undefined) {
	const url = "https://api.esmatlas.com/foldSequence/v1/pdb/";

	console.log(sequence);
	const response = await fetch(url, {
		method: 'POST',
		body: sequence,
	})

	const body = await response.text();
	return body
}

export function getFilesFromLaunchUri(uri: vscode.Uri): vscode.Uri[] {
	if (uri.path !== "/open") {
		return [];
	}
	const params = new URLSearchParams(uri.query);
	const files = params.getAll("file")
		.map(file => file.trim())
		.filter(file => file.length > 0)
		.map(file => file.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:/) ? vscode.Uri.parse(file, true) : vscode.Uri.file(file));
	return files;
}
