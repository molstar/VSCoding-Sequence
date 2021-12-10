# VSCoding-Sequence :dna: :test_tube::microscope:

<img src="img/logo.png" alt="drawing" width="200"/>


[![Version](https://vsmarketplacebadge.apphb.com/version/ArianJamasb.protein-viewer.svg?color=blue&style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=ArianJamasb.protein-viewer)
[![vscode last updated](https://img.shields.io/visual-studio-marketplace/last-updated/ArianJamasb.protein-viewer)](https://marketplace.visualstudio.com/items?itemName=ArianJamasb.protein-viewer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![vscode downloads](https://img.shields.io/visual-studio-marketplace/i/ArianJamasb.protein-viewer)](https://marketplace.visualstudio.com/items?itemName=ArianJamasb.protein-viewer) [![Downloads](https://vsmarketplacebadge.apphb.com/downloads/ArianJamasb.protein-viewer.svg?color=orange)](https://marketplace.visualstudio.com/items?itemName=ArianJamasb.protein-viewer)
[![Trending-Weekly](https://vsmarketplacebadge.apphb.com/trending-weekly/ArianJamasb.protein-viewer.svg?logo=tinder&logoColor=white&label=trending%20weekly)](https://marketplace.visualstudio.com/items?itemName=ArianJamasb.protein-viewer) [![Trending-Monthly](https://vsmarketplacebadge.apphb.com/trending-monthly/ArianJamasb.protein-viewer.svg?logo=tinder&logoColor=white&label=monthly)](https://marketplace.visualstudio.com/items?itemName=ArianJamasb.protein-viewer)


VSCoding Sequence allows for visualisation of protein structures and molecular data in the editor, courtesy of the fantastic [Mol*](https://molstar.org/)


:books: [Viewer Docs](https://molstar.org/viewer-docs/) | [Mol* Docs](https://molstar.org/docs/)

## :package: Features
### :inbox_tray: Loading a Protein Structure from the [PDB](https://www.rcsb.org/)

![Usage gif](img/usage.gif)

Open the command palette (`⌘ + ⇧ + p`) and simply call the `Start Protein Viewer` command, enter a [PDB accession code](https://www.rcsb.org/) & away you go!

### :spiral_calendar: Loading Local File(s)

![Local file usage gif](img/local_file.gif)

Right-click on the file or selection of files in the file editor and select `Launch Protein Viewer from File(s)`

**:white_check_mark: Supported Formats**

* `.pdb`
* `.pdbqt`
* `.mmcif`
* `.gro`
* `.xyz`
* `.cif`
* `.mol`
* `.mol2`
* `.sdf`

### :open_file_folder: Loading a Local Folder
![Local folder usage gif](img/local_folder.gif)

Right-click on the folder in the file explorer and select `Launch Protein Viewer from Folder`

## :gear: Usage
*The below is taken from the [Mol\* viewer docs](https://molstar.org/viewer-docs/) which is based on the [RCSB PDB mol* documentation](https://www.rcsb.org/3d-view/molstar/help/getting-started) thanks to the generosity of [RCSB PDB](https://www.rcsb.org/) and Dr. Shuchismita Dutta.*
### :earth_americas: Interface
![Viewer Layout](https://molstar.org/viewer-docs/img/generalinterface3.png)

**3D Canvas**: This is the space where a PDB structure is displayed for manipulation in three dimensions (3D). It is located on the left side of the screen.

**Toggle Menu**: This menu provides users quick access to some commonly used operations for the 3D canvas. It is located towards the right side of the 3D canvas and has the following functions.


| Function  | Description  | Icon  |
|---|---|---|
|Reset Camera |  Centers and resets the view of the structure on the 3D canvas | ![Rest Camera Icon](https://molstar.org/viewer-docs/img/resetcameraicon.png)  |
|Screenshot/State Snapshot | Takes an image of the structure as shown and gives options for resolution and download | ![Screenshot.State Snapshot Icon](https://molstar.org/viewer-docs/img/screenshoticon.png)  |
|Controls Panel | Hides/shows the Controls Panel to the right | ![Control Panel Icon](https://molstar.org/viewer-docs/img/controlpanelicon.png)  |
|Expanded Viewport | Expands 3D canvas and Controls Panel to the full browser screen |![Expanded Viewport Icon](https://molstar.org/viewer-docs/img/expandedviewporticon.png) |
|Settings/Control Info | Provides settings for viewing of 3D canvas, as well as information about moving in 3D and mouse controls| ![Settings/Control Info Icon](https://molstar.org/viewer-docs/img/settingsicon.png)|
|[Selection Mode](https://molstar.org/viewer-docs/making-selections/#selection-mode) |Switches from Default Mode to Selection Mode |![Selection Mode Icon](https://molstar.org/viewer-docs/img/selectionmodeicon.png) |

**[Sequence Panel](https://molstar.org/viewer-docs/navigating-by-sequence/#sequence-panel)**: This menu displays the polymer sequences of macromolecules (proteins and nucleic acids) present in the uploaded PDB structures. In addition, it provides quick access to any small molecular ligands or entities present in the structure(s). It is located at the top of the screen above the 3D Canvas.

**[Controls Panel](https://molstar.org/viewer-docs/managing-the-display/#controls-panel)**: This menu has the following panels for structure manipulation. It is located at the right side of the screen.
* [Structure](https://molstar.org/viewer-docs/managing-the-display/#structure-panel)
* [Measurements](https://molstar.org/viewer-docs/managing-the-display/#measurements-panel)
* [Components](https://molstar.org/viewer-docs/managing-the-display/#components-panel)
* [Density](https://molstar.org/viewer-docs/managing-the-display/#density-panel)
* [Assembly Symmetry](https://molstar.org/viewer-docs/managing-the-display/#assembly-symmetry-panel)
* [Import](https://molstar.org/viewer-docs/managing-the-display/#import-panel)
* [Session](https://molstar.org/viewer-docs/managing-the-display/#session-panel)
* [Superposition](https://molstar.org/viewer-docs/managing-the-display/#superposition-panel)

**Log Panel**: This panel shows various logs containing information about actions taken while viewing the structure. This is located at the bottom of the screen below the 3D Canvas.

### :mouse: Mouse Controls
All the interactions with the molecule(s) uploaded in Mol* require using mouse controls (in the 3D canvas). These controls allow the user to manipulate the view of structures via a variety of functions such as rotating, translating, zooming, and clipping the structures. When not specified, a “click” refers to pressing the left mouse button or tapping a single finger on a touchscreen. If an action is available for the right mouse button, it can also be completed by using the Control button + left mouse button. The general mouse controls are listed below:

* **Rotate**: click the left mouse button and move. Alternatively, use the Shift button + left mouse button and drag to rotate the canvas.
* **Translate**: click the right mouse button and move. Alternatively, use the Control button + the left mouse button and move. On a touchscreen device, use a two-finger drag.
* **Zoom**: use the mouse wheel. On a touchpad, use a two-finger drag. On a touchscreen device, pinch two fingers.
* **Center and zoom**: use the right mouse button to click onto the part of the structure you wish to focus on.
* **Clip**: use the Shift button + the mouse wheel to change the clipping planes. On a touchpad, use the Shift button + a two-finger drag.

Moving the mouse over (or hovering over) any part of the 3D structure displayed in the 3D canvas, without clicking on it, will highlight it (by coloring it in magenta) according to the [Picking Level](https://molstar.org/viewer-docs/making-selections/#picking-level) currently selected. Additionally, in the lower right corner of the 3D canvas, information about the PDB ID, model number, instance, chain ID, residue number, and chain name is listed for the highlighted part of the structure.

As you interact with the structure using the mouse, Mol* contains two modes for which the behavior of a click is different. As a result, each mode enables unique operations to be performed. To switch between the two modes, use the Selection Mode icon (shaped like a cursor) that appears in the Toggle Menu. The list below summarizes Default Mode and Selection Mode.

* **Default Mode**: A click on a residue (or any object in 3D) will focus on it. The focused residue and its surroundings (residues and ligands) will be displayed in a ball & stick representation. All local non-covalent interactions will be shown. To hide the surroundings, click on the target residue again.
* **[Selection Mode](https://molstar.org/viewer-docs/making-selections/#selection-mode)**: A click on a residue (or any object in 3D) will select it. What exactly will be selected depends on the value of the [Picking Level](https://molstar.org/viewer-docs/making-selections/#picking-level). Selected parts of the structure will appear with a bright green tint in the 3D canvas and in the [Sequence Panel](https://molstar.org/viewer-docs/navigating-by-sequence/#sequence-panel). When selecting polymers with the Picking Level set to “residue,” holding the Shift key while clicking will extend the selection along the polymer from the last clicked residue on. Clicking on any point in the 3D canvas that has no atom will clear the selection.

## :magnet: Installation
* The extension can be downloaded/installed from the [VSCode marketplace](https://marketplace.visualstudio.com/items?itemName=ArianJamasb.protein-viewer)

* Altenatively, enter `⌘ + ⇧ + x` in VSCode and search for `Protein Viewer`


## :mailbox_with_mail: Community
### Support
Need help? Please [open an issue](https://github.com/a-r-j/vscoding-sequence/issues/new/choose) for support.

### Discussion
Find me on twitter: [@arian_jamasb](https://twitter.com/arian_jamasb) or drop me an email: [arian@jamasb.io](mailto:arian@jamasb.io)

## :tornado: Change log

### 0.0.5
* Adds ability to launch a viewer from a selection of multiple supported files.


### 0.0.4
* Adds support to open folders from explorer

### 0.0.3
* Update docs & package metadata
* Fixes issue that viewer would autorefresh and lose state when switching between views.

Adds support for additional filetypes:
* `.pdbqt`
* `.mmcif`
* `.gro`
* `.xyz`
* `.cif`

Adds support for molecules:
* `.mol`
* `.mol2`
* `.sdf`

### 0.0.2

* Adds Right-click open from context menu
* Enables opening of multiple panels
* Adds PDB name to panel

### 0.0.1

Initial release!

## :books: Reference

If this extension proves useful, you should cite the developers of Mol*

```bibtex
@article{10.1093/nar/gkab314,
    author = {Sehnal, David and Bittrich, Sebastian and Deshpande, Mandar and Svobodová, Radka and Berka, Karel and Bazgier, Václav and Velankar, Sameer and Burley, Stephen K and Koča, Jaroslav and Rose, Alexander S},
    title = "{Mol* Viewer: modern web app for 3D visualization and analysis of large biomolecular structures}",
    journal = {Nucleic Acids Research},
    volume = {49},
    number = {W1},
    pages = {W431-W437},
    year = {2021},
    month = {05},
    abstract = "{Large biomolecular structures are being determined experimentally on a daily basis using established techniques such as crystallography and electron microscopy. In addition, emerging integrative or hybrid methods (I/HM) are producing structural models of huge macromolecular machines and assemblies, sometimes containing 100s of millions of non-hydrogen atoms. The performance requirements for visualization and analysis tools delivering these data are increasing rapidly. Significant progress in developing online, web-native three-dimensional (3D) visualization tools was previously accomplished with the introduction of the LiteMol suite and NGL Viewers. Thereafter, Mol* development was jointly initiated by PDBe and RCSB PDB to combine and build on the strengths of LiteMol (developed by PDBe) and NGL (developed by RCSB PDB). The web-native Mol* Viewer enables 3D visualization and streaming of macromolecular coordinate and experimental data, together with capabilities for displaying structure quality, functional, or biological context annotations. High-performance graphics and data management allows users to simultaneously visualise up to hundreds of (superimposed) protein structures, stream molecular dynamics simulation trajectories, render cell-level models, or display huge I/HM structures. It is the primary 3D structure viewer used by PDBe and RCSB PDB. It can be easily integrated into third-party services. Mol* Viewer is open source and freely available at https://molstar.org/.}",
    issn = {0305-1048},
    doi = {10.1093/nar/gkab314},
    url = {https://doi.org/10.1093/nar/gkab314},
    eprint = {https://academic.oup.com/nar/article-pdf/49/W1/W431/38842088/gkab314.pdf},
}
```
