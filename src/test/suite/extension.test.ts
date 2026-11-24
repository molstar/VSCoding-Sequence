import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { ProteinViewerPanel } from '../../panels/ProteinViewerPanel';

const EXTENSION_ID = 'ArianJamasb.protein-viewer';
const testFiles = path.resolve(__dirname, '../../../test_files');

function panelHtml(): string {
	assert.ok(ProteinViewerPanel.currentPanel, 'expected a viewer panel to be open');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (ProteinViewerPanel.currentPanel as any)._panel.webview.html;
}

suite('Extension', () => {
	suiteSetup(async () => {
		await vscode.extensions.getExtension(EXTENSION_ID)!.activate();
	});

	teardown(async () => {
		ProteinViewerPanel.currentPanel?.dispose();
		await vscode.commands.executeCommand('workbench.action.closeAllEditors');
	});

	test('registers all contributed commands', async () => {
		const commands = await vscode.commands.getCommands(true);
		for (const id of ['start', 'activateFromFiles', 'activateFromFolder', 'ESMFold', 'viewCurrentPDB']) {
			assert.ok(commands.includes(`protein-viewer.${id}`), `missing protein-viewer.${id}`);
		}
	});

	test('activateFromFiles opens a viewer for a single file', async () => {
		const file = vscode.Uri.file(path.join(testFiles, '3eiy.PDB'));
		await vscode.commands.executeCommand('protein-viewer.activateFromFiles', file);
		const html = panelHtml();
		assert.match(html, /molstar\.js/);
		assert.match(html, /viewer\.loadStructureFromUrl\("[^"]*3eiy\.PDB", "pdb", false\);/);
	});

	test('activateFromFiles prefers the multi-selection over the clicked file', async () => {
		const pdb = vscode.Uri.file(path.join(testFiles, '3eiy.PDB'));
		const cif = vscode.Uri.file(path.join(testFiles, '3eiy.MMCIF'));
		await vscode.commands.executeCommand('protein-viewer.activateFromFiles', pdb, [pdb, cif]);
		const html = panelHtml();
		assert.match(html, /3eiy\.PDB", "pdb"/);
		assert.match(html, /3eiy\.MMCIF", "mmcif"/);
	});

	test('activateFromFiles with nothing selected opens no panel', async () => {
		await vscode.commands.executeCommand('protein-viewer.activateFromFiles');
		assert.strictEqual(ProteinViewerPanel.currentPanel, undefined);
	});

	test('activateFromFolder loads supported files from the folder', async () => {
		await vscode.commands.executeCommand('protein-viewer.activateFromFolder', vscode.Uri.file(testFiles));
		const html = panelHtml();
		assert.match(html, /3eiy\.PDB", "pdb"/);
		assert.match(html, /esmfold\.pdb", "pdb"/);
	});

	test('viewCurrentPDB opens the active editor file', async () => {
		const file = vscode.Uri.file(path.join(testFiles, '3eiy.PDB'));
		await vscode.window.showTextDocument(file);
		await vscode.commands.executeCommand('protein-viewer.viewCurrentPDB');
		assert.match(panelHtml(), /3eiy\.PDB", "pdb"/);
	});

	suite('start', () => {
		const realShowInputBox = vscode.window.showInputBox;
		const stubInput = (value: string | undefined) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(vscode.window as any).showInputBox = async () => value;
		};
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		teardown(() => { (vscode.window as any).showInputBox = realShowInputBox; });

		const startAndWait = async () => {
			await vscode.commands.executeCommand('protein-viewer.start');
			await new Promise((r) => setTimeout(r, 50)); // command doesn't await its input box
		};

		test('loads a PDB entry for a 4-character ID', async () => {
			stubInput('3eiy');
			await startAndWait();
			assert.match(panelHtml(), /viewer\.loadPdb\("3eiy"\);/);
		});

		test('loads AlphaFold DB for a UniProt accession', async () => {
			stubInput('P69905');
			await startAndWait();
			assert.match(panelHtml(), /viewer\.loadAlphaFoldDb\("P69905"\);/);
		});

		test('does nothing when the input box is cancelled', async () => {
			stubInput(undefined);
			await startAndWait();
			assert.strictEqual(ProteinViewerPanel.currentPanel, undefined);
		});
	});
});
