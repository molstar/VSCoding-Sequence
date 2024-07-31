"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructureComplexElementTypes = exports.ShapeFromPly = exports.CustomStructureProperties = exports.CustomModelProperties = exports.StructureComponent = exports.StructureComplexElement = exports.StructureSelectionFromBundle = exports.StructureSelectionFromScript = exports.MultiStructureSelectionFromExpression = exports.StructureSelectionFromExpression = exports.TransformStructureConformation = exports.StructureFromModel = exports.StructureFromTrajectory = exports.ModelFromTrajectory = exports.TrajectoryFromCifCore = exports.TrajectoryFromCube = exports.TrajectoryFromMOL2 = exports.TrajectoryFromSDF = exports.TrajectoryFromMOL = exports.TrajectoryFromXYZ = exports.TrajectoryFromGRO = exports.TrajectoryFromPDB = exports.TrajectoryFromMmCif = exports.TrajectoryFromBlob = exports.TrajectoryFromModelAndCoordinates = exports.TopologyFromTop = exports.TopologyFromPrmtop = exports.TopologyFromPsf = exports.CoordinatesFromNctraj = exports.CoordinatesFromTrr = exports.CoordinatesFromXtc = exports.CoordinatesFromDcd = void 0;
const parser_1 = require("../../mol-io/reader/dcd/parser");
const parser_2 = require("../../mol-io/reader/gro/parser");
const parser_3 = require("../../mol-io/reader/pdb/parser");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const ply_1 = require("../../mol-model-formats/shape/ply");
const dcd_1 = require("../../mol-model-formats/structure/dcd");
const gro_1 = require("../../mol-model-formats/structure/gro");
const mmcif_1 = require("../../mol-model-formats/structure/mmcif");
const pdb_1 = require("../../mol-model-formats/structure/pdb");
const psf_1 = require("../../mol-model-formats/structure/psf");
const structure_1 = require("../../mol-model/structure");
const builder_1 = require("../../mol-script/language/builder");
const script_1 = require("../../mol-script/script");
const mol_state_1 = require("../../mol-state");
const mol_task_1 = require("../../mol-task");
const mol_util_1 = require("../../mol-util");
const param_definition_1 = require("../../mol-util/param-definition");
const root_structure_1 = require("../helpers/root-structure");
const structure_component_1 = require("../helpers/structure-component");
const structure_query_1 = require("../helpers/structure-query");
const structure_selection_query_1 = require("../helpers/structure-selection-query");
const objects_1 = require("../objects");
const parser_4 = require("../../mol-io/reader/mol/parser");
const mol_1 = require("../../mol-model-formats/structure/mol");
const cif_core_1 = require("../../mol-model-formats/structure/cif-core");
const cube_1 = require("../../mol-model-formats/structure/cube");
const parser_5 = require("../../mol-io/reader/mol2/parser");
const mol2_1 = require("../../mol-model-formats/structure/mol2");
const parser_6 = require("../../mol-io/reader/xtc/parser");
const xtc_1 = require("../../mol-model-formats/structure/xtc");
const parser_7 = require("../../mol-io/reader/xyz/parser");
const xyz_1 = require("../../mol-model-formats/structure/xyz");
const parser_8 = require("../../mol-io/reader/sdf/parser");
const sdf_1 = require("../../mol-model-formats/structure/sdf");
const type_helpers_1 = require("../../mol-util/type-helpers");
const parser_9 = require("../../mol-io/reader/trr/parser");
const trr_1 = require("../../mol-model-formats/structure/trr");
const parser_10 = require("../../mol-io/reader/nctraj/parser");
const nctraj_1 = require("../../mol-model-formats/structure/nctraj");
const prmtop_1 = require("../../mol-model-formats/structure/prmtop");
const top_1 = require("../../mol-model-formats/structure/top");
const CoordinatesFromDcd = objects_1.PluginStateTransform.BuiltIn({
    name: 'coordinates-from-dcd',
    display: { name: 'Parse DCD', description: 'Parse DCD binary data.' },
    from: [objects_1.PluginStateObject.Data.Binary],
    to: objects_1.PluginStateObject.Molecule.Coordinates
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse DCD', async (ctx) => {
            const parsed = await (0, parser_1.parseDcd)(a.data).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            const coordinates = await (0, dcd_1.coordinatesFromDcd)(parsed.result).runInContext(ctx);
            return new objects_1.PluginStateObject.Molecule.Coordinates(coordinates, { label: a.label, description: 'Coordinates' });
        });
    }
});
exports.CoordinatesFromDcd = CoordinatesFromDcd;
const CoordinatesFromXtc = objects_1.PluginStateTransform.BuiltIn({
    name: 'coordinates-from-xtc',
    display: { name: 'Parse XTC', description: 'Parse XTC binary data.' },
    from: [objects_1.PluginStateObject.Data.Binary],
    to: objects_1.PluginStateObject.Molecule.Coordinates
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse XTC', async (ctx) => {
            const parsed = await (0, parser_6.parseXtc)(a.data).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            const coordinates = await (0, xtc_1.coordinatesFromXtc)(parsed.result).runInContext(ctx);
            return new objects_1.PluginStateObject.Molecule.Coordinates(coordinates, { label: a.label, description: 'Coordinates' });
        });
    }
});
exports.CoordinatesFromXtc = CoordinatesFromXtc;
const CoordinatesFromTrr = objects_1.PluginStateTransform.BuiltIn({
    name: 'coordinates-from-trr',
    display: { name: 'Parse TRR', description: 'Parse TRR binary data.' },
    from: [objects_1.PluginStateObject.Data.Binary],
    to: objects_1.PluginStateObject.Molecule.Coordinates
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse TRR', async (ctx) => {
            const parsed = await (0, parser_9.parseTrr)(a.data).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            const coordinates = await (0, trr_1.coordinatesFromTrr)(parsed.result).runInContext(ctx);
            return new objects_1.PluginStateObject.Molecule.Coordinates(coordinates, { label: a.label, description: 'Coordinates' });
        });
    }
});
exports.CoordinatesFromTrr = CoordinatesFromTrr;
const CoordinatesFromNctraj = objects_1.PluginStateTransform.BuiltIn({
    name: 'coordinates-from-nctraj',
    display: { name: 'Parse NCTRAJ', description: 'Parse NCTRAJ binary data.' },
    from: [objects_1.PluginStateObject.Data.Binary],
    to: objects_1.PluginStateObject.Molecule.Coordinates
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse NCTRAJ', async (ctx) => {
            const parsed = await (0, parser_10.parseNctraj)(a.data).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            const coordinates = await (0, nctraj_1.coordinatesFromNctraj)(parsed.result).runInContext(ctx);
            return new objects_1.PluginStateObject.Molecule.Coordinates(coordinates, { label: a.label, description: 'Coordinates' });
        });
    }
});
exports.CoordinatesFromNctraj = CoordinatesFromNctraj;
const TopologyFromPsf = objects_1.PluginStateTransform.BuiltIn({
    name: 'topology-from-psf',
    display: { name: 'PSF Topology', description: 'Create topology from PSF.' },
    from: [objects_1.PluginStateObject.Format.Psf],
    to: objects_1.PluginStateObject.Molecule.Topology
})({
    apply({ a }) {
        return mol_task_1.Task.create('Create Topology', async (ctx) => {
            const topology = await (0, psf_1.topologyFromPsf)(a.data).runInContext(ctx);
            return new objects_1.PluginStateObject.Molecule.Topology(topology, { label: topology.label || a.label, description: 'Topology' });
        });
    }
});
exports.TopologyFromPsf = TopologyFromPsf;
const TopologyFromPrmtop = objects_1.PluginStateTransform.BuiltIn({
    name: 'topology-from-prmtop',
    display: { name: 'PRMTOP Topology', description: 'Create topology from PRMTOP.' },
    from: [objects_1.PluginStateObject.Format.Prmtop],
    to: objects_1.PluginStateObject.Molecule.Topology
})({
    apply({ a }) {
        return mol_task_1.Task.create('Create Topology', async (ctx) => {
            const topology = await (0, prmtop_1.topologyFromPrmtop)(a.data).runInContext(ctx);
            return new objects_1.PluginStateObject.Molecule.Topology(topology, { label: topology.label || a.label, description: 'Topology' });
        });
    }
});
exports.TopologyFromPrmtop = TopologyFromPrmtop;
const TopologyFromTop = objects_1.PluginStateTransform.BuiltIn({
    name: 'topology-from-top',
    display: { name: 'TOP Topology', description: 'Create topology from TOP.' },
    from: [objects_1.PluginStateObject.Format.Top],
    to: objects_1.PluginStateObject.Molecule.Topology
})({
    apply({ a }) {
        return mol_task_1.Task.create('Create Topology', async (ctx) => {
            const topology = await (0, top_1.topologyFromTop)(a.data).runInContext(ctx);
            return new objects_1.PluginStateObject.Molecule.Topology(topology, { label: topology.label || a.label, description: 'Topology' });
        });
    }
});
exports.TopologyFromTop = TopologyFromTop;
async function getTrajectory(ctx, obj, coordinates) {
    if (obj.type === objects_1.PluginStateObject.Molecule.Topology.type) {
        const topology = obj.data;
        return await structure_1.Model.trajectoryFromTopologyAndCoordinates(topology, coordinates).runInContext(ctx);
    }
    else if (obj.type === objects_1.PluginStateObject.Molecule.Model.type) {
        const model = obj.data;
        return structure_1.Model.trajectoryFromModelAndCoordinates(model, coordinates);
    }
    throw new Error('no model/topology found');
}
const TrajectoryFromModelAndCoordinates = objects_1.PluginStateTransform.BuiltIn({
    name: 'trajectory-from-model-and-coordinates',
    display: { name: 'Trajectory from Topology & Coordinates', description: 'Create a trajectory from existing model/topology and coordinates.' },
    from: objects_1.PluginStateObject.Root,
    to: objects_1.PluginStateObject.Molecule.Trajectory,
    params: {
        modelRef: param_definition_1.ParamDefinition.Text('', { isHidden: true }),
        coordinatesRef: param_definition_1.ParamDefinition.Text('', { isHidden: true }),
    }
})({
    apply({ params, dependencies }) {
        return mol_task_1.Task.create('Create trajectory from model/topology and coordinates', async (ctx) => {
            const coordinates = dependencies[params.coordinatesRef].data;
            const trajectory = await getTrajectory(ctx, dependencies[params.modelRef], coordinates);
            const props = { label: 'Trajectory', description: `${trajectory.frameCount} model${trajectory.frameCount === 1 ? '' : 's'}` };
            return new objects_1.PluginStateObject.Molecule.Trajectory(trajectory, props);
        });
    }
});
exports.TrajectoryFromModelAndCoordinates = TrajectoryFromModelAndCoordinates;
const TrajectoryFromBlob = objects_1.PluginStateTransform.BuiltIn({
    name: 'trajectory-from-blob',
    display: { name: 'Parse Blob', description: 'Parse format blob into a single trajectory.' },
    from: objects_1.PluginStateObject.Format.Blob,
    to: objects_1.PluginStateObject.Molecule.Trajectory
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse Format Blob', async (ctx) => {
            const models = [];
            for (const e of a.data) {
                if (e.kind !== 'cif')
                    continue;
                const block = e.data.blocks[0];
                const xs = await (0, mmcif_1.trajectoryFromMmCIF)(block).runInContext(ctx);
                if (xs.frameCount === 0)
                    throw new Error('No models found.');
                for (let i = 0; i < xs.frameCount; i++) {
                    const x = await mol_task_1.Task.resolveInContext(xs.getFrameAtIndex(i), ctx);
                    models.push(x);
                }
            }
            for (let i = 0; i < models.length; i++) {
                structure_1.Model.TrajectoryInfo.set(models[i], { index: i, size: models.length });
            }
            const props = { label: 'Trajectory', description: `${models.length} model${models.length === 1 ? '' : 's'}` };
            return new objects_1.PluginStateObject.Molecule.Trajectory(new structure_1.ArrayTrajectory(models), props);
        });
    }
});
exports.TrajectoryFromBlob = TrajectoryFromBlob;
function trajectoryProps(trajectory) {
    const first = trajectory.representative;
    return { label: `${first.entry}`, description: `${trajectory.frameCount} model${trajectory.frameCount === 1 ? '' : 's'}` };
}
const TrajectoryFromMmCif = objects_1.PluginStateTransform.BuiltIn({
    name: 'trajectory-from-mmcif',
    display: { name: 'Trajectory from mmCIF', description: 'Identify and create all separate models in the specified CIF data block' },
    from: objects_1.PluginStateObject.Format.Cif,
    to: objects_1.PluginStateObject.Molecule.Trajectory,
    params(a) {
        if (!a) {
            return {
                loadAllBlocks: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Boolean(false, { description: 'If True, ignore Block Header and Block Index parameters and parse all datablocks into a single trajectory.' })),
                blockHeader: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text(void 0, { description: 'Header of the block to parse. If not specifed, Block Index parameter applies.', hideIf: p => p.loadAllBlocks === true })),
                blockIndex: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Numeric(0, { min: 0, step: 1 }, { description: 'Zero-based index of the block to parse. Only applies when Block Header parameter is not specified.', hideIf: p => p.loadAllBlocks === true || p.blockHeader })),
            };
        }
        const { blocks } = a.data;
        const headers = blocks.map(b => [b.header, b.header]);
        headers.push(['', '[Use Block Index]']);
        return {
            loadAllBlocks: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Boolean(false, { description: 'If True, ignore Block Header and Block Index parameters and parse all data blocks into a single trajectory.' })),
            blockHeader: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Select(blocks[0] && blocks[0].header, headers, { description: 'Header of the block to parse. If not specifed, Block Index parameter applies.', hideIf: p => p.loadAllBlocks === true })),
            blockIndex: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Numeric(0, { min: 0, step: 1, max: blocks.length - 1 }, { description: 'Zero-based index of the block to parse. Only applies when Block Header parameter is not specified.', hideIf: p => p.loadAllBlocks === true || p.blockHeader })),
        };
    }
})({
    isApplicable: a => a.data.blocks.length > 0,
    apply({ a, params }) {
        return mol_task_1.Task.create('Parse mmCIF', async (ctx) => {
            var _a;
            let trajectory;
            if (params.loadAllBlocks) {
                const models = [];
                for (const block of a.data.blocks) {
                    if (ctx.shouldUpdate) {
                        await ctx.update(`Parsing ${block.header}...`);
                    }
                    const t = await (0, mmcif_1.trajectoryFromMmCIF)(block).runInContext(ctx);
                    for (let i = 0; i < t.frameCount; i++) {
                        models.push(await mol_task_1.Task.resolveInContext(t.getFrameAtIndex(i), ctx));
                    }
                }
                trajectory = new structure_1.ArrayTrajectory(models);
            }
            else {
                const header = params.blockHeader || a.data.blocks[(_a = params.blockIndex) !== null && _a !== void 0 ? _a : 0].header;
                const block = a.data.blocks.find(b => b.header === header);
                if (!block)
                    throw new Error(`Data block '${[header]}' not found.`);
                const isCcd = block.categoryNames.includes('chem_comp_atom') && !block.categoryNames.includes('atom_site') && !block.categoryNames.includes('ihm_sphere_obj_site') && !block.categoryNames.includes('ihm_gaussian_obj_site');
                trajectory = isCcd ? await (0, mmcif_1.trajectoryFromCCD)(block).runInContext(ctx) : await (0, mmcif_1.trajectoryFromMmCIF)(block, a.data).runInContext(ctx);
            }
            if (trajectory.frameCount === 0)
                throw new Error('No models found.');
            const props = trajectoryProps(trajectory);
            return new objects_1.PluginStateObject.Molecule.Trajectory(trajectory, props);
        });
    }
});
exports.TrajectoryFromMmCif = TrajectoryFromMmCif;
const TrajectoryFromPDB = objects_1.PluginStateTransform.BuiltIn({
    name: 'trajectory-from-pdb',
    display: { name: 'Parse PDB', description: 'Parse PDB string and create trajectory.' },
    from: [objects_1.PluginStateObject.Data.String],
    to: objects_1.PluginStateObject.Molecule.Trajectory,
    params: {
        isPdbqt: param_definition_1.ParamDefinition.Boolean(false)
    }
})({
    apply({ a, params }) {
        return mol_task_1.Task.create('Parse PDB', async (ctx) => {
            const parsed = await (0, parser_3.parsePDB)(a.data, a.label, params.isPdbqt).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            const models = await (0, pdb_1.trajectoryFromPDB)(parsed.result).runInContext(ctx);
            const props = trajectoryProps(models);
            return new objects_1.PluginStateObject.Molecule.Trajectory(models, props);
        });
    }
});
exports.TrajectoryFromPDB = TrajectoryFromPDB;
const TrajectoryFromGRO = objects_1.PluginStateTransform.BuiltIn({
    name: 'trajectory-from-gro',
    display: { name: 'Parse GRO', description: 'Parse GRO string and create trajectory.' },
    from: [objects_1.PluginStateObject.Data.String],
    to: objects_1.PluginStateObject.Molecule.Trajectory
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse GRO', async (ctx) => {
            const parsed = await (0, parser_2.parseGRO)(a.data).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            const models = await (0, gro_1.trajectoryFromGRO)(parsed.result).runInContext(ctx);
            const props = trajectoryProps(models);
            return new objects_1.PluginStateObject.Molecule.Trajectory(models, props);
        });
    }
});
exports.TrajectoryFromGRO = TrajectoryFromGRO;
const TrajectoryFromXYZ = objects_1.PluginStateTransform.BuiltIn({
    name: 'trajectory-from-xyz',
    display: { name: 'Parse XYZ', description: 'Parse XYZ string and create trajectory.' },
    from: [objects_1.PluginStateObject.Data.String],
    to: objects_1.PluginStateObject.Molecule.Trajectory
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse XYZ', async (ctx) => {
            const parsed = await (0, parser_7.parseXyz)(a.data).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            const models = await (0, xyz_1.trajectoryFromXyz)(parsed.result).runInContext(ctx);
            const props = trajectoryProps(models);
            return new objects_1.PluginStateObject.Molecule.Trajectory(models, props);
        });
    }
});
exports.TrajectoryFromXYZ = TrajectoryFromXYZ;
const TrajectoryFromMOL = objects_1.PluginStateTransform.BuiltIn({
    name: 'trajectory-from-mol',
    display: { name: 'Parse MOL', description: 'Parse MOL string and create trajectory.' },
    from: [objects_1.PluginStateObject.Data.String],
    to: objects_1.PluginStateObject.Molecule.Trajectory
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse MOL', async (ctx) => {
            const parsed = await (0, parser_4.parseMol)(a.data).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            const models = await (0, mol_1.trajectoryFromMol)(parsed.result).runInContext(ctx);
            const props = trajectoryProps(models);
            return new objects_1.PluginStateObject.Molecule.Trajectory(models, props);
        });
    }
});
exports.TrajectoryFromMOL = TrajectoryFromMOL;
const TrajectoryFromSDF = objects_1.PluginStateTransform.BuiltIn({
    name: 'trajectory-from-sdf',
    display: { name: 'Parse SDF', description: 'Parse SDF string and create trajectory.' },
    from: [objects_1.PluginStateObject.Data.String],
    to: objects_1.PluginStateObject.Molecule.Trajectory
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse SDF', async (ctx) => {
            const parsed = await (0, parser_8.parseSdf)(a.data).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            const models = [];
            for (const compound of parsed.result.compounds) {
                const traj = await (0, sdf_1.trajectoryFromSdf)(compound).runInContext(ctx);
                for (let i = 0; i < traj.frameCount; i++) {
                    models.push(await mol_task_1.Task.resolveInContext(traj.getFrameAtIndex(i), ctx));
                }
            }
            const traj = new structure_1.ArrayTrajectory(models);
            const props = trajectoryProps(traj);
            return new objects_1.PluginStateObject.Molecule.Trajectory(traj, props);
        });
    }
});
exports.TrajectoryFromSDF = TrajectoryFromSDF;
const TrajectoryFromMOL2 = objects_1.PluginStateTransform.BuiltIn({
    name: 'trajectory-from-mol2',
    display: { name: 'Parse MOL2', description: 'Parse MOL2 string and create trajectory.' },
    from: [objects_1.PluginStateObject.Data.String],
    to: objects_1.PluginStateObject.Molecule.Trajectory
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse MOL2', async (ctx) => {
            const parsed = await (0, parser_5.parseMol2)(a.data, a.label).runInContext(ctx);
            if (parsed.isError)
                throw new Error(parsed.message);
            const models = await (0, mol2_1.trajectoryFromMol2)(parsed.result).runInContext(ctx);
            const props = trajectoryProps(models);
            return new objects_1.PluginStateObject.Molecule.Trajectory(models, props);
        });
    }
});
exports.TrajectoryFromMOL2 = TrajectoryFromMOL2;
const TrajectoryFromCube = objects_1.PluginStateTransform.BuiltIn({
    name: 'trajectory-from-cube',
    display: { name: 'Parse Cube', description: 'Parse Cube file to create a trajectory.' },
    from: objects_1.PluginStateObject.Format.Cube,
    to: objects_1.PluginStateObject.Molecule.Trajectory
})({
    apply({ a }) {
        return mol_task_1.Task.create('Parse MOL', async (ctx) => {
            const models = await (0, cube_1.trajectoryFromCube)(a.data).runInContext(ctx);
            const props = trajectoryProps(models);
            return new objects_1.PluginStateObject.Molecule.Trajectory(models, props);
        });
    }
});
exports.TrajectoryFromCube = TrajectoryFromCube;
const TrajectoryFromCifCore = objects_1.PluginStateTransform.BuiltIn({
    name: 'trajectory-from-cif-core',
    display: { name: 'Parse CIF Core', description: 'Identify and create all separate models in the specified CIF data block' },
    from: objects_1.PluginStateObject.Format.Cif,
    to: objects_1.PluginStateObject.Molecule.Trajectory,
    params(a) {
        if (!a) {
            return {
                blockHeader: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text(void 0, { description: 'Header of the block to parse. If none is specifed, the 1st data block in the file is used.' }))
            };
        }
        const { blocks } = a.data;
        return {
            blockHeader: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Select(blocks[0] && blocks[0].header, blocks.map(b => [b.header, b.header]), { description: 'Header of the block to parse' }))
        };
    }
})({
    apply({ a, params }) {
        return mol_task_1.Task.create('Parse CIF Core', async (ctx) => {
            const header = params.blockHeader || a.data.blocks[0].header;
            const block = a.data.blocks.find(b => b.header === header);
            if (!block)
                throw new Error(`Data block '${[header]}' not found.`);
            const models = await (0, cif_core_1.trajectoryFromCifCore)(block).runInContext(ctx);
            if (models.frameCount === 0)
                throw new Error('No models found.');
            const props = trajectoryProps(models);
            return new objects_1.PluginStateObject.Molecule.Trajectory(models, props);
        });
    }
});
exports.TrajectoryFromCifCore = TrajectoryFromCifCore;
const plus1 = (v) => v + 1, minus1 = (v) => v - 1;
const ModelFromTrajectory = objects_1.PluginStateTransform.BuiltIn({
    name: 'model-from-trajectory',
    display: { name: 'Molecular Model', description: 'Create a molecular model from specified index in a trajectory.' },
    from: objects_1.PluginStateObject.Molecule.Trajectory,
    to: objects_1.PluginStateObject.Molecule.Model,
    params: a => {
        if (!a) {
            return { modelIndex: param_definition_1.ParamDefinition.Numeric(0, {}, { description: 'Zero-based index of the model', immediateUpdate: true }) };
        }
        return { modelIndex: param_definition_1.ParamDefinition.Converted(plus1, minus1, param_definition_1.ParamDefinition.Numeric(1, { min: 1, max: a.data.frameCount, step: 1 }, { description: 'Model Index', immediateUpdate: true })) };
    }
})({
    isApplicable: a => a.data.frameCount > 0,
    apply({ a, params }) {
        return mol_task_1.Task.create('Model from Trajectory', async (ctx) => {
            let modelIndex = params.modelIndex % a.data.frameCount;
            if (modelIndex < 0)
                modelIndex += a.data.frameCount;
            const model = await mol_task_1.Task.resolveInContext(a.data.getFrameAtIndex(modelIndex), ctx);
            const label = `Model ${modelIndex + 1}`;
            const description = a.data.frameCount === 1 ? undefined : `of ${a.data.frameCount}`;
            return new objects_1.PluginStateObject.Molecule.Model(model, { label, description });
        });
    },
    interpolate(a, b, t) {
        const modelIndex = t >= 1 ? b.modelIndex : a.modelIndex + Math.floor((b.modelIndex - a.modelIndex + 1) * t);
        return { modelIndex };
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customProperties.dispose();
    }
});
exports.ModelFromTrajectory = ModelFromTrajectory;
const StructureFromTrajectory = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-from-trajectory',
    display: { name: 'Structure from Trajectory', description: 'Create a molecular structure from a trajectory.' },
    from: objects_1.PluginStateObject.Molecule.Trajectory,
    to: objects_1.PluginStateObject.Molecule.Structure
})({
    apply({ a }) {
        return mol_task_1.Task.create('Build Structure', async (ctx) => {
            const s = await structure_1.Structure.ofTrajectory(a.data, ctx);
            const props = { label: 'Ensemble', description: structure_1.Structure.elementDescription(s) };
            return new objects_1.PluginStateObject.Molecule.Structure(s, props);
        });
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
exports.StructureFromTrajectory = StructureFromTrajectory;
const StructureFromModel = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-from-model',
    display: { name: 'Structure', description: 'Create a molecular structure (model, assembly, or symmetry) from the specified model.' },
    from: objects_1.PluginStateObject.Molecule.Model,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params(a) { return root_structure_1.RootStructureDefinition.getParams(a && a.data); }
})({
    canAutoUpdate({ oldParams, newParams }) {
        return root_structure_1.RootStructureDefinition.canAutoUpdate(oldParams.type, newParams.type);
    },
    apply({ a, params }, plugin) {
        return mol_task_1.Task.create('Build Structure', async (ctx) => {
            return root_structure_1.RootStructureDefinition.create(plugin, ctx, a.data, params && params.type);
        });
    },
    update: ({ a, b, oldParams, newParams }) => {
        if (!(0, mol_util_1.deepEqual)(oldParams, newParams))
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        if (b.data.model === a.data)
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        if (!structure_1.Model.areHierarchiesEqual(a.data, b.data.model))
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        b.data = b.data.remapModel(a.data);
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
exports.StructureFromModel = StructureFromModel;
const _translation = (0, linear_algebra_1.Vec3)(), _m = (0, linear_algebra_1.Mat4)(), _n = (0, linear_algebra_1.Mat4)();
const TransformStructureConformation = objects_1.PluginStateTransform.BuiltIn({
    name: 'transform-structure-conformation',
    display: { name: 'Transform Conformation' },
    isDecorator: true,
    from: objects_1.PluginStateObject.Molecule.Structure,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: {
        transform: param_definition_1.ParamDefinition.MappedStatic('components', {
            components: param_definition_1.ParamDefinition.Group({
                axis: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(1, 0, 0)),
                angle: param_definition_1.ParamDefinition.Numeric(0, { min: -180, max: 180, step: 0.1 }),
                translation: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(0, 0, 0)),
            }, { isFlat: true }),
            matrix: param_definition_1.ParamDefinition.Group({
                data: param_definition_1.ParamDefinition.Mat4(linear_algebra_1.Mat4.identity()),
                transpose: param_definition_1.ParamDefinition.Boolean(false)
            }, { isFlat: true })
        }, { label: 'Kind' })
    }
})({
    canAutoUpdate({ newParams }) {
        return newParams.transform.name !== 'matrix';
    },
    apply({ a, params }) {
        // TODO: optimze
        // TODO: think of ways how to fast-track changes to this for animations
        const transform = (0, linear_algebra_1.Mat4)();
        if (params.transform.name === 'components') {
            const { axis, angle, translation } = params.transform.params;
            const center = a.data.boundary.sphere.center;
            linear_algebra_1.Mat4.fromTranslation(_m, linear_algebra_1.Vec3.negate(_translation, center));
            linear_algebra_1.Mat4.fromTranslation(_n, linear_algebra_1.Vec3.add(_translation, center, translation));
            const rot = linear_algebra_1.Mat4.fromRotation((0, linear_algebra_1.Mat4)(), Math.PI / 180 * angle, linear_algebra_1.Vec3.normalize((0, linear_algebra_1.Vec3)(), axis));
            linear_algebra_1.Mat4.mul3(transform, _n, rot, _m);
        }
        else if (params.transform.name === 'matrix') {
            linear_algebra_1.Mat4.copy(transform, params.transform.params.data);
            if (params.transform.params.transpose)
                linear_algebra_1.Mat4.transpose(transform, transform);
        }
        const s = structure_1.Structure.transform(a.data, transform);
        return new objects_1.PluginStateObject.Molecule.Structure(s, { label: a.label, description: `${a.description} [Transformed]` });
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
    // interpolate(src, tar, t) {
    //     // TODO: optimize
    //     const u = Mat4.fromRotation(Mat4(), Math.PI / 180 * src.angle, Vec3.normalize(Vec3(), src.axis));
    //     Mat4.setTranslation(u, src.translation);
    //     const v = Mat4.fromRotation(Mat4(), Math.PI / 180 * tar.angle, Vec3.normalize(Vec3(), tar.axis));
    //     Mat4.setTranslation(v, tar.translation);
    //     const m = SymmetryOperator.slerp(Mat4(), u, v, t);
    //     const rot = Mat4.getRotation(Quat.zero(), m);
    //     const axis = Vec3();
    //     const angle = Quat.getAxisAngle(axis, rot);
    //     const translation = Mat4.getTranslation(Vec3(), m);
    //     return { axis, angle, translation };
    // }
});
exports.TransformStructureConformation = TransformStructureConformation;
const StructureSelectionFromExpression = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-selection-from-expression',
    display: { name: 'Selection', description: 'Create a molecular structure from the specified expression.' },
    from: objects_1.PluginStateObject.Molecule.Structure,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: () => ({
        expression: param_definition_1.ParamDefinition.Value(builder_1.MolScriptBuilder.struct.generator.all, { isHidden: true }),
        label: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text('', { isHidden: true }))
    })
})({
    apply({ a, params, cache }) {
        const { selection, entry } = structure_query_1.StructureQueryHelper.createAndRun(a.data, params.expression);
        cache.entry = entry;
        if (structure_1.StructureSelection.isEmpty(selection))
            return mol_state_1.StateObject.Null;
        const s = structure_1.StructureSelection.unionStructure(selection);
        const props = { label: `${params.label || 'Selection'}`, description: structure_1.Structure.elementDescription(s) };
        return new objects_1.PluginStateObject.Molecule.Structure(s, props);
    },
    update: ({ a, b, oldParams, newParams, cache }) => {
        if (oldParams.expression !== newParams.expression)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const entry = cache.entry;
        if (entry.currentStructure === a.data) {
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        }
        const selection = structure_query_1.StructureQueryHelper.updateStructure(entry, a.data);
        if (structure_1.StructureSelection.isEmpty(selection))
            return mol_state_1.StateTransformer.UpdateResult.Null;
        structure_query_1.StructureQueryHelper.updateStructureObject(b, selection, newParams.label);
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
exports.StructureSelectionFromExpression = StructureSelectionFromExpression;
const MultiStructureSelectionFromExpression = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-multi-selection-from-expression',
    display: { name: 'Multi-structure Measurement Selection', description: 'Create selection object from multiple structures.' },
    from: objects_1.PluginStateObject.Root,
    to: objects_1.PluginStateObject.Molecule.Structure.Selections,
    params: () => ({
        selections: param_definition_1.ParamDefinition.ObjectList({
            key: param_definition_1.ParamDefinition.Text(void 0, { description: 'A unique key.' }),
            ref: param_definition_1.ParamDefinition.Text(),
            groupId: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text()),
            expression: param_definition_1.ParamDefinition.Value(builder_1.MolScriptBuilder.struct.generator.empty)
        }, e => e.ref, { isHidden: true }),
        isTransitive: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Boolean(false, { isHidden: true, description: 'Remap the selections from the original structure if structurally equivalent.' })),
        label: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text('', { isHidden: true }))
    })
})({
    apply({ params, cache, dependencies }) {
        const entries = new Map();
        const selections = [];
        let totalSize = 0;
        for (const sel of params.selections) {
            const { selection, entry } = structure_query_1.StructureQueryHelper.createAndRun(dependencies[sel.ref].data, sel.expression);
            entries.set(sel.key, entry);
            const loci = structure_1.StructureSelection.toLociWithSourceUnits(selection);
            selections.push({ key: sel.key, loci, groupId: sel.groupId });
            totalSize += structure_1.StructureElement.Loci.size(loci);
        }
        cache.entries = entries;
        const props = { label: `${params.label || 'Multi-selection'}`, description: `${params.selections.length} source(s), ${totalSize} element(s) total` };
        return new objects_1.PluginStateObject.Molecule.Structure.Selections(selections, props);
    },
    update: ({ b, oldParams, newParams, cache, dependencies }) => {
        if (!!oldParams.isTransitive !== !!newParams.isTransitive)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        const cacheEntries = cache.entries;
        const entries = new Map();
        const current = new Map();
        for (const e of b.data)
            current.set(e.key, e);
        let changed = false;
        let totalSize = 0;
        const selections = [];
        for (const sel of newParams.selections) {
            const structure = dependencies[sel.ref].data;
            let recreate = false;
            if (cacheEntries.has(sel.key)) {
                const entry = cacheEntries.get(sel.key);
                if (structure_query_1.StructureQueryHelper.isUnchanged(entry, sel.expression, structure) && current.has(sel.key)) {
                    const loci = current.get(sel.key);
                    if (loci.groupId !== sel.groupId) {
                        loci.groupId = sel.groupId;
                        changed = true;
                    }
                    entries.set(sel.key, entry);
                    selections.push(loci);
                    totalSize += structure_1.StructureElement.Loci.size(loci.loci);
                    continue;
                }
                if (entry.expression !== sel.expression) {
                    recreate = true;
                }
                else {
                    // TODO: properly support "transitive" queries. For that Structure.areUnitAndIndicesEqual needs to be fixed;
                    let update = false;
                    if (!!newParams.isTransitive) {
                        if (structure_1.Structure.areUnitIdsAndIndicesEqual(entry.originalStructure, structure)) {
                            const selection = structure_query_1.StructureQueryHelper.run(entry, entry.originalStructure);
                            entry.currentStructure = structure;
                            entries.set(sel.key, entry);
                            const loci = structure_1.StructureElement.Loci.remap(structure_1.StructureSelection.toLociWithSourceUnits(selection), structure);
                            selections.push({ key: sel.key, loci, groupId: sel.groupId });
                            totalSize += structure_1.StructureElement.Loci.size(loci);
                            changed = true;
                        }
                        else {
                            update = true;
                        }
                    }
                    else {
                        update = true;
                    }
                    if (update) {
                        changed = true;
                        const selection = structure_query_1.StructureQueryHelper.updateStructure(entry, structure);
                        entries.set(sel.key, entry);
                        const loci = structure_1.StructureSelection.toLociWithSourceUnits(selection);
                        selections.push({ key: sel.key, loci, groupId: sel.groupId });
                        totalSize += structure_1.StructureElement.Loci.size(loci);
                    }
                }
            }
            else {
                recreate = true;
            }
            if (recreate) {
                changed = true;
                // create new selection
                const { selection, entry } = structure_query_1.StructureQueryHelper.createAndRun(structure, sel.expression);
                entries.set(sel.key, entry);
                const loci = structure_1.StructureSelection.toLociWithSourceUnits(selection);
                selections.push({ key: sel.key, loci });
                totalSize += structure_1.StructureElement.Loci.size(loci);
            }
        }
        if (!changed)
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        cache.entries = entries;
        b.data = selections;
        b.label = `${newParams.label || 'Multi-selection'}`;
        b.description = `${selections.length} source(s), ${totalSize} element(s) total`;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    }
});
exports.MultiStructureSelectionFromExpression = MultiStructureSelectionFromExpression;
const StructureSelectionFromScript = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-selection-from-script',
    display: { name: 'Selection', description: 'Create a molecular structure from the specified script.' },
    from: objects_1.PluginStateObject.Molecule.Structure,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: () => ({
        script: param_definition_1.ParamDefinition.Script({ language: 'mol-script', expression: '(sel.atom.atom-groups :residue-test (= atom.resname ALA))' }),
        label: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text(''))
    })
})({
    apply({ a, params, cache }) {
        const { selection, entry } = structure_query_1.StructureQueryHelper.createAndRun(a.data, params.script);
        cache.entry = entry;
        const s = structure_1.StructureSelection.unionStructure(selection);
        const props = { label: `${params.label || 'Selection'}`, description: structure_1.Structure.elementDescription(s) };
        return new objects_1.PluginStateObject.Molecule.Structure(s, props);
    },
    update: ({ a, b, oldParams, newParams, cache }) => {
        if (!script_1.Script.areEqual(oldParams.script, newParams.script)) {
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        }
        const entry = cache.entry;
        if (entry.currentStructure === a.data) {
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        }
        const selection = structure_query_1.StructureQueryHelper.updateStructure(entry, a.data);
        structure_query_1.StructureQueryHelper.updateStructureObject(b, selection, newParams.label);
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
exports.StructureSelectionFromScript = StructureSelectionFromScript;
const StructureSelectionFromBundle = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-selection-from-bundle',
    display: { name: 'Selection', description: 'Create a molecular structure from the specified structure-element bundle.' },
    from: objects_1.PluginStateObject.Molecule.Structure,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: () => ({
        bundle: param_definition_1.ParamDefinition.Value(structure_1.StructureElement.Bundle.Empty, { isHidden: true }),
        label: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text('', { isHidden: true }))
    })
})({
    apply({ a, params, cache }) {
        if (params.bundle.hash !== a.data.hashCode) {
            return mol_state_1.StateObject.Null;
        }
        cache.source = a.data;
        const s = structure_1.StructureElement.Bundle.toStructure(params.bundle, a.data);
        if (s.elementCount === 0)
            return mol_state_1.StateObject.Null;
        const props = { label: `${params.label || 'Selection'}`, description: structure_1.Structure.elementDescription(s) };
        return new objects_1.PluginStateObject.Molecule.Structure(s, props);
    },
    update: ({ a, b, oldParams, newParams, cache }) => {
        if (!structure_1.StructureElement.Bundle.areEqual(oldParams.bundle, newParams.bundle)) {
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        }
        if (newParams.bundle.hash !== a.data.hashCode) {
            return mol_state_1.StateTransformer.UpdateResult.Null;
        }
        if (cache.source === a.data) {
            return mol_state_1.StateTransformer.UpdateResult.Unchanged;
        }
        cache.source = a.data;
        const s = structure_1.StructureElement.Bundle.toStructure(newParams.bundle, a.data);
        if (s.elementCount === 0)
            return mol_state_1.StateTransformer.UpdateResult.Null;
        b.label = `${newParams.label || 'Selection'}`;
        b.description = structure_1.Structure.elementDescription(s);
        b.data = s;
        return mol_state_1.StateTransformer.UpdateResult.Updated;
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
exports.StructureSelectionFromBundle = StructureSelectionFromBundle;
exports.StructureComplexElementTypes = {
    'polymer': 'polymer',
    'protein': 'protein',
    'nucleic': 'nucleic',
    'water': 'water',
    'branched': 'branched', // = carbs
    'ligand': 'ligand',
    'non-standard': 'non-standard',
    'coarse': 'coarse',
    // Legacy
    'atomic-sequence': 'atomic-sequence',
    'atomic-het': 'atomic-het',
    'spheres': 'spheres'
};
const StructureComplexElementTypeTuples = param_definition_1.ParamDefinition.objectToOptions(exports.StructureComplexElementTypes);
const StructureComplexElement = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-complex-element',
    display: { name: 'Complex Element', description: 'Create a molecular structure from the specified model.' },
    from: objects_1.PluginStateObject.Molecule.Structure,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: { type: param_definition_1.ParamDefinition.Select('atomic-sequence', StructureComplexElementTypeTuples, { isHidden: true }) }
})({
    apply({ a, params }) {
        // TODO: update function.
        let query, label;
        switch (params.type) {
            case 'polymer':
                query = structure_selection_query_1.StructureSelectionQueries.polymer.query;
                label = 'Polymer';
                break;
            case 'protein':
                query = structure_selection_query_1.StructureSelectionQueries.protein.query;
                label = 'Protein';
                break;
            case 'nucleic':
                query = structure_selection_query_1.StructureSelectionQueries.nucleic.query;
                label = 'Nucleic';
                break;
            case 'water':
                query = structure_1.Queries.internal.water();
                label = 'Water';
                break;
            case 'branched':
                query = structure_selection_query_1.StructureSelectionQueries.branchedPlusConnected.query;
                label = 'Branched';
                break;
            case 'ligand':
                query = structure_selection_query_1.StructureSelectionQueries.ligandPlusConnected.query;
                label = 'Ligand';
                break;
            case 'non-standard':
                query = structure_selection_query_1.StructureSelectionQueries.nonStandardPolymer.query;
                label = 'Non-standard';
                break;
            case 'coarse':
                query = structure_selection_query_1.StructureSelectionQueries.coarse.query;
                label = 'Coarse';
                break;
            case 'atomic-sequence':
                query = structure_1.Queries.internal.atomicSequence();
                label = 'Sequence';
                break;
            case 'atomic-het':
                query = structure_1.Queries.internal.atomicHet();
                label = 'HET Groups/Ligands';
                break;
            case 'spheres':
                query = structure_1.Queries.internal.spheres();
                label = 'Coarse Spheres';
                break;
            default: (0, type_helpers_1.assertUnreachable)(params.type);
        }
        const result = query(new structure_1.QueryContext(a.data));
        const s = structure_1.StructureSelection.unionStructure(result);
        if (s.elementCount === 0)
            return mol_state_1.StateObject.Null;
        return new objects_1.PluginStateObject.Molecule.Structure(s, { label, description: structure_1.Structure.elementDescription(s) });
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
exports.StructureComplexElement = StructureComplexElement;
const StructureComponent = objects_1.PluginStateTransform.BuiltIn({
    name: 'structure-component',
    display: { name: 'Component', description: 'A molecular structure component.' },
    from: objects_1.PluginStateObject.Molecule.Structure,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: structure_component_1.StructureComponentParams
})({
    apply({ a, params, cache }) {
        return (0, structure_component_1.createStructureComponent)(a.data, params, cache);
    },
    update: ({ a, b, oldParams, newParams, cache }) => {
        return (0, structure_component_1.updateStructureComponent)(a.data, b, oldParams, newParams, cache);
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
exports.StructureComponent = StructureComponent;
const CustomModelProperties = objects_1.PluginStateTransform.BuiltIn({
    name: 'custom-model-properties',
    display: { name: 'Custom Model Properties' },
    isDecorator: true,
    from: objects_1.PluginStateObject.Molecule.Model,
    to: objects_1.PluginStateObject.Molecule.Model,
    params: (a, ctx) => {
        return ctx.customModelProperties.getParams(a === null || a === void 0 ? void 0 : a.data);
    }
})({
    apply({ a, params }, ctx) {
        return mol_task_1.Task.create('Custom Props', async (taskCtx) => {
            await attachModelProps(a.data, ctx, taskCtx, params);
            return new objects_1.PluginStateObject.Molecule.Model(a.data, { label: a.label, description: a.description });
        });
    },
    update({ a, b, oldParams, newParams }, ctx) {
        return mol_task_1.Task.create('Custom Props', async (taskCtx) => {
            b.data = a.data;
            b.label = a.label;
            b.description = a.description;
            for (const name of oldParams.autoAttach) {
                const property = ctx.customModelProperties.get(name);
                if (!property)
                    continue;
                a.data.customProperties.reference(property.descriptor, false);
            }
            await attachModelProps(a.data, ctx, taskCtx, newParams);
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customProperties.dispose();
    }
});
exports.CustomModelProperties = CustomModelProperties;
async function attachModelProps(model, ctx, taskCtx, params) {
    const propertyCtx = { runtime: taskCtx, assetManager: ctx.managers.asset };
    const { autoAttach, properties } = params;
    for (const name of Object.keys(properties)) {
        const property = ctx.customModelProperties.get(name);
        const props = properties[name];
        if (autoAttach.includes(name) || property.isHidden) {
            try {
                await property.attach(propertyCtx, model, props, true);
            }
            catch (e) {
                ctx.log.warn(`Error attaching model prop '${name}': ${e}`);
            }
        }
        else {
            property.set(model, props);
        }
    }
}
const CustomStructureProperties = objects_1.PluginStateTransform.BuiltIn({
    name: 'custom-structure-properties',
    display: { name: 'Custom Structure Properties' },
    isDecorator: true,
    from: objects_1.PluginStateObject.Molecule.Structure,
    to: objects_1.PluginStateObject.Molecule.Structure,
    params: (a, ctx) => {
        return ctx.customStructureProperties.getParams(a === null || a === void 0 ? void 0 : a.data.root);
    }
})({
    apply({ a, params }, ctx) {
        return mol_task_1.Task.create('Custom Props', async (taskCtx) => {
            await attachStructureProps(a.data.root, ctx, taskCtx, params);
            return new objects_1.PluginStateObject.Molecule.Structure(a.data, { label: a.label, description: a.description });
        });
    },
    update({ a, b, oldParams, newParams }, ctx) {
        if (a.data !== b.data)
            return mol_state_1.StateTransformer.UpdateResult.Recreate;
        return mol_task_1.Task.create('Custom Props', async (taskCtx) => {
            b.data = a.data;
            b.label = a.label;
            b.description = a.description;
            for (const name of oldParams.autoAttach) {
                const property = ctx.customStructureProperties.get(name);
                if (!property)
                    continue;
                a.data.customPropertyDescriptors.reference(property.descriptor, false);
            }
            await attachStructureProps(a.data.root, ctx, taskCtx, newParams);
            return mol_state_1.StateTransformer.UpdateResult.Updated;
        });
    },
    dispose({ b }) {
        b === null || b === void 0 ? void 0 : b.data.customPropertyDescriptors.dispose();
    }
});
exports.CustomStructureProperties = CustomStructureProperties;
async function attachStructureProps(structure, ctx, taskCtx, params) {
    const propertyCtx = { runtime: taskCtx, assetManager: ctx.managers.asset };
    const { autoAttach, properties } = params;
    for (const name of Object.keys(properties)) {
        const property = ctx.customStructureProperties.get(name);
        const props = properties[name];
        if (autoAttach.includes(name) || property.isHidden) {
            try {
                await property.attach(propertyCtx, structure, props, true);
            }
            catch (e) {
                ctx.log.warn(`Error attaching structure prop '${name}': ${e}`);
            }
        }
        else {
            property.set(structure, props);
        }
    }
}
const ShapeFromPly = objects_1.PluginStateTransform.BuiltIn({
    name: 'shape-from-ply',
    display: { name: 'Shape from PLY', description: 'Create Shape from PLY data' },
    from: objects_1.PluginStateObject.Format.Ply,
    to: objects_1.PluginStateObject.Shape.Provider,
    params(a) {
        return {
            transforms: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Value([], { isHidden: true })),
            label: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Text('', { isHidden: true }))
        };
    }
})({
    apply({ a, params }) {
        return mol_task_1.Task.create('Create shape from PLY', async (ctx) => {
            const shape = await (0, ply_1.shapeFromPly)(a.data, params).runInContext(ctx);
            const props = { label: params.label || 'Shape' };
            return new objects_1.PluginStateObject.Shape.Provider(shape, props);
        });
    }
});
exports.ShapeFromPly = ShapeFromPly;
