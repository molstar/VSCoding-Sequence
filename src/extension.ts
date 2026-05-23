// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import fetch from 'node-fetch';
import * as vscode from 'vscode';
import { ProteinViewerPanel } from './panels/ProteinViewerPanel';
import * as glob from 'glob';

export async function activate(context: vscode.ExtensionContext) {

    const helloCommand = vscode.commands.registerCommand('protein-viewer.start', () => {
        showInputBox().then((accession) => {
            console.log(accession);
            ProteinViewerPanel.render(context.extensionUri, accession);
        });
    });

    const activateFromFiles = vscode.commands.registerCommand('protein-viewer.activateFromFiles', (file_uri: vscode.Uri, selectedFiles: vscode.Uri[]) => {
        console.log(file_uri);
        console.log(selectedFiles);
        ProteinViewerPanel.renderFromFiles(context.extensionUri, selectedFiles);
    });

    const activateFromFolder = vscode.commands.registerCommand('protein-viewer.activateFromFolder', (uri: vscode.Uri) => {
        handleFolderActivation(context, uri);
    });

    const ESMFold = vscode.commands.registerCommand('protein-viewer.ESMFold', () => {
        showSequenceInputBox().then((sequence) => {
            if (!sequence) {
                vscode.window.showErrorMessage('No sequence provided');
                return;
            }
            
            vscode.window.showInformationMessage('Sending request to ESMFold...');
            
            getfold(sequence).then((pdb) => {
                if (!pdb) {
                    vscode.window.showErrorMessage('No PDB structure received from ESMFold');
                    return;
                }
                console.log('Received PDB structure of length:', pdb.length);
                
                writeFoldToFile(pdb).then(
                    async (file_uri) => {
                        console.log('File saved at:', file_uri);
                        try {
                            await ProteinViewerPanel.renderFromFiles(context.extensionUri, [vscode.Uri.file(file_uri)]);
                            vscode.window.showInformationMessage('Structure prediction complete!');
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to render structure: ${error}`);
                        }
                    }
                ).catch(error => {
                    vscode.window.showErrorMessage(`Failed to save file: ${error}`);
                });
            }).catch(error => {
                vscode.window.showErrorMessage(`ESMFold API error: ${error}`);
            });
        });
    });
    //context.subscriptions.push(...[helloCommand, activateFromFile]);
    context.subscriptions.push(helloCommand);
    context.subscriptions.push(activateFromFiles);
    context.subscriptions.push(activateFromFolder);
    context.subscriptions.push(ESMFold);
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
    try {
        const time = new Date().getTime();
        const fname = '/esmfold_' + time.toString() + '.pdb';
        
        console.log('Creating file:', fname);
        console.log('Content length:', file_contents.length);
        
        const setting: vscode.Uri = vscode.Uri.parse('untitled:' + vscode.workspace.rootPath + fname);
        const doc = await vscode.workspace.openTextDocument(setting);
        const editor = await vscode.window.showTextDocument(doc, 1, false);
        
        await editor.edit(edit => {
            edit.insert(new vscode.Position(0, 0), file_contents);
        });
        
        await doc.save();
        
        console.log('File saved successfully');
        return setting.fsPath;
    } catch (error) {
        console.error('Error saving file:', error);
        throw error;
    }
}

async function getfold(sequence: string | undefined) {
    const url = 'https://api.esmatlas.com/foldSequence/v1/pdb/';
    
    console.log('Sending sequence to ESMFold:', sequence);
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: sequence,
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const body = await response.text();
        console.log('Received response of length:', body.length);
        return body;
    } catch (error) {
        console.error('ESMFold API error:', error);
        throw error;
    }
}

// Update the function signature to accept context parameter
async function handleFolderActivation(context: vscode.ExtensionContext, uri: vscode.Uri) {
    // Define the file extensions we support
    const supportedExtensions = [
        '.pdb', '.pdb.gz', '.PDB', 
        '.mol2', '.MOL2',
        '.sdf', '.SDF',
        '.mmCIF', '.mmcif', '.MMCIF',
        '.mol', '.MOL',
        '.xyz', '.XYZ',
        '.ent', '.ENT',
        '.pdbqt', '.PDBQT',
        '.cif', '.CIF', '.cif.gz',
        '.mcif', '.MCIF',
        '.gro', '.GRO',
        '.dcd', '.xtc'
    ];

    // Create glob pattern for supported files
    const pattern = `${uri.fsPath}/**/*@(${supportedExtensions.join('|')})`;
    
    // Find all matching files in the folder
    const files = glob.sync(pattern);
    
    if (files.length === 0) {
        vscode.window.showInformationMessage('No supported structure files found in folder');
        return;
    }

    // Convert file paths to URIs
    const fileUris = files.map(file => vscode.Uri.file(file));
    
    // Now we have access to context.extensionUri
    ProteinViewerPanel.renderFromFiles(context.extensionUri, fileUris);
}
