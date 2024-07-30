/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginBehavior } from '../../mol-plugin/behavior/behavior';
import { Task } from '../../mol-task';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { MVSAnnotationColorThemeProvider } from './components/annotation-color-theme';
import { MVSAnnotationLabelRepresentationProvider } from './components/annotation-label/representation';
import { MVSAnnotationsProvider } from './components/annotation-prop';
import { MVSAnnotationTooltipsLabelProvider, MVSAnnotationTooltipsProvider } from './components/annotation-tooltips-prop';
import { CustomLabelRepresentationProvider } from './components/custom-label/representation';
import { CustomTooltipsLabelProvider, CustomTooltipsProvider } from './components/custom-tooltips-prop';
import { LoadMvsData, MVSJFormatProvider, MVSXFormatProvider, loadMVSX } from './components/formats';
import { IsMVSModelProvider } from './components/is-mvs-model-prop';
import { makeMultilayerColorThemeProvider } from './components/multilayer-color-theme';
import { loadMVS } from './load';
import { MVSData } from './mvs-data';
/** Registers everything needed for loading MolViewSpec files */
export const MolViewSpec = PluginBehavior.create({
    name: 'molviewspec',
    category: 'misc',
    display: {
        name: 'MolViewSpec',
        description: 'MolViewSpec extension',
    },
    ctor: class extends PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.registrables = {
                customModelProperties: [
                    IsMVSModelProvider,
                    MVSAnnotationsProvider,
                ],
                customStructureProperties: [
                    CustomTooltipsProvider,
                    MVSAnnotationTooltipsProvider,
                ],
                representations: [
                    CustomLabelRepresentationProvider,
                    MVSAnnotationLabelRepresentationProvider,
                ],
                colorThemes: [
                    MVSAnnotationColorThemeProvider,
                    makeMultilayerColorThemeProvider(this.ctx.representation.structure.themes.colorThemeRegistry),
                ],
                lociLabels: [
                    CustomTooltipsLabelProvider,
                    MVSAnnotationTooltipsLabelProvider,
                ],
                dragAndDropHandlers: [
                    MVSDragAndDropHandler,
                ],
                dataFormats: [
                    { name: 'MVSJ', provider: MVSJFormatProvider },
                    { name: 'MVSX', provider: MVSXFormatProvider },
                ],
                actions: [
                    LoadMvsData,
                ]
            };
        }
        register() {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            for (const prop of (_a = this.registrables.customModelProperties) !== null && _a !== void 0 ? _a : []) {
                this.ctx.customModelProperties.register(prop, this.params.autoAttach);
            }
            for (const prop of (_b = this.registrables.customStructureProperties) !== null && _b !== void 0 ? _b : []) {
                this.ctx.customStructureProperties.register(prop, this.params.autoAttach);
            }
            for (const repr of (_c = this.registrables.representations) !== null && _c !== void 0 ? _c : []) {
                this.ctx.representation.structure.registry.add(repr);
            }
            for (const theme of (_d = this.registrables.colorThemes) !== null && _d !== void 0 ? _d : []) {
                this.ctx.representation.structure.themes.colorThemeRegistry.add(theme);
            }
            for (const provider of (_e = this.registrables.lociLabels) !== null && _e !== void 0 ? _e : []) {
                this.ctx.managers.lociLabels.addProvider(provider);
            }
            for (const handler of (_f = this.registrables.dragAndDropHandlers) !== null && _f !== void 0 ? _f : []) {
                this.ctx.managers.dragAndDrop.addHandler(handler.name, handler.handle);
            }
            for (const format of (_g = this.registrables.dataFormats) !== null && _g !== void 0 ? _g : []) {
                this.ctx.dataFormats.add(format.name, format.provider);
            }
            for (const action of (_h = this.registrables.actions) !== null && _h !== void 0 ? _h : []) {
                this.ctx.state.data.actions.add(action);
            }
        }
        update(p) {
            var _a, _b;
            const updated = this.params.autoAttach !== p.autoAttach;
            this.params.autoAttach = p.autoAttach;
            for (const prop of (_a = this.registrables.customModelProperties) !== null && _a !== void 0 ? _a : []) {
                this.ctx.customModelProperties.setDefaultAutoAttach(prop.descriptor.name, this.params.autoAttach);
            }
            for (const prop of (_b = this.registrables.customStructureProperties) !== null && _b !== void 0 ? _b : []) {
                this.ctx.customStructureProperties.setDefaultAutoAttach(prop.descriptor.name, this.params.autoAttach);
            }
            return updated;
        }
        unregister() {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            for (const prop of (_a = this.registrables.customModelProperties) !== null && _a !== void 0 ? _a : []) {
                this.ctx.customModelProperties.unregister(prop.descriptor.name);
            }
            for (const prop of (_b = this.registrables.customStructureProperties) !== null && _b !== void 0 ? _b : []) {
                this.ctx.customStructureProperties.unregister(prop.descriptor.name);
            }
            for (const repr of (_c = this.registrables.representations) !== null && _c !== void 0 ? _c : []) {
                this.ctx.representation.structure.registry.remove(repr);
            }
            for (const theme of (_d = this.registrables.colorThemes) !== null && _d !== void 0 ? _d : []) {
                this.ctx.representation.structure.themes.colorThemeRegistry.remove(theme);
            }
            for (const labelProvider of (_e = this.registrables.lociLabels) !== null && _e !== void 0 ? _e : []) {
                this.ctx.managers.lociLabels.removeProvider(labelProvider);
            }
            for (const handler of (_f = this.registrables.dragAndDropHandlers) !== null && _f !== void 0 ? _f : []) {
                this.ctx.managers.dragAndDrop.removeHandler(handler.name);
            }
            for (const format of (_g = this.registrables.dataFormats) !== null && _g !== void 0 ? _g : []) {
                this.ctx.dataFormats.remove(format.name);
            }
            for (const action of (_h = this.registrables.actions) !== null && _h !== void 0 ? _h : []) {
                this.ctx.state.data.actions.remove(action);
            }
        }
    },
    params: () => ({
        autoAttach: PD.Boolean(false),
    })
});
/** DragAndDropHandler handler for `.mvsj` and `.mvsx` files */
const MVSDragAndDropHandler = {
    name: 'mvs-mvsj-mvsx',
    /** Load .mvsj and .mvsx files. Delete previous plugin state before loading.
     * If multiple files are provided, merge their MVS data into one state.
     * Return `true` if at least one file has been loaded. */
    async handle(files, plugin) {
        let applied = false;
        for (const file of files) {
            if (file.name.toLowerCase().endsWith('.mvsj')) {
                const task = Task.create('Load MVSJ file', async (ctx) => {
                    const data = await file.text();
                    const mvsData = MVSData.fromMVSJ(data);
                    await loadMVS(plugin, mvsData, { sanityChecks: true, replaceExisting: !applied, sourceUrl: undefined });
                });
                await plugin.runTask(task);
                applied = true;
            }
            if (file.name.toLowerCase().endsWith('.mvsx')) {
                const task = Task.create('Load MVSX file', async (ctx) => {
                    const buffer = await file.arrayBuffer();
                    const array = new Uint8Array(buffer);
                    const parsed = await loadMVSX(plugin, ctx, array);
                    await loadMVS(plugin, parsed.mvsData, { sanityChecks: true, replaceExisting: !applied, sourceUrl: parsed.sourceUrl });
                });
                await plugin.runTask(task);
                applied = true;
            }
        }
        return applied;
    },
};
