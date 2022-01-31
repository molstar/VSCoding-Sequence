import * as vscode from "vscode";

export class ProteinViewerPanel {
  public static currentPanel: ProteinViewerPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, accession: string | undefined, clickedFiles: vscode.Uri[] | undefined) {
    this._panel = panel;
    this._panel.onDidDispose(this.dispose, null, this._disposables);
    if (accession != undefined) {
      this._panel.webview.html = this._getWebviewContent(panel.webview, extensionUri, accession);
    };

    if (clickedFiles != undefined) {
      this._panel.webview.html = this._getWebviewContentForFiles(panel.webview, extensionUri, clickedFiles);
    };

  }

  public static render(extensionUri: vscode.Uri, accession: string | undefined) {
    const windowName = "Protein Viewer - " + accession;
    const panel = vscode.window.createWebviewPanel("proteinviewer", windowName, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true
    });
    if (accession?.length === 4) {
      var loadCommand = `viewer.loadPdb('${accession}');`
    } else {
      var loadCommand = `viewer.loadAlphaFoldDb('${accession}');`
    }
    ProteinViewerPanel.currentPanel = new ProteinViewerPanel(panel, extensionUri, loadCommand, undefined);
  }

  public static renderFromFiles(extensionUri: vscode.Uri, clickedFiles: vscode.Uri[]) {
    const fnames = clickedFiles.map((clickedFile) => clickedFile.path.split('/').pop());
    const windowName = "Protein Viewer - " + fnames.join(" - ");
    const panel = vscode.window.createWebviewPanel("proteinviewer", windowName, vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true
    });

    ProteinViewerPanel.currentPanel = new ProteinViewerPanel(panel, extensionUri, undefined, clickedFiles);
  }

  public dispose() {
    ProteinViewerPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, accession: string | undefined) {

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
            <title>Mol* Viewer</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                html, body {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                hr {
                    margin: 10px;
                }
                h1, h2, h3, h4, h5 {
                    margin-top: 5px;
                    margin-bottom: 3px;
                }
                button {
                    padding: 2px;
                }
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
                function getParam(name, regex) {
                    var r = new RegExp(name + '=' + '(' + regex + ')[&]?', 'i');
                    return decodeURIComponent(((window.location.search || '').match(r) || [])[1] || '');
                }
                var debugMode = getParam('debug-mode', '[^&]+').trim() === '1';
                if (debugMode) molstar.setDebugMode(debugMode, debugMode);

                var hideControls = getParam('hide-controls', '[^&]+').trim() === '1';
                var collapseLeftPanel = getParam('collapse-left-panel', '[^&]+').trim() === '1';
                var pdbProvider = getParam('pdb-provider', '[^&]+').trim().toLowerCase();
                var emdbProvider = getParam('emdb-provider', '[^&]+').trim().toLowerCase();
                var mapProvider = getParam('map-provider', '[^&]+').trim().toLowerCase();
                var pixelScale = getParam('pixel-scale', '[^&]+').trim();
                var pickScale = getParam('pick-scale', '[^&]+').trim();
                var pickPadding = getParam('pick-padding', '[^&]+').trim();
                var disableWboit = getParam('disable-wboit', '[^&]+').trim() === '1';
                var preferWebgl1 = getParam('prefer-webgl1', '[^&]+').trim() === '1' || void 0;

                molstar.Viewer.create('app', {
                    layoutShowControls: !hideControls,
                    viewportShowExpand: false,
                    collapseLeftPanel: collapseLeftPanel,
                    pdbProvider: pdbProvider || 'pdbe',
                    emdbProvider: emdbProvider || 'pdbe',
                    volumeStreamingServer: (mapProvider || 'pdbe') === 'rcsb'
                        ? 'https://maps.rcsb.org'
                        : 'https://www.ebi.ac.uk/pdbe/densities',
                    pixelScale: parseFloat(pixelScale) || 1,
                    pickScale: parseFloat(pickScale) || 0.25,
                    pickPadding: isNaN(parseFloat(pickPadding)) ? 1 : parseFloat(pickPadding),
                    enableWboit: disableWboit ? true : void 0, // use default value if disable-wboit is not set
                    preferWebgl1: preferWebgl1,
                }).then(viewer => {
                    var snapshotId = getParam('snapshot-id', '[^&]+').trim();
                    if (snapshotId) viewer.setRemoteSnapshot(snapshotId);
    
                    var snapshotUrl = getParam('snapshot-url', '[^&]+').trim();
                    var snapshotUrlType = getParam('snapshot-url-type', '[^&]+').toLowerCase().trim() || 'molj';
                    if (snapshotUrl && snapshotUrlType) viewer.loadSnapshotFromUrl(snapshotUrl, snapshotUrlType);
    
                    var structureUrl = getParam('structure-url', '[^&]+').trim();
                    var structureUrlFormat = getParam('structure-url-format', '[a-z]+').toLowerCase().trim();
                    var structureUrlIsBinary = getParam('structure-url-is-binary', '[^&]+').trim() === '1';
                    if (structureUrl) viewer.loadStructureFromUrl(structureUrl, structureUrlFormat, structureUrlIsBinary);
    
                    var pdb = getParam('pdb', '[^&]+').trim();
                    if (pdb) viewer.loadPdb(pdb);
    
                    var pdbDev = getParam('pdb-dev', '[^&]+').trim();
                    if (pdbDev) viewer.loadPdbDev(pdbDev);
    
                    var emdb = getParam('emdb', '[^&]+').trim();
                    if (emdb) viewer.loadEmdb(emdb);
    
                    // var afdb = getParam('afdb', '[^&]+').trim();
                    // if (afdb) 
                    // viewer.loadAlphaFoldDb('${accession}');
                    ${accession};
    
                    var modelArchive = getParam('model-archive', '[^&]+').trim();
                    if (modelArchive) viewer.loadModelArchive(modelArchive);
                });
            </script>
            <!-- __MOLSTAR_ANALYTICS__ -->
        </body>
    </html>
    `;
  }

  private _getWebviewContentForFiles(webview: vscode.Webview, extensionUri: vscode.Uri, clickedFiles: vscode.Uri[]) {
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'molstar', 'build/viewer', 'molstar.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'molstar', 'build/viewer', 'molstar.js'));
    const pdbContents = clickedFiles.map((clickedFile) => webview.asWebviewUri(clickedFile));
    const extensions = clickedFiles.map((clickedFile) => clickedFile.path.split('.').pop());
    let loadCommands: String[] = [];
    for (let i = 0; i < pdbContents.length; i++) {
      const pdbContent = pdbContents[i];
      const extension = extensions[i];
      loadCommands.push(
        `viewer.loadStructureFromUrl('${pdbContent}', format='${extension}');`
      );
    }
    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
            <link rel="icon" href="./favicon.ico" type="image/x-icon">
            <title>Mol* Viewer</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                html, body {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                hr {
                    margin: 10px;
                }
                h1, h2, h3, h4, h5 {
                    margin-top: 5px;
                    margin-bottom: 3px;
                }
                button {
                    padding: 2px;
                }
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
                function getParam(name, regex) {
                    var r = new RegExp(name + '=' + '(' + regex + ')[&]?', 'i');
                    return decodeURIComponent(((window.location.search || '').match(r) || [])[1] || '');
                }
                var debugMode = getParam('debug-mode', '[^&]+').trim() === '1';
                if (debugMode) molstar.setDebugMode(debugMode, debugMode);

                var hideControls = getParam('hide-controls', '[^&]+').trim() === '1';
                var collapseLeftPanel = getParam('collapse-left-panel', '[^&]+').trim() === '1';
                var pdbProvider = getParam('pdb-provider', '[^&]+').trim().toLowerCase();
                var emdbProvider = getParam('emdb-provider', '[^&]+').trim().toLowerCase();
                var mapProvider = getParam('map-provider', '[^&]+').trim().toLowerCase();
                var pixelScale = getParam('pixel-scale', '[^&]+').trim();
                var pickScale = getParam('pick-scale', '[^&]+').trim();
                var pickPadding = getParam('pick-padding', '[^&]+').trim();
                var disableWboit = getParam('disable-wboit', '[^&]+').trim() === '1';
                var preferWebgl1 = getParam('prefer-webgl1', '[^&]+').trim() === '1' || void 0;

                molstar.Viewer.create('app', {
                    layoutShowControls: !hideControls,
                    viewportShowExpand: false,
                    collapseLeftPanel: collapseLeftPanel,
                    pdbProvider: pdbProvider || 'pdbe',
                    emdbProvider: emdbProvider || 'pdbe',
                    volumeStreamingServer: (mapProvider || 'pdbe') === 'rcsb'
                        ? 'https://maps.rcsb.org'
                        : 'https://www.ebi.ac.uk/pdbe/densities',
                    pixelScale: parseFloat(pixelScale) || 1,
                    pickScale: parseFloat(pickScale) || 0.25,
                    pickPadding: isNaN(parseFloat(pickPadding)) ? 1 : parseFloat(pickPadding),
                    enableWboit: disableWboit ? true : void 0, // use default value if disable-wboit is not set
                    preferWebgl1: preferWebgl1,
                }).then(viewer => {
                    var snapshotId = getParam('snapshot-id', '[^&]+').trim();
                    if (snapshotId) viewer.setRemoteSnapshot(snapshotId);
    
                    var snapshotUrl = getParam('snapshot-url', '[^&]+').trim();
                    var snapshotUrlType = getParam('snapshot-url-type', '[^&]+').toLowerCase().trim() || 'molj';
                    if (snapshotUrl && snapshotUrlType) viewer.loadSnapshotFromUrl(snapshotUrl, snapshotUrlType);
    
                    var structureUrl = getParam('structure-url', '[^&]+').trim();
                    var structureUrlFormat = getParam('structure-url-format', '[a-z]+').toLowerCase().trim();
                    var structureUrlIsBinary = getParam('structure-url-is-binary', '[^&]+').trim() === '1';
                    if (structureUrl) viewer.loadStructureFromUrl(structureUrl, structureUrlFormat, structureUrlIsBinary);

                    ${loadCommands.join("")}

                    var modelArchive = getParam('model-archive', '[^&]+').trim();
                    if (modelArchive) viewer.loadModelArchive(modelArchive);
                });
            </script>
            <!-- __MOLSTAR_ANALYTICS__ -->
        </body>
    </html>`;
  }
}
