"use strict";
/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeometryControls = exports.GeometryParams = void 0;
const geometry_1 = require("../../mol-math/geometry");
const component_1 = require("../../mol-plugin-state/component");
const mol_task_1 = require("../../mol-task");
const objects_1 = require("../../mol-plugin-state/objects");
const mol_state_1 = require("../../mol-state");
const param_definition_1 = require("../../mol-util/param-definition");
const set_1 = require("../../mol-util/set");
const glb_exporter_1 = require("./glb-exporter");
const obj_exporter_1 = require("./obj-exporter");
const stl_exporter_1 = require("./stl-exporter");
const usdz_exporter_1 = require("./usdz-exporter");
exports.GeometryParams = {
    format: param_definition_1.ParamDefinition.Select('glb', [
        ['glb', 'glTF 2.0 Binary (.glb)'],
        ['stl', 'Stl (.stl)'],
        ['obj', 'Wavefront (.obj)'],
        ['usdz', 'Universal Scene Description (.usdz)']
    ])
};
class GeometryControls extends component_1.PluginComponent {
    getFilename() {
        const models = this.plugin.state.data.select(mol_state_1.StateSelection.Generators.rootsOfType(objects_1.PluginStateObject.Molecule.Model)).map(s => s.obj.data);
        const uniqueIds = new Set();
        models.forEach(m => uniqueIds.add(m.entryId.toUpperCase()));
        const idString = set_1.SetUtils.toArray(uniqueIds).join('-');
        return `${idString || 'molstar-model'}`;
    }
    exportGeometry() {
        const task = mol_task_1.Task.create('Export Geometry', async (ctx) => {
            var _a, _b, _c;
            try {
                const renderObjects = (_a = this.plugin.canvas3d) === null || _a === void 0 ? void 0 : _a.getRenderObjects();
                const filename = this.getFilename();
                const boundingSphere = (_b = this.plugin.canvas3d) === null || _b === void 0 ? void 0 : _b.boundingSphereVisible;
                const boundingBox = geometry_1.Box3D.fromSphere3D((0, geometry_1.Box3D)(), boundingSphere);
                let renderObjectExporter;
                switch (this.behaviors.params.value.format) {
                    case 'glb':
                        renderObjectExporter = new glb_exporter_1.GlbExporter(boundingBox);
                        break;
                    case 'obj':
                        renderObjectExporter = new obj_exporter_1.ObjExporter(filename, boundingBox);
                        break;
                    case 'stl':
                        renderObjectExporter = new stl_exporter_1.StlExporter(boundingBox);
                        break;
                    case 'usdz':
                        renderObjectExporter = new usdz_exporter_1.UsdzExporter(boundingBox, boundingSphere.radius);
                        break;
                    default: throw new Error('Unsupported format.');
                }
                for (let i = 0, il = renderObjects.length; i < il; ++i) {
                    await ctx.update({ message: `Exporting object ${i}/${il}` });
                    await renderObjectExporter.add(renderObjects[i], (_c = this.plugin.canvas3d) === null || _c === void 0 ? void 0 : _c.webgl, ctx);
                }
                const blob = await renderObjectExporter.getBlob(ctx);
                return {
                    blob,
                    filename: filename + '.' + renderObjectExporter.fileExtension
                };
            }
            catch (e) {
                this.plugin.log.error('Error during geometry export');
                throw e;
            }
        });
        return this.plugin.runTask(task, { useOverlay: true });
    }
    constructor(plugin) {
        super();
        this.plugin = plugin;
        this.behaviors = {
            params: this.ev.behavior(param_definition_1.ParamDefinition.getDefaultValues(exports.GeometryParams))
        };
    }
}
exports.GeometryControls = GeometryControls;
