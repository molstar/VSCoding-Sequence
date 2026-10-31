"use strict";
/**
 * Copyright (c) 2018-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Yakov Pechersky <ffxen158@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VolumeTransform = exports.VolumeFromSegmentationCif = exports.VolumeFromDensityServerCif = exports.AssignColorVolume = exports.VolumeFromDx = exports.VolumeFromCube = exports.VolumeFromDsn6 = exports.VolumeFromCcp4 = void 0;
const cif_1 = require("../../mol-io/reader/cif");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const ccp4_1 = require("../../mol-model-formats/volume/ccp4");
const density_server_1 = require("../../mol-model-formats/volume/density-server");
const dsn6_1 = require("../../mol-model-formats/volume/dsn6");
const mol_task_1 = require("../../mol-task");
const param_definition_1 = require("../../mol-util/param-definition");
const objects_1 = require("../objects");
const cube_1 = require("../../mol-model-formats/volume/cube");
const dx_1 = require("../../mol-model-formats/volume/dx");
const volume_1 = require("../../mol-model/volume");
const mol_state_1 = require("../../mol-state");
const segmentation_1 = require("../../mol-model-formats/volume/segmentation");
const VolumeFromCcp4 = objects_1.PluginStateTransform.BuiltIn({
    name: 'volume-from-ccp4',
    display: { name: 'Volume from CCP4/MRC/MAP', description: 'Create Volume from CCP4/MRC/MAP data' },
    from: objects_1.PluginStateObject.Format.Ccp4,
    to: objects_1.PluginStateObject.Volume.Data,
    params(a) {
        return {
            voxelSize: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(1, 1, 1)),
            offset: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(0, 0, 0)),
            entryId: param_definition_1.ParamDefinition.Text(''),
        };
    }
})({
    apply({ a, params }) {
        return mol_task_1.Task.create('Create volume from CCP4/MRC/MAP', async (ctx) => {
            const volume = await (0, ccp4_1.volumeFromCcp4)(a.data, { ...params, label: a.data.name || a.label }).runInContext(ctx);
            const props = { label: volume.label || 'Volume', description: `Volume ${a.data.header.NX}\u00D7${a.data.header.NX}\u00D7${a.data.header.NX}` };
            return new objects_1.PluginStateObject.Volume.Data(volume, props);
        });
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customProperties.dispose();
    }
});
exports.VolumeFromCcp4 = VolumeFromCcp4;
const VolumeFromDsn6 = objects_1.PluginStateTransform.BuiltIn({
    name: 'volume-from-dsn6',
    display: { name: 'Volume from DSN6/BRIX', description: 'Create Volume from DSN6/BRIX data' },
    from: objects_1.PluginStateObject.Format.Dsn6,
    to: objects_1.PluginStateObject.Volume.Data,
    params(a) {
        return {
            voxelSize: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(1, 1, 1)),
            entryId: param_definition_1.ParamDefinition.Text(''),
        };
    }
})({
    apply({ a, params }) {
        return mol_task_1.Task.create('Create volume from DSN6/BRIX', async (ctx) => {
            const volume = await (0, dsn6_1.volumeFromDsn6)(a.data, { ...params, label: a.data.name || a.label }).runInContext(ctx);
            const props = { label: volume.label || 'Volume', description: `Volume ${a.data.header.xExtent}\u00D7${a.data.header.yExtent}\u00D7${a.data.header.zExtent}` };
            return new objects_1.PluginStateObject.Volume.Data(volume, props);
        });
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customProperties.dispose();
    }
});
exports.VolumeFromDsn6 = VolumeFromDsn6;
const VolumeFromCube = objects_1.PluginStateTransform.BuiltIn({
    name: 'volume-from-cube',
    display: { name: 'Volume from Cube', description: 'Create Volume from Cube data' },
    from: objects_1.PluginStateObject.Format.Cube,
    to: objects_1.PluginStateObject.Volume.Data,
    params(a) {
        const dataIndex = a ? param_definition_1.ParamDefinition.Select(0, a.data.header.dataSetIds.map((id, i) => [i, `${id}`])) : param_definition_1.ParamDefinition.Numeric(0);
        return {
            dataIndex,
            entryId: param_definition_1.ParamDefinition.Text(''),
        };
    }
})({
    apply({ a, params }) {
        return mol_task_1.Task.create('Create volume from Cube', async (ctx) => {
            const volume = await (0, cube_1.volumeFromCube)(a.data, { ...params, label: a.data.name || a.label }).runInContext(ctx);
            const props = { label: volume.label || 'Volume', description: `Volume ${a.data.header.dim[0]}\u00D7${a.data.header.dim[1]}\u00D7${a.data.header.dim[2]}` };
            return new objects_1.PluginStateObject.Volume.Data(volume, props);
        });
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customProperties.dispose();
    }
});
exports.VolumeFromCube = VolumeFromCube;
const VolumeFromDx = objects_1.PluginStateTransform.BuiltIn({
    name: 'volume-from-dx',
    display: { name: 'Parse DX', description: 'Create volume from DX data.' },
    from: objects_1.PluginStateObject.Format.Dx,
    to: objects_1.PluginStateObject.Volume.Data
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse DX', async (ctx) => {
            const volume = await (0, dx_1.volumeFromDx)(a.data, { label: a.data.name || a.label }).runInContext(ctx);
            const props = { label: volume.label || 'Volume', description: `Volume ${a.data.header.dim[0]}\u00D7${a.data.header.dim[1]}\u00D7${a.data.header.dim[2]}` };
            return new objects_1.PluginStateObject.Volume.Data(volume, props);
        });
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customProperties.dispose();
    }
});
exports.VolumeFromDx = VolumeFromDx;
const VolumeFromDensityServerCif = objects_1.PluginStateTransform.BuiltIn({
    name: 'volume-from-density-server-cif',
    display: { name: 'Volume from density-server CIF', description: 'Identify and create all separate models in the specified CIF data block' },
    from: objects_1.PluginStateObject.Format.Cif,
    to: objects_1.PluginStateObject.Volume.Data,
    params(a) {
        if (!a) {
            return {
                blockHeader: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text(void 0, { description: 'Header of the block to parse. If none is specifed, the 1st data block in the file is used.' })),
                entryId: param_definition_1.ParamDefinition.Text(''),
            };
        }
        const blocks = a.data.blocks.slice(1); // zero block contains query meta-data
        return {
            blockHeader: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Select(blocks[0] && blocks[0].header, blocks.map(b => [b.header, b.header]), { description: 'Header of the block to parse' })),
            entryId: param_definition_1.ParamDefinition.Text(''),
        };
    }
})({
    isApplicable: a => a.data.blocks.length > 0,
    apply({ a, params }) {
        return mol_task_1.Task.create('Parse density-server CIF', async (ctx) => {
            var _a;
            const header = params.blockHeader || a.data.blocks[1].header; // zero block contains query meta-data
            const block = a.data.blocks.find(b => b.header === header);
            if (!block)
                throw new Error(`Data block '${[header]}' not found.`);
            const densityServerCif = cif_1.CIF.schema.densityServer(block);
            const volume = await (0, density_server_1.volumeFromDensityServerData)(densityServerCif, { entryId: params.entryId }).runInContext(ctx);
            const [x, y, z] = volume.grid.cells.space.dimensions;
            const props = { label: (_a = params.entryId) !== null && _a !== void 0 ? _a : densityServerCif.volume_data_3d_info.name.value(0), description: `Volume ${x}\u00D7${y}\u00D7${z}` };
            return new objects_1.PluginStateObject.Volume.Data(volume, props);
        });
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customProperties.dispose();
    }
});
exports.VolumeFromDensityServerCif = VolumeFromDensityServerCif;
const VolumeFromSegmentationCif = objects_1.PluginStateTransform.BuiltIn({
    name: 'volume-from-segmentation-cif',
    display: { name: 'Volume from Segmentation CIF' },
    from: objects_1.PluginStateObject.Format.Cif,
    to: objects_1.PluginStateObject.Volume.Data,
    params(a) {
        const blocks = a === null || a === void 0 ? void 0 : a.data.blocks.slice(1);
        const blockHeaderParam = blocks ?
            param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Select(blocks[0] && blocks[0].header, blocks.map(b => [b.header, b.header]), { description: 'Header of the block to parse' }))
            : param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text(void 0, { description: 'Header of the block to parse. If none is specifed, the 1st data block in the file is used.' }));
        return {
            blockHeader: blockHeaderParam,
            segmentLabels: param_definition_1.ParamDefinition.ObjectList({ id: param_definition_1.ParamDefinition.Numeric(-1), label: param_definition_1.ParamDefinition.Text('') }, s => `${s.id} = ${s.label}`, { description: 'Mapping of segment IDs to segment labels' }),
            ownerId: param_definition_1.ParamDefinition.Text('', { isHidden: true, description: 'Reference to the object which manages this volume' }),
        };
    }
})({
    isApplicable: a => a.data.blocks.length > 0,
    apply({ a, params }) {
        return mol_task_1.Task.create('Parse segmentation CIF', async (ctx) => {
            const header = params.blockHeader || a.data.blocks[1].header; // zero block contains query meta-data
            const block = a.data.blocks.find(b => b.header === header);
            if (!block)
                throw new Error(`Data block '${[header]}' not found.`);
            const segmentationCif = cif_1.CIF.schema.segmentation(block);
            const segmentLabels = {};
            for (const segment of params.segmentLabels)
                segmentLabels[segment.id] = segment.label;
            const volume = await (0, segmentation_1.volumeFromSegmentationData)(segmentationCif, { segmentLabels, ownerId: params.ownerId }).runInContext(ctx);
            const [x, y, z] = volume.grid.cells.space.dimensions;
            const props = { label: segmentationCif.volume_data_3d_info.name.value(0), description: `Segmentation ${x}\u00D7${y}\u00D7${z}` };
            return new objects_1.PluginStateObject.Volume.Data(volume, props);
        });
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customProperties.dispose();
    }
});
exports.VolumeFromSegmentationCif = VolumeFromSegmentationCif;
const AssignColorVolume = objects_1.PluginStateTransform.BuiltIn({
    name: 'assign-color-volume',
    display: { name: 'Assign Color Volume', description: 'Assigns another volume to be available for coloring.' },
    from: objects_1.PluginStateObject.Volume.Data,
    to: objects_1.PluginStateObject.Volume.Data,
    isDecorator: true,
    params(a, plugin) {
        if (!a)
            return { ref: param_definition_1.ParamDefinition.Text() };
        const cells = plugin.state.data.select(mol_state_1.StateSelection.Generators.root.subtree().ofType(objects_1.PluginStateObject.Volume.Data).filter(cell => { var _a; return !!cell.obj && !((_a = cell.obj) === null || _a === void 0 ? void 0 : _a.data.colorVolume) && cell.obj !== a; }));
        if (cells.length === 0)
            return { ref: param_definition_1.ParamDefinition.Text('', { isHidden: true }) };
        return { ref: param_definition_1.ParamDefinition.Select(cells[0].transform.ref, cells.map(c => [c.transform.ref, c.obj.label])) };
    }
})({
    apply({ a, params, dependencies }) {
        return mol_task_1.Task.create('Assign Color Volume', async (ctx) => {
            if (!dependencies || !dependencies[params.ref]) {
                throw new Error('Dependency not available.');
            }
            const colorVolume = dependencies[params.ref].data;
            const volume = {
                ...a.data,
                colorVolume
            };
            const props = { label: a.label, description: 'Volume + Colors' };
            return new objects_1.PluginStateObject.Volume.Data(volume, props);
        });
    }
});
exports.AssignColorVolume = AssignColorVolume;
exports.VolumeTransform = objects_1.PluginStateTransform.BuiltIn({
    name: 'volume-transform',
    display: { name: 'Transform Volume' },
    isDecorator: true,
    from: objects_1.PluginStateObject.Volume.Data,
    to: objects_1.PluginStateObject.Volume.Data,
    params: {
        transform: param_definition_1.ParamDefinition.MappedStatic('matrix', 
        // TODO: support "components" based rotation
        {
            matrix: param_definition_1.ParamDefinition.Group({
                data: param_definition_1.ParamDefinition.Mat4(linear_algebra_1.Mat4.identity()),
                transpose: param_definition_1.ParamDefinition.Boolean(false),
            }, { isFlat: true }),
        }, { label: 'Kind' }),
    },
})({
    canAutoUpdate({ newParams }) {
        return newParams.transform.name !== 'matrix';
    },
    apply({ a, params }) {
        // similar to StateTransforms.Model.TransformStructureConformation;
        const transform = (0, linear_algebra_1.Mat4)();
        let gridTransform = { ...a.data.grid.transform };
        linear_algebra_1.Mat4.copy(transform, params.transform.params.data);
        if (params.transform.params.transpose)
            linear_algebra_1.Mat4.transpose(transform, transform);
        const origMat = a.data.grid.transform.kind === 'matrix'
            ? a.data.grid.transform.matrix
            : volume_1.Grid.getGridToCartesianTransform(a.data.grid);
        gridTransform = {
            kind: 'matrix',
            matrix: linear_algebra_1.Mat4.mul((0, linear_algebra_1.Mat4)(), transform, origMat),
        };
        const v = {
            ...a.data,
            grid: {
                ...a.data.grid,
                transform: gridTransform,
            },
        };
        return new objects_1.PluginStateObject.Volume.Data(v, {
            label: a.label,
            description: `${a.description} [Transformed]`,
        });
    },
});
