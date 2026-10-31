"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperpositionControls = exports.StructureSuperpositionParams = exports.StructureSuperpositionControls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const sifts_mapping_1 = require("../../mol-model-props/sequence/sifts-mapping");
const structure_1 = require("../../mol-model/structure");
const superposition_1 = require("../../mol-model/structure/structure/util/superposition");
const superposition_sifts_mapping_1 = require("../../mol-model/structure/structure/util/superposition-sifts-mapping");
const structure_selection_query_1 = require("../../mol-plugin-state/helpers/structure-selection-query");
const objects_1 = require("../../mol-plugin-state/objects");
const transforms_1 = require("../../mol-plugin-state/transforms");
const commands_1 = require("../../mol-plugin/commands");
const config_1 = require("../../mol-plugin/config");
const mol_state_1 = require("../../mol-state");
const label_1 = require("../../mol-theme/label");
const param_definition_1 = require("../../mol-util/param-definition");
const string_1 = require("../../mol-util/string");
const base_1 = require("../base");
const common_1 = require("../controls/common");
const icons_1 = require("../controls/icons");
const parameters_1 = require("../controls/parameters");
const selection_1 = require("./selection");
class StructureSuperpositionControls extends base_1.CollapsableControls {
    defaultState() {
        return {
            isCollapsed: false,
            header: 'Superposition',
            brand: { accent: 'gray', svg: icons_1.SuperpositionSvg },
            isHidden: true
        };
    }
    componentDidMount() {
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, sel => {
            this.setState({ isHidden: sel.structures.length < 2 });
        });
    }
    renderControls() {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(SuperpositionControls, {}) });
    }
}
exports.StructureSuperpositionControls = StructureSuperpositionControls;
exports.StructureSuperpositionParams = {
    alignSequences: param_definition_1.ParamDefinition.Boolean(true, { isEssential: true, description: 'For Chain-based 3D superposition, perform a sequence alignment and use the aligned residue pairs to guide the 3D superposition.' }),
    traceOnly: param_definition_1.ParamDefinition.Boolean(true, { description: 'For Chain- and Uniprot-based 3D superposition, base superposition only on CA (and equivalent) atoms.' })
};
const DefaultStructureSuperpositionOptions = param_definition_1.ParamDefinition.getDefaultValues(exports.StructureSuperpositionParams);
const SuperpositionTag = 'SuperpositionTransform';
;
;
class SuperpositionControls extends base_1.PurePluginUIComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isBusy: false,
            canUseDb: false,
            action: undefined,
            options: DefaultStructureSuperpositionOptions
        };
        this.superposeChains = async () => {
            var _a, _b, _c;
            const { query } = this.state.options.traceOnly ? structure_selection_query_1.StructureSelectionQueries.trace : structure_selection_query_1.StructureSelectionQueries.polymer;
            const entries = this.chainEntries;
            const locis = entries.map(e => {
                const s = structure_1.StructureElement.Loci.toStructure(e.loci);
                const loci = structure_1.StructureSelection.toLociWithSourceUnits(query(new structure_1.QueryContext(s)));
                return structure_1.StructureElement.Loci.remap(loci, this.getRootStructure(e.loci.structure));
            });
            const pivot = this.plugin.managers.structure.hierarchy.findStructure((_a = locis[0]) === null || _a === void 0 ? void 0 : _a.structure);
            const coordinateSystem = (_c = (_b = pivot === null || pivot === void 0 ? void 0 : pivot.transform) === null || _b === void 0 ? void 0 : _b.cell.obj) === null || _c === void 0 ? void 0 : _c.data.coordinateSystem;
            const transforms = this.state.options.alignSequences
                ? (0, superposition_1.alignAndSuperpose)(locis)
                : (0, superposition_1.superpose)(locis);
            const eA = entries[0];
            for (let i = 1, il = locis.length; i < il; ++i) {
                const eB = entries[i];
                const { bTransform, rmsd } = transforms[i - 1];
                await this.transform(eB.cell, bTransform, coordinateSystem);
                const labelA = (0, string_1.stripTags)(eA.label);
                const labelB = (0, string_1.stripTags)(eB.label);
                this.plugin.log.info(`Superposed [${labelA}] and [${labelB}] with RMSD ${rmsd.toFixed(2)}.`);
            }
            await this.cameraReset();
        };
        this.superposeAtoms = async () => {
            var _a, _b, _c;
            const entries = this.atomEntries;
            const atomLocis = entries.map(e => {
                return structure_1.StructureElement.Loci.remap(e.loci, this.getRootStructure(e.loci.structure));
            });
            const transforms = (0, superposition_1.superpose)(atomLocis);
            const pivot = this.plugin.managers.structure.hierarchy.findStructure((_a = atomLocis[0]) === null || _a === void 0 ? void 0 : _a.structure);
            const coordinateSystem = (_c = (_b = pivot === null || pivot === void 0 ? void 0 : pivot.transform) === null || _b === void 0 ? void 0 : _b.cell.obj) === null || _c === void 0 ? void 0 : _c.data.coordinateSystem;
            const eA = entries[0];
            for (let i = 1, il = atomLocis.length; i < il; ++i) {
                const eB = entries[i];
                const { bTransform, rmsd } = transforms[i - 1];
                await this.transform(eB.cell, bTransform, coordinateSystem);
                const labelA = (0, string_1.stripTags)(eA.label);
                const labelB = (0, string_1.stripTags)(eB.label);
                const count = entries[i].atoms.length;
                this.plugin.log.info(`Superposed ${count} ${count === 1 ? 'atom' : 'atoms'} of [${labelA}] and [${labelB}] with RMSD ${rmsd.toFixed(2)}.`);
            }
            await this.cameraReset();
        };
        this.superposeDb = async () => {
            var _a, _b, _c;
            const input = this.plugin.managers.structure.hierarchy.behaviors.selection.value.structures;
            const traceOnly = this.state.options.traceOnly;
            const structures = input.map(s => { var _a; return (_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data; });
            const { entries, failedPairs, zeroOverlapPairs } = (0, superposition_sifts_mapping_1.alignAndSuperposeWithSIFTSMapping)(structures, { traceOnly });
            const coordinateSystem = (_c = (_b = (_a = input[0]) === null || _a === void 0 ? void 0 : _a.transform) === null || _b === void 0 ? void 0 : _b.cell.obj) === null || _c === void 0 ? void 0 : _c.data.coordinateSystem;
            let rmsd = 0;
            for (const xform of entries) {
                await this.transform(input[xform.other].cell, xform.transform.bTransform, coordinateSystem);
                rmsd += xform.transform.rmsd;
            }
            rmsd /= Math.max(entries.length - 1, 1);
            const formatPairs = (pairs) => {
                return `[${pairs.map(([i, j]) => `(${structures[i].models[0].entryId}, ${structures[j].models[0].entryId})`).join(', ')}]`;
            };
            if (zeroOverlapPairs.length) {
                this.plugin.log.warn(`Superposition: No UNIPROT mapping overlap between structures ${formatPairs(zeroOverlapPairs)}.`);
            }
            if (failedPairs.length) {
                this.plugin.log.error(`Superposition: Failed to superpose structures ${formatPairs(failedPairs)}.`);
            }
            if (entries.length) {
                this.plugin.log.info(`Superposed ${entries.length + 1} structures with avg. RMSD ${rmsd.toFixed(2)} Å.`);
                await this.cameraReset();
            }
        };
        this.toggleByChains = () => this.setState({ action: this.state.action === 'byChains' ? void 0 : 'byChains' });
        this.toggleByAtoms = () => this.setState({ action: this.state.action === 'byAtoms' ? void 0 : 'byAtoms' });
        this.toggleOptions = () => this.setState({ action: this.state.action === 'options' ? void 0 : 'options' });
        this.setOptions = (values) => {
            this.setState({ options: values });
        };
    }
    componentDidMount() {
        this.subscribe(this.selection.events.changed, () => {
            this.forceUpdate();
        });
        this.subscribe(this.selection.events.additionsHistoryUpdated, () => {
            this.forceUpdate();
        });
        this.subscribe(this.plugin.behaviors.state.isBusy, v => {
            this.setState({ isBusy: v });
        });
        this.subscribe(this.plugin.managers.structure.hierarchy.behaviors.selection, sel => {
            this.setState({ canUseDb: sel.structures.every(s => { var _a; return !!((_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data) && s.cell.obj.data.models.some(m => sifts_mapping_1.SIFTSMapping.Provider.isApplicable(m)); }) });
        });
    }
    get selection() {
        return this.plugin.managers.structure.selection;
    }
    async transform(s, matrix, coordinateSystem) {
        const r = mol_state_1.StateObjectRef.resolveAndCheck(this.plugin.state.data, s);
        if (!r)
            return;
        const o = this.plugin.state.data.selectQ(q => q.byRef(r.transform.ref).subtree().withTransformer(transforms_1.StateTransforms.Model.TransformStructureConformation))[0];
        const transform = coordinateSystem && !linear_algebra_1.Mat4.isIdentity(coordinateSystem.matrix)
            ? linear_algebra_1.Mat4.mul((0, linear_algebra_1.Mat4)(), coordinateSystem.matrix, matrix)
            : matrix;
        const params = {
            transform: {
                name: 'matrix',
                params: { data: transform, transpose: false }
            }
        };
        const b = o
            ? this.plugin.state.data.build().to(o).update(params)
            : this.plugin.state.data.build().to(s)
                .insert(transforms_1.StateTransforms.Model.TransformStructureConformation, params, { tags: SuperpositionTag });
        await this.plugin.runTask(this.plugin.state.data.updateTree(b));
    }
    getRootStructure(s) {
        var _a;
        const parent = this.plugin.helpers.substructureParent.get(s);
        return (_a = this.plugin.state.data.selectQ(q => q.byValue(parent).rootOfType(objects_1.PluginStateObject.Molecule.Structure))[0].obj) === null || _a === void 0 ? void 0 : _a.data;
    }
    async cameraReset() {
        await new Promise(res => requestAnimationFrame(res));
        commands_1.PluginCommands.Camera.Reset(this.plugin);
    }
    highlight(loci) {
        this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci }, false);
    }
    moveHistory(e, direction) {
        this.plugin.managers.structure.selection.modifyHistory(e, direction, void 0, true);
    }
    focusLoci(loci) {
        this.plugin.managers.camera.focusLoci(loci);
    }
    lociEntry(e, idx) {
        return (0, jsx_runtime_1.jsx)("div", { className: 'msp-flex-row', children: (0, jsx_runtime_1.jsx)(common_1.Button, { noOverflow: true, title: 'Click to focus. Hover to highlight.', onClick: () => this.focusLoci(e.loci), style: { width: 'auto', textAlign: 'left' }, onMouseEnter: () => this.highlight(e.loci), onMouseLeave: () => this.plugin.managers.interactivity.lociHighlights.clearHighlights(), children: (0, jsx_runtime_1.jsx)("span", { dangerouslySetInnerHTML: { __html: e.label } }) }) }, idx);
    }
    historyEntry(e, idx) {
        const history = this.plugin.managers.structure.selection.additionsHistory;
        return (0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsxs)(common_1.Button, { noOverflow: true, title: 'Click to focus. Hover to highlight.', onClick: () => this.focusLoci(e.loci), style: { width: 'auto', textAlign: 'left' }, onMouseEnter: () => this.highlight(e.loci), onMouseLeave: () => this.plugin.managers.interactivity.lociHighlights.clearHighlights(), children: [idx, ". ", (0, jsx_runtime_1.jsx)("span", { dangerouslySetInnerHTML: { __html: e.label } })] }), history.length > 1 && (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.ArrowUpwardSvg, small: true, className: 'msp-form-control', onClick: () => this.moveHistory(e, 'up'), flex: '20px', title: 'Move up' }), history.length > 1 && (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.ArrowDownwardSvg, small: true, className: 'msp-form-control', onClick: () => this.moveHistory(e, 'down'), flex: '20px', title: 'Move down' }), (0, jsx_runtime_1.jsx)(common_1.IconButton, { svg: icons_1.DeleteOutlinedSvg, small: true, className: 'msp-form-control', onClick: () => this.plugin.managers.structure.selection.modifyHistory(e, 'remove'), flex: true, title: 'Remove' })] }, e.id);
    }
    atomsLociEntry(e, idx) {
        return (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { className: 'msp-control-group-header', children: (0, jsx_runtime_1.jsx)("div", { className: 'msp-no-overflow', title: e.label, children: e.label }) }), (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', children: e.atoms.map((h, i) => this.historyEntry(h, i)) })] }, idx);
    }
    get chainEntries() {
        const location = structure_1.StructureElement.Location.create();
        const entries = [];
        this.plugin.managers.structure.selection.entries.forEach(({ selection }, ref) => {
            const cell = mol_state_1.StateObjectRef.resolveAndCheck(this.plugin.state.data, ref);
            if (!cell || structure_1.StructureElement.Loci.isEmpty(selection))
                return;
            // only single polymer chain selections
            const l = structure_1.StructureElement.Loci.getFirstLocation(selection, location);
            if (selection.elements.length > 1 || structure_1.StructureProperties.entity.type(l) !== 'polymer')
                return;
            const stats = structure_1.StructureElement.Stats.ofLoci(selection);
            const counts = (0, label_1.structureElementStatsLabel)(stats, { countsOnly: true });
            const chain = (0, label_1.elementLabel)(l, { reverse: true, granularity: 'chain' }).split('|');
            const label = `${counts} | ${chain[0]} | ${chain[chain.length - 1]}`;
            entries.push({ loci: selection, label, cell });
        });
        return entries;
    }
    get atomEntries() {
        const structureEntries = new Map();
        const history = this.plugin.managers.structure.selection.additionsHistory;
        for (let i = 0, il = history.length; i < il; ++i) {
            const e = history[i];
            if (structure_1.StructureElement.Loci.size(e.loci) !== 1)
                continue;
            const k = e.loci.structure;
            if (structureEntries.has(k))
                structureEntries.get(k).push(e);
            else
                structureEntries.set(k, [e]);
        }
        const entries = [];
        structureEntries.forEach((atoms, structure) => {
            const cell = this.plugin.helpers.substructureParent.get(structure);
            const elements = [];
            for (let i = 0, il = atoms.length; i < il; ++i) {
                // note, we don't do loci union here to keep order of selected atoms
                // for atom pairing during superposition
                elements.push(atoms[i].loci.elements[0]);
            }
            const loci = structure_1.StructureElement.Loci(atoms[0].loci.structure, elements);
            const label = loci.structure.label.split(' | ')[0];
            entries.push({ loci, label, cell, atoms });
        });
        return entries;
    }
    toggleHint() {
        const shouldShowToggleHint = this.plugin.config.get(config_1.PluginConfig.Viewport.ShowSelectionMode);
        return shouldShowToggleHint ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [' ', "(toggle ", (0, jsx_runtime_1.jsx)(selection_1.ToggleSelectionModeButton, { inline: true }), " mode)"] })) : null;
    }
    addByChains() {
        const entries = this.chainEntries;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [entries.length > 0 && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', children: entries.map((e, i) => this.lociEntry(e, i)) }), entries.length < 2 && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset msp-help-text', children: (0, jsx_runtime_1.jsxs)("div", { className: 'msp-help-description', children: [(0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.HelpOutlineSvg, inline: true }), "Add 2 or more selections", this.toggleHint(), " from separate structures. Selections must be limited to single polymer chains or residues therein."] }) }), entries.length > 1 && (0, jsx_runtime_1.jsx)(common_1.Button, { title: 'Superpose structures by selected chains.', className: 'msp-btn-commit msp-btn-commit-on', onClick: this.superposeChains, style: { marginTop: '1px' }, children: "Superpose" })] });
    }
    addByAtoms() {
        const entries = this.atomEntries;
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [entries.length > 0 && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', children: entries.map((e, i) => this.atomsLociEntry(e, i)) }), entries.length < 2 && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset msp-help-text', children: (0, jsx_runtime_1.jsxs)("div", { className: 'msp-help-description', children: [(0, jsx_runtime_1.jsx)(icons_1.Icon, { svg: icons_1.HelpOutlineSvg, inline: true }), "Add 1 or more selections", this.toggleHint(), " from separate structures. Selections must be limited to single atoms."] }) }), entries.length > 1 && (0, jsx_runtime_1.jsx)(common_1.Button, { title: 'Superpose structures by selected atoms.', className: 'msp-btn-commit msp-btn-commit-on', onClick: this.superposeAtoms, style: { marginTop: '1px' }, children: "Superpose" })] });
    }
    superposeByDbMapping() {
        return (0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)(common_1.Button, { icon: icons_1.SuperposeChainsSvg, title: 'Superpose structures using intersection of residues from SIFTS UNIPROT mapping.', className: 'msp-btn msp-btn-block', onClick: this.superposeDb, style: { marginTop: '1px' }, disabled: this.state.isBusy, children: "Uniprot" }) });
    }
    render() {
        return (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: 'msp-flex-row', children: [(0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.SuperposeChainsSvg, label: 'Chains', toggle: this.toggleByChains, isSelected: this.state.action === 'byChains', disabled: this.state.isBusy }), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.SuperposeAtomsSvg, label: 'Atoms', toggle: this.toggleByAtoms, isSelected: this.state.action === 'byAtoms', disabled: this.state.isBusy }), this.state.canUseDb && this.superposeByDbMapping(), (0, jsx_runtime_1.jsx)(common_1.ToggleButton, { icon: icons_1.TuneSvg, label: '', title: 'Options', toggle: this.toggleOptions, isSelected: this.state.action === 'options', disabled: this.state.isBusy, style: { flex: '0 0 40px', padding: 0 } })] }), this.state.action === 'byChains' && this.addByChains(), this.state.action === 'byAtoms' && this.addByAtoms(), this.state.action === 'options' && (0, jsx_runtime_1.jsx)("div", { className: 'msp-control-offset', children: (0, jsx_runtime_1.jsx)(parameters_1.ParameterControls, { params: exports.StructureSuperpositionParams, values: this.state.options, onChangeValues: this.setOptions, isDisabled: this.state.isBusy }) })] });
    }
}
exports.SuperpositionControls = SuperpositionControls;
