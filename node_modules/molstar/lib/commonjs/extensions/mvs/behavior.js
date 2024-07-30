"use strict";
/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MolViewSpec = void 0;
const behavior_1 = require("../../mol-plugin/behavior/behavior");
const mol_task_1 = require("../../mol-task");
const param_definition_1 = require("../../mol-util/param-definition");
const annotation_color_theme_1 = require("./components/annotation-color-theme");
const representation_1 = require("./components/annotation-label/representation");
const annotation_prop_1 = require("./components/annotation-prop");
const annotation_tooltips_prop_1 = require("./components/annotation-tooltips-prop");
const representation_2 = require("./components/custom-label/representation");
const custom_tooltips_prop_1 = require("./components/custom-tooltips-prop");
const formats_1 = require("./components/formats");
const is_mvs_model_prop_1 = require("./components/is-mvs-model-prop");
const multilayer_color_theme_1 = require("./components/multilayer-color-theme");
const load_1 = require("./load");
const mvs_data_1 = require("./mvs-data");
/** Registers everything needed for loading MolViewSpec files */
exports.MolViewSpec = behavior_1.PluginBehavior.create({
    name: 'molviewspec',
    category: 'misc',
    display: {
        name: 'MolViewSpec',
        description: 'MolViewSpec extension',
    },
    ctor: class extends behavior_1.PluginBehavior.Handler {
        constructor() {
            super(...arguments);
            this.registrables = {
                customModelProperties: [
                    is_mvs_model_prop_1.IsMVSModelProvider,
                    annotation_prop_1.MVSAnnotationsProvider,
                ],
                customStructureProperties: [
                    custom_tooltips_prop_1.CustomTooltipsProvider,
                    annotation_tooltips_prop_1.MVSAnnotationTooltipsProvider,
                ],
                representations: [
                    representation_2.CustomLabelRepresentationProvider,
                    representation_1.MVSAnnotationLabelRepresentationProvider,
                ],
                colorThemes: [
                    annotation_color_theme_1.MVSAnnotationColorThemeProvider,
                    (0, multilayer_color_theme_1.makeMultilayerColorThemeProvider)(this.ctx.representation.structure.themes.colorThemeRegistry),
                ],
                lociLabels: [
                    custom_tooltips_prop_1.CustomTooltipsLabelProvider,
                    annotation_tooltips_prop_1.MVSAnnotationTooltipsLabelProvider,
                ],
                dragAndDropHandlers: [
                    MVSDragAndDropHandler,
                ],
                dataFormats: [
                    { name: 'MVSJ', provider: formats_1.MVSJFormatProvider },
                    { name: 'MVSX', provider: formats_1.MVSXFormatProvider },
                ],
                actions: [
                    formats_1.LoadMvsData,
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
        autoAttach: param_definition_1.ParamDefinition.Boolean(false),
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
                const task = mol_task_1.Task.create('Load MVSJ file', async (ctx) => {
                    const data = await file.text();
                    const mvsData = mvs_data_1.MVSData.fromMVSJ(data);
                    await (0, load_1.loadMVS)(plugin, mvsData, { sanityChecks: true, replaceExisting: !applied, sourceUrl: undefined });
                });
                await plugin.runTask(task);
                applied = true;
            }
            if (file.name.toLowerCase().endsWith('.mvsx')) {
                const task = mol_task_1.Task.create('Load MVSX file', async (ctx) => {
                    const buffer = await file.arrayBuffer();
                    const array = new Uint8Array(buffer);
                    const parsed = await (0, formats_1.loadMVSX)(plugin, ctx, array);
                    await (0, load_1.loadMVS)(plugin, parsed.mvsData, { sanityChecks: true, replaceExisting: !applied, sourceUrl: parsed.sourceUrl });
                });
                await plugin.runTask(task);
                applied = true;
            }
        }
        return applied;
    },
};
