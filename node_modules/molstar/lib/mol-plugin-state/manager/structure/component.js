/**
 * Copyright (c) 2019-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { VisualQualityOptions } from '../../../mol-geo/geometry/base';
import { InteractionsProvider } from '../../../mol-model-props/computed/interactions';
import { Structure, StructureElement, StructureSelection } from '../../../mol-model/structure';
import { structureAreEqual, structureAreIntersecting, structureIntersect, structureSubtract, structureUnion } from '../../../mol-model/structure/query/utils/structure-set';
import { setSubtreeVisibility } from '../../../mol-plugin/behavior/static/state';
import { Task } from '../../../mol-task';
import { shallowEqual, UUID } from '../../../mol-util';
import { ColorNames } from '../../../mol-util/color/names';
import { objectForEach } from '../../../mol-util/object';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { StatefulPluginComponent } from '../../component';
import { setStructureOverpaint } from '../../helpers/structure-overpaint';
import { createStructureColorThemeParams, createStructureSizeThemeParams } from '../../helpers/structure-representation-params';
import { StructureSelectionQueries } from '../../helpers/structure-selection-query';
import { StructureRepresentation3D } from '../../transforms/representation';
import { Clipping } from '../../../mol-theme/clipping';
import { setStructureClipping } from '../../helpers/structure-clipping';
import { setStructureTransparency } from '../../helpers/structure-transparency';
import { StructureFocusRepresentation } from '../../../mol-plugin/behavior/dynamic/selection/structure-focus-representation';
import { setStructureSubstance } from '../../helpers/structure-substance';
import { Material } from '../../../mol-util/material';
import { Clip } from '../../../mol-util/clip';
import { setStructureEmissive } from '../../helpers/structure-emissive';
export { StructureComponentManager };
class StructureComponentManager extends StatefulPluginComponent {
    get currentStructures() {
        return this.plugin.managers.structure.hierarchy.selection.structures;
    }
    get pivotStructure() {
        return this.currentStructures[0];
    }
    // To be used only from PluginState.setSnapshot
    _setSnapshotState(options) {
        this.updateState({ options });
        this.events.optionsUpdated.next(void 0);
    }
    async setOptions(options) {
        const interactionChanged = options.interactions !== this.state.options.interactions;
        this.updateState({ options });
        this.events.optionsUpdated.next(void 0);
        const update = this.dataState.build();
        for (const s of this.currentStructures) {
            for (const c of s.components) {
                this.updateReprParams(update, c);
            }
        }
        return this.plugin.dataTransaction(async () => {
            await update.commit();
            await this.plugin.state.updateBehavior(StructureFocusRepresentation, p => {
                p.ignoreHydrogens = options.hydrogens !== 'all';
                p.ignoreHydrogensVariant = options.hydrogens === 'only-polar' ? 'non-polar' : 'all';
                p.ignoreLight = options.ignoreLight;
                p.material = options.materialStyle;
                p.clip = options.clipObjects;
            });
            if (interactionChanged)
                await this.updateInterationProps();
        });
    }
    updateReprParams(update, component) {
        const { hydrogens, visualQuality: quality, ignoreLight, materialStyle: material, clipObjects: clip } = this.state.options;
        const ignoreHydrogens = hydrogens !== 'all';
        const ignoreHydrogensVariant = hydrogens === 'only-polar' ? 'non-polar' : 'all';
        for (const r of component.representations) {
            if (r.cell.transform.transformer !== StructureRepresentation3D)
                continue;
            const params = r.cell.transform.params;
            if (!!params.type.params.ignoreHydrogens !== ignoreHydrogens || params.type.params.ignoreHydrogensVariant !== ignoreHydrogensVariant || params.type.params.quality !== quality || params.type.params.ignoreLight !== ignoreLight || !shallowEqual(params.type.params.material, material) || !PD.areEqual(Clip.Params, params.type.params.clip, clip)) {
                update.to(r.cell).update(old => {
                    old.type.params.ignoreHydrogens = ignoreHydrogens;
                    old.type.params.ignoreHydrogensVariant = ignoreHydrogensVariant;
                    old.type.params.quality = quality;
                    old.type.params.ignoreLight = ignoreLight;
                    old.type.params.material = material;
                    old.type.params.clip = clip;
                });
            }
        }
    }
    async updateInterationProps() {
        var _a, _b, _c;
        for (const s of this.currentStructures) {
            const interactionParams = InteractionsProvider.getParams((_a = s.cell.obj) === null || _a === void 0 ? void 0 : _a.data);
            if (s.properties) {
                const oldParams = (_b = s.properties.cell.transform.params) === null || _b === void 0 ? void 0 : _b.properties[InteractionsProvider.descriptor.name];
                if (PD.areEqual(interactionParams, oldParams, this.state.options.interactions))
                    continue;
                await this.dataState.build().to(s.properties.cell)
                    .update(old => {
                    old.properties[InteractionsProvider.descriptor.name] = this.state.options.interactions;
                })
                    .commit();
            }
            else {
                const pd = this.plugin.customStructureProperties.getParams((_c = s.cell.obj) === null || _c === void 0 ? void 0 : _c.data);
                const params = PD.getDefaultValues(pd);
                if (PD.areEqual(interactionParams, params.properties[InteractionsProvider.descriptor.name], this.state.options.interactions))
                    continue;
                params.properties[InteractionsProvider.descriptor.name] = this.state.options.interactions;
                await this.plugin.builders.structure.insertStructureProperties(s.cell, params);
            }
        }
    }
    applyPreset(structures, provider, params) {
        return this.plugin.dataTransaction(async () => {
            for (const s of structures) {
                const preset = await this.plugin.builders.structure.representation.applyPreset(s.cell, provider, params);
                await this.syncPreset(s, preset);
            }
        }, { canUndo: 'Preset' });
    }
    syncPreset(root, preset) {
        if (!preset || !preset.components)
            return this.clearComponents([root]);
        const keptRefs = new Set();
        objectForEach(preset.components, c => {
            if (c)
                keptRefs.add(c.ref);
        });
        if (preset.representations) {
            objectForEach(preset.representations, r => {
                if (r)
                    keptRefs.add(r.ref);
            });
        }
        if (keptRefs.size === 0)
            return this.clearComponents([root]);
        let changed = false;
        const update = this.dataState.build();
        const sync = (r) => {
            if (!keptRefs.has(r.cell.transform.ref)) {
                changed = true;
                update.delete(r.cell);
            }
        };
        for (const c of root.components) {
            sync(c);
            for (const r of c.representations)
                sync(r);
            if (c.genericRepresentations) {
                for (const r of c.genericRepresentations)
                    sync(r);
            }
        }
        if (root.genericRepresentations) {
            for (const r of root.genericRepresentations) {
                sync(r);
            }
        }
        if (changed)
            return update.commit();
    }
    clear(structures) {
        return this.clearComponents(structures);
    }
    selectThis(components) {
        var _a;
        const mng = this.plugin.managers.structure.selection;
        mng.clear();
        for (const c of components) {
            const loci = Structure.toSubStructureElementLoci(c.structure.cell.obj.data, (_a = c.cell.obj) === null || _a === void 0 ? void 0 : _a.data);
            mng.fromLoci('set', loci);
        }
    }
    canBeModified(ref) {
        return this.plugin.builders.structure.isComponentTransform(ref.cell);
    }
    modifyByCurrentSelection(components, action) {
        return this.plugin.runTask(Task.create('Modify Component', async (taskCtx) => {
            const b = this.dataState.build();
            for (const c of components) {
                if (!this.canBeModified(c))
                    continue;
                const selection = this.plugin.managers.structure.selection.getStructure(c.structure.cell.obj.data);
                if (!selection || selection.elementCount === 0)
                    continue;
                this.modifyComponent(b, c, selection, action);
            }
            await this.dataState.updateTree(b, { canUndo: 'Modify Selection' }).runInContext(taskCtx);
        }));
    }
    toggleVisibility(components, reprPivot) {
        if (components.length === 0)
            return;
        if (!reprPivot) {
            const isHidden = !components[0].cell.state.isHidden;
            for (const c of components) {
                setSubtreeVisibility(this.dataState, c.cell.transform.ref, isHidden);
            }
        }
        else {
            const index = components[0].representations.indexOf(reprPivot);
            const isHidden = !reprPivot.cell.state.isHidden;
            for (const c of components) {
                // TODO: is it ok to use just the index here? Could possible lead to ugly edge cases, but perhaps not worth the trouble to "fix".
                const repr = c.representations[index];
                if (!repr)
                    continue;
                setSubtreeVisibility(this.dataState, repr.cell.transform.ref, isHidden);
            }
        }
    }
    removeRepresentations(components, pivot) {
        if (components.length === 0)
            return;
        const toRemove = [];
        if (pivot) {
            const index = components[0].representations.indexOf(pivot);
            if (index < 0)
                return;
            for (const c of components) {
                if (c.representations[index])
                    toRemove.push(c.representations[index]);
            }
        }
        else {
            for (const c of components) {
                for (const r of c.representations) {
                    toRemove.push(r);
                }
            }
        }
        return this.plugin.managers.structure.hierarchy.remove(toRemove, true);
    }
    updateRepresentations(components, pivot, params) {
        if (components.length === 0)
            return Promise.resolve();
        const index = components[0].representations.indexOf(pivot);
        if (index < 0)
            return Promise.resolve();
        const update = this.dataState.build();
        for (const c of components) {
            // TODO: is it ok to use just the index here? Could possible lead to ugly edge cases, but perhaps not worth the trouble to "fix".
            const repr = c.representations[index];
            if (!repr)
                continue;
            if (repr.cell.transform.transformer !== pivot.cell.transform.transformer)
                continue;
            update.to(repr.cell).update(params);
        }
        return update.commit({ canUndo: 'Update Representation' });
    }
    updateRepresentationsTheme(components, paramsOrProvider) {
        var _a, _b, _c, _d;
        if (components.length === 0)
            return;
        const update = this.dataState.build();
        for (const c of components) {
            for (const repr of c.representations) {
                const old = repr.cell.transform.params;
                const params = typeof paramsOrProvider === 'function' ? paramsOrProvider(c, repr) : paramsOrProvider;
                const colorTheme = params.color === 'default'
                    ? createStructureColorThemeParams(this.plugin, (_a = c.structure.cell.obj) === null || _a === void 0 ? void 0 : _a.data, old === null || old === void 0 ? void 0 : old.type.name)
                    : params.color
                        ? createStructureColorThemeParams(this.plugin, (_b = c.structure.cell.obj) === null || _b === void 0 ? void 0 : _b.data, old === null || old === void 0 ? void 0 : old.type.name, params.color, params.colorParams)
                        : void 0;
                const sizeTheme = params.size === 'default'
                    ? createStructureSizeThemeParams(this.plugin, (_c = c.structure.cell.obj) === null || _c === void 0 ? void 0 : _c.data, old === null || old === void 0 ? void 0 : old.type.name)
                    : params.color
                        ? createStructureSizeThemeParams(this.plugin, (_d = c.structure.cell.obj) === null || _d === void 0 ? void 0 : _d.data, old === null || old === void 0 ? void 0 : old.type.name, params.size, params.sizeParams)
                        : void 0;
                if (colorTheme || sizeTheme) {
                    update.to(repr.cell).update(prev => {
                        if (colorTheme)
                            prev.colorTheme = colorTheme;
                        if (sizeTheme)
                            prev.sizeTheme = sizeTheme;
                    });
                }
            }
        }
        return update.commit({ canUndo: 'Update Theme' });
    }
    addRepresentation(components, type) {
        if (components.length === 0)
            return;
        const { hydrogens, visualQuality: quality, ignoreLight, materialStyle: material, clipObjects: clip } = this.state.options;
        const ignoreHydrogens = hydrogens !== 'all';
        const ignoreHydrogensVariant = hydrogens === 'only-polar' ? 'non-polar' : 'all';
        const typeParams = { ignoreHydrogens, ignoreHydrogensVariant, quality, ignoreLight, material, clip };
        return this.plugin.dataTransaction(async () => {
            for (const component of components) {
                await this.plugin.builders.structure.representation.addRepresentation(component.cell, {
                    type: this.plugin.representation.structure.registry.get(type),
                    typeParams
                });
            }
        }, { canUndo: 'Add Representation' });
    }
    tryFindComponent(structure, selection) {
        if (structure.components.length === 0)
            return;
        return this.plugin.runTask(Task.create('Find Component', async (taskCtx) => {
            var _a, _b;
            const data = (_a = structure.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
            if (!data)
                return;
            const sel = StructureSelection.unionStructure(await selection.getSelection(this.plugin, taskCtx, data));
            for (const c of structure.components) {
                const comp = (_b = c.cell.obj) === null || _b === void 0 ? void 0 : _b.data;
                if (!comp || !c.cell.parent)
                    continue;
                if (structureAreEqual(sel, comp))
                    return c.cell;
            }
        }));
    }
    async add(params, structures) {
        return this.plugin.dataTransaction(async () => {
            const xs = structures || this.currentStructures;
            if (xs.length === 0)
                return;
            const { hydrogens, visualQuality: quality, ignoreLight, materialStyle: material, clipObjects: clip } = this.state.options;
            const ignoreHydrogens = hydrogens !== 'all';
            const ignoreHydrogensVariant = hydrogens === 'only-polar' ? 'non-polar' : 'all';
            const typeParams = { ignoreHydrogens, ignoreHydrogensVariant, quality, ignoreLight, material, clip };
            const componentKey = UUID.create22();
            for (const s of xs) {
                let component = void 0;
                if (params.options.checkExisting) {
                    component = await this.tryFindComponent(s, params.selection);
                }
                if (!component) {
                    component = await this.plugin.builders.structure.tryCreateComponentFromSelection(s.cell, params.selection, componentKey, {
                        label: params.options.label || (params.selection === StructureSelectionQueries.current ? 'Custom Selection' : ''),
                    });
                }
                if (params.representation === 'none' || !component)
                    continue;
                await this.plugin.builders.structure.representation.addRepresentation(component, {
                    type: this.plugin.representation.structure.registry.get(params.representation),
                    typeParams
                });
            }
        }, { canUndo: 'Add Selection' });
    }
    async applyTheme(params, structures) {
        return this.plugin.dataTransaction(async (ctx) => {
            const xs = structures || this.currentStructures;
            if (xs.length === 0)
                return;
            const getLoci = async (s) => StructureSelection.toLociWithSourceUnits(await params.selection.getSelection(this.plugin, ctx, s));
            for (const s of xs) {
                if (params.action.name === 'color') {
                    const p = params.action.params;
                    await setStructureOverpaint(this.plugin, s.components, p.color, getLoci, params.representations);
                }
                else if (params.action.name === 'resetColor') {
                    await setStructureOverpaint(this.plugin, s.components, -1, getLoci, params.representations);
                }
                else if (params.action.name === 'transparency') {
                    const p = params.action.params;
                    await setStructureTransparency(this.plugin, s.components, p.value, getLoci, params.representations);
                }
                else if (params.action.name === 'emissive') {
                    const p = params.action.params;
                    await setStructureEmissive(this.plugin, s.components, p.value, getLoci, params.representations);
                }
                else if (params.action.name === 'material') {
                    const p = params.action.params;
                    await setStructureSubstance(this.plugin, s.components, p.material, getLoci, params.representations);
                }
                else if (params.action.name === 'resetMaterial') {
                    await setStructureSubstance(this.plugin, s.components, void 0, getLoci, params.representations);
                }
                else if (params.action.name === 'clipping') {
                    const p = params.action.params;
                    await setStructureClipping(this.plugin, s.components, Clipping.Groups.fromNames(p.excludeGroups), getLoci, params.representations);
                }
            }
        }, { canUndo: 'Apply Theme' });
    }
    modifyComponent(builder, component, by, action) {
        var _a, _b, _c;
        const structure = (_a = component.cell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structure)
            return;
        if ((action === 'subtract' || action === 'intersect') && !structureAreIntersecting(structure, by))
            return;
        const parent = (_b = component.structure.cell.obj) === null || _b === void 0 ? void 0 : _b.data;
        const modified = action === 'union'
            ? structureUnion(parent, [structure, by])
            : action === 'intersect'
                ? structureIntersect(structure, by)
                : structureSubtract(structure, by);
        if (modified.elementCount === 0) {
            builder.delete(component.cell.transform.ref);
        }
        else {
            const bundle = StructureElement.Bundle.fromSubStructure(parent, modified);
            const params = {
                type: { name: 'bundle', params: bundle },
                nullIfEmpty: true,
                label: (_c = component.cell.obj) === null || _c === void 0 ? void 0 : _c.label
            };
            builder.to(component.cell).update(params);
        }
    }
    updateLabel(component, label) {
        var _a, _b;
        const params = {
            type: (_a = component.cell.params) === null || _a === void 0 ? void 0 : _a.values.type,
            nullIfEmpty: (_b = component.cell.params) === null || _b === void 0 ? void 0 : _b.values.nullIfEmpty,
            label
        };
        this.dataState.build().to(component.cell).update(params).commit();
    }
    get dataState() {
        return this.plugin.state.data;
    }
    clearComponents(structures) {
        const deletes = this.dataState.build();
        for (const s of structures) {
            for (const c of s.components) {
                deletes.delete(c.cell.transform.ref);
            }
        }
        return deletes.commit({ canUndo: 'Clear Selections' });
    }
    constructor(plugin) {
        super({ options: PD.getDefaultValues(StructureComponentManager.OptionsParams) });
        this.plugin = plugin;
        this.events = {
            optionsUpdated: this.ev()
        };
    }
}
(function (StructureComponentManager) {
    StructureComponentManager.OptionsParams = {
        hydrogens: PD.Select('all', [['all', 'Show All'], ['hide-all', 'Hide All'], ['only-polar', 'Only Polar']], { description: 'Determine display of hydrogen atoms in representations' }),
        visualQuality: PD.Select('auto', VisualQualityOptions, { description: 'Control the visual/rendering quality of representations' }),
        ignoreLight: PD.Boolean(false, { description: 'Ignore light for stylized rendering of representations' }),
        materialStyle: Material.getParam(),
        clipObjects: PD.Group(Clip.Params),
        interactions: PD.Group(InteractionsProvider.defaultParams, { label: 'Non-covalent Interactions' }),
    };
    function getAddParams(plugin, params) {
        const { options } = plugin.query.structure.registry;
        params = {
            pivot: plugin.managers.structure.component.pivotStructure,
            allowNone: true,
            hideSelection: false,
            checkExisting: false,
            ...params
        };
        return {
            selection: PD.Select(options[1][0], options, { isHidden: params === null || params === void 0 ? void 0 : params.hideSelection }),
            representation: getRepresentationTypesSelect(plugin, params === null || params === void 0 ? void 0 : params.pivot, (params === null || params === void 0 ? void 0 : params.allowNone) ? [['none', '< Create Later >']] : []),
            options: PD.Group({
                label: PD.Text(''),
                checkExisting: PD.Boolean(!!(params === null || params === void 0 ? void 0 : params.checkExisting), { help: () => ({ description: 'Checks if a selection with the specifield elements already exists to avoid creating duplicate components.' }) }),
            })
        };
    }
    StructureComponentManager.getAddParams = getAddParams;
    function getThemeParams(plugin, pivot) {
        const { options } = plugin.query.structure.registry;
        return {
            selection: PD.Select(options[1][0], options, { isHidden: false }),
            action: PD.MappedStatic('color', {
                color: PD.Group({
                    color: PD.Color(ColorNames.blue, { isExpanded: true }),
                }, { isFlat: true }),
                resetColor: PD.EmptyGroup({ label: 'Reset Color' }),
                transparency: PD.Group({
                    value: PD.Numeric(0.5, { min: 0, max: 1, step: 0.01 }),
                }, { isFlat: true }),
                emissive: PD.Group({
                    value: PD.Numeric(0.5, { min: 0, max: 1, step: 0.01 }),
                }, { isFlat: true }),
                material: PD.Group({
                    material: Material.getParam({ isFlat: true }),
                }, { isFlat: true }),
                resetMaterial: PD.EmptyGroup({ label: 'Reset Material' }),
                clipping: PD.Group({
                    excludeGroups: PD.MultiSelect([], PD.objectToOptions(Clipping.Groups.Names)),
                }, { isFlat: true }),
            }),
            representations: PD.MultiSelect([], getRepresentationTypes(plugin, pivot), { emptyValue: 'All' })
        };
    }
    StructureComponentManager.getThemeParams = getThemeParams;
    function getRepresentationTypes(plugin, pivot) {
        var _a, _b;
        return ((_a = pivot === null || pivot === void 0 ? void 0 : pivot.cell.obj) === null || _a === void 0 ? void 0 : _a.data)
            ? plugin.representation.structure.registry.getApplicableTypes((_b = pivot.cell.obj) === null || _b === void 0 ? void 0 : _b.data)
            : plugin.representation.structure.registry.types;
    }
    StructureComponentManager.getRepresentationTypes = getRepresentationTypes;
    function getRepresentationTypesSelect(plugin, pivot, custom, label) {
        const types = [
            ...custom,
            ...getRepresentationTypes(plugin, pivot)
        ];
        return PD.Select(types[0][0], types, { label });
    }
})(StructureComponentManager || (StructureComponentManager = {}));
