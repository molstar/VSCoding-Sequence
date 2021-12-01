"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProteinViewerPanel = void 0;
const vscode = require("vscode");
class ProteinViewerPanel {
    constructor(panel, extensionUri, accession, clickedFile) {
        this._disposables = [];
        this._panel = panel;
        this._panel.onDidDispose(this.dispose, null, this._disposables);
        if (accession != undefined) {
            this._panel.webview.html = this._getWebviewContent(panel.webview, extensionUri, accession);
        }
        ;
        if (clickedFile != undefined) {
            this._panel.webview.html = this._getWebviewContentForFile(panel.webview, extensionUri, clickedFile);
        }
        ;
    }
    static render(extensionUri, accession) {
        const windowName = "Protein Viewer - " + accession;
        const panel = vscode.window.createWebviewPanel("proteinviewer", windowName, vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        ProteinViewerPanel.currentPanel = new ProteinViewerPanel(panel, extensionUri, accession, undefined);
    }
    static renderFromFile(extensionUri, clickedFile) {
        const fname = clickedFile.path.split('/').pop();
        const windowName = "Protein Viewer - " + fname;
        const panel = vscode.window.createWebviewPanel("proteinviewer", windowName, vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        ProteinViewerPanel.currentPanel = new ProteinViewerPanel(panel, extensionUri, undefined, clickedFile);
        //}
    }
    dispose() {
        ProteinViewerPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
    _getWebviewContent(webview, extensionUri, accession) {
        const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'molstar', 'build/viewer', 'molstar.css'));
        const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'molstar', 'build/viewer', 'molstar.js'));
        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
            <link rel="icon" href="./favicon.ico" type="image/x-icon">
            <title>Embedded Mol* Viewer</title>
            <style>
                #app {
                    position: absolute;
                    left: 100px;
                    top: 100px;
                    width: 800px;
                    height: 600px;
                }
            </style>
            <link rel="stylesheet" type="text/css" href="${cssUri}" />
        </head>
        <body>
            <div id="app"></div>
            <script type="text/javascript" src="${jsUri}"></script>
            <script type="text/javascript">
                var viewer = new molstar.Viewer('app', {
                    layoutIsExpanded: true,
                    layoutShowControls: true,
                    layoutShowRemoteState: false,
                    layoutShowSequence: true,
                    layoutShowLog: false,
                    layoutShowLeftPanel: true,
                    viewportShowExpand: true,
                    viewportShowSelectionMode: false,
                    viewportShowAnimation: false,
                    pdbProvider: 'rcsb',
                    emdbProvider: 'rcsb',
                });
                viewer.loadPdb('${accession}');
                // viewer.loadAllModelsOrAssemblyFromUrl('https://cs.litemol.org/5ire/full', 'mmcif', false, { representationParams: { theme: { globalName: 'operator-name' } } })
            </script>
        </body>
    </html>
    `;
    }
    _getWebviewContentForFile(webview, extensionUri, clickedFile) {
        //console.log(clickedFile);
        const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'molstar', 'build/viewer', 'molstar.css'));
        const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'molstar', 'build/viewer', 'molstar.js'));
        const pdb_contents = webview.asWebviewUri(clickedFile);
        const extension = clickedFile.path.split('.').pop();
        console.log(pdb_contents);
        console.log(extension);
        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
            <link rel="icon" href="./favicon.ico" type="image/x-icon">
            <title>Embedded Mol* Viewer</title>
            <style>
                #app {
                    position: absolute;
                    left: 100px;
                    top: 100px;
                    width: 800px;
                    height: 600px;
                }
            </style>
            <link rel="stylesheet" type="text/css" href="${cssUri}" />
        </head>
        <body>
            <div id="app"></div>
            <script type="text/javascript" src="${jsUri}"></script>
            <script type="text/javascript">
                var viewer = new molstar.Viewer('app', {
                    layoutIsExpanded: true,
                    layoutShowControls: true,
                    layoutShowRemoteState: false,
                    layoutShowSequence: true,
                    layoutShowLog: false,
                    layoutShowLeftPanel: true,
                    viewportShowExpand: true,
                    viewportShowSelectionMode: false,
                    viewportShowAnimation: false,
                    pdbProvider: 'rcsb',
                    emdbProvider: 'rcsb',
                });
                viewer.loadStructureFromUrl('${pdb_contents}', format='${extension}');
                // viewer.loadAllModelsOrAssemblyFromUrl('https://cs.litemol.org/5ire/full', 'mmcif', false, { representationParams: { theme: { globalName: 'operator-name' } } })
            </script>
        </body>
    </html>
    `;
    }
}
exports.ProteinViewerPanel = ProteinViewerPanel;
//# sourceMappingURL=ProteinViewerPanel.js.map