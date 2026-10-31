"use strict";
/**
 * Copyright (c) 2019-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootStructureDefinition = void 0;
const structure_1 = require("../../mol-model/structure");
const string_1 = require("../../mol-util/string");
const geometry_1 = require("../../mol-math/geometry");
const param_definition_1 = require("../../mol-util/param-definition");
const linear_algebra_1 = require("../../mol-math/linear-algebra");
const symmetry_1 = require("../../mol-model/structure/model/properties/symmetry");
const objects_1 = require("../objects");
const symmetry_2 = require("../../mol-model-formats/structure/property/symmetry");
const type_helpers_1 = require("../../mol-util/type-helpers");
const CommonStructureParams = {
    dynamicBonds: param_definition_1.ParamDefinition.Optional(param_definition_1.ParamDefinition.Boolean(false, { description: 'Ensure bonds are recalculated upon model changes. Also enables calculation of inter-unit bonds in water molecules and ions.' })),
};
var RootStructureDefinition;
(function (RootStructureDefinition) {
    function getParams(model, defaultValue) {
        const symmetry = model && symmetry_2.ModelSymmetry.Provider.get(model);
        const assemblyIds = symmetry ? symmetry.assemblies.map(a => [a.id, `${a.id}: ${(0, string_1.stringToWords)(a.details)}`]) : [];
        const showSymm = !symmetry ? true : !geometry_1.SpacegroupCell.isZero(symmetry.spacegroup.cell);
        const operatorOptions = [];
        if (symmetry) {
            const { operators } = symmetry.spacegroup;
            for (let i = 0, il = operators.length; i < il; i++) {
                operatorOptions.push([i, `${i + 1}: ${geometry_1.Spacegroup.getOperatorXyz(operators[i])}`]);
            }
        }
        const asymIdsOptions = [];
        if (model) {
            model.properties.structAsymMap.forEach(v => {
                const label = v.id === v.auth_id ? v.id : `${v.id} [auth ${v.auth_id}]`;
                asymIdsOptions.push([v.id, label]);
            });
        }
        const modes = {
            auto: param_definition_1.ParamDefinition.Group(CommonStructureParams),
            model: param_definition_1.ParamDefinition.Group(CommonStructureParams),
            assembly: param_definition_1.ParamDefinition.Group({
                id: param_definition_1.ParamDefinition.Optional(model
                    ? param_definition_1.ParamDefinition.Select(assemblyIds.length ? assemblyIds[0][0] : '', assemblyIds, { label: 'Asm Id', description: 'Assembly Id' })
                    : param_definition_1.ParamDefinition.Text('', { label: 'Asm Id', description: 'Assembly Id (use empty for the 1st assembly)' })),
                ...CommonStructureParams
            }, { isFlat: true }),
            'symmetry-mates': param_definition_1.ParamDefinition.Group({
                radius: param_definition_1.ParamDefinition.Numeric(5, { min: 0, max: 50, step: 1 }),
                ...CommonStructureParams
            }, { isFlat: true }),
            'symmetry': param_definition_1.ParamDefinition.Group({
                ijkMin: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(-1, -1, -1), { step: 1 }, { label: 'Min IJK', fieldLabels: { x: 'I', y: 'J', z: 'K' } }),
                ijkMax: param_definition_1.ParamDefinition.Vec3(linear_algebra_1.Vec3.create(1, 1, 1), { step: 1 }, { label: 'Max IJK', fieldLabels: { x: 'I', y: 'J', z: 'K' } }),
                ...CommonStructureParams
            }, { isFlat: true }),
            'symmetry-assembly': param_definition_1.ParamDefinition.Group({
                generators: param_definition_1.ParamDefinition.ObjectList({
                    operators: param_definition_1.ParamDefinition.ObjectList({
                        index: param_definition_1.ParamDefinition.Select(0, operatorOptions),
                        shift: param_definition_1.ParamDefinition.Vec3((0, linear_algebra_1.Vec3)(), { step: 1 }, { label: 'IJK', fieldLabels: { x: 'I', y: 'J', z: 'K' } })
                    }, e => `${e.index + 1}_${e.shift.map(a => a + 5).join('')}`, {
                        defaultValue: []
                    }),
                    asymIds: param_definition_1.ParamDefinition.MultiSelect([], asymIdsOptions)
                }, e => `${e.asymIds.length} asym ids, ${e.operators.length} operators`, {
                    defaultValue: []
                }),
                ...CommonStructureParams
            }, { isFlat: true })
        };
        const options = [];
        if (defaultValue === 'auto') {
            options.push(['auto', 'Auto']);
        }
        options.push(['model', 'Model']);
        if (assemblyIds.length > 0) {
            options.push(['assembly', 'Assembly']);
        }
        if (showSymm) {
            options.push(['symmetry-mates', 'Symmetry Mates']);
            options.push(['symmetry', 'Symmetry (indices)']);
            options.push(['symmetry-assembly', 'Symmetry (assembly)']);
        }
        return {
            type: param_definition_1.ParamDefinition.MappedStatic(defaultValue || 'model', modes, { options })
        };
    }
    RootStructureDefinition.getParams = getParams;
    function canAutoUpdate(oldParams, newParams) {
        if (newParams.name === 'symmetry-assembly' || (newParams.name === 'symmetry' && oldParams.name === 'symmetry'))
            return false;
        return true;
    }
    RootStructureDefinition.canAutoUpdate = canAutoUpdate;
    async function buildAssembly(plugin, ctx, model, id, props) {
        let asm = void 0;
        const symmetry = symmetry_2.ModelSymmetry.Provider.get(model);
        // if no id is specified, use the 1st assembly.
        if (!id && symmetry && symmetry.assemblies.length !== 0) {
            id = symmetry.assemblies[0].id;
        }
        if (!symmetry || symmetry.assemblies.length === 0) {
            plugin.log.warn(`Model '${model.entryId}' has no assembly, returning model structure.`);
        }
        else {
            asm = symmetry_1.Symmetry.findAssembly(model, id || '');
            if (!asm) {
                plugin.log.warn(`Model '${model.entryId}' has no assembly called '${id}', returning model structure.`);
            }
        }
        const base = structure_1.Structure.ofModel(model, props);
        if (!asm) {
            const label = { label: 'Model', description: structure_1.Structure.elementDescription(base) };
            return new objects_1.PluginStateObject.Molecule.Structure(base, label);
        }
        id = asm.id;
        const s = await structure_1.StructureSymmetry.buildAssembly(base, id).runInContext(ctx);
        const objProps = { label: `Assembly ${id}`, description: structure_1.Structure.elementDescription(s) };
        return new objects_1.PluginStateObject.Molecule.Structure(s, objProps);
    }
    async function buildSymmetry(ctx, model, ijkMin, ijkMax, props) {
        const base = structure_1.Structure.ofModel(model, props);
        const s = await structure_1.StructureSymmetry.buildSymmetryRange(base, ijkMin, ijkMax).runInContext(ctx);
        const objProps = { label: `Symmetry [${ijkMin}] to [${ijkMax}]`, description: structure_1.Structure.elementDescription(s) };
        return new objects_1.PluginStateObject.Molecule.Structure(s, objProps);
    }
    async function buildSymmetryMates(ctx, model, radius, props) {
        const base = structure_1.Structure.ofModel(model, props);
        const s = await structure_1.StructureSymmetry.builderSymmetryMates(base, radius).runInContext(ctx);
        const objProps = { label: `Symmetry Mates`, description: structure_1.Structure.elementDescription(s) };
        return new objects_1.PluginStateObject.Molecule.Structure(s, objProps);
    }
    async function buildSymmetryAssembly(ctx, model, generators, symmetry, props) {
        const base = structure_1.Structure.ofModel(model, props);
        const s = await structure_1.StructureSymmetry.buildSymmetryAssembly(base, generators, symmetry).runInContext(ctx);
        const objProps = { label: `Symmetry Assembly`, description: structure_1.Structure.elementDescription(s) };
        return new objects_1.PluginStateObject.Molecule.Structure(s, objProps);
    }
    async function create(plugin, ctx, model, params) {
        const props = params === null || params === void 0 ? void 0 : params.params;
        const symmetry = symmetry_2.ModelSymmetry.Provider.get(model);
        if (!symmetry || !params || params.name === 'model') {
            const s = structure_1.Structure.ofModel(model, props);
            return new objects_1.PluginStateObject.Molecule.Structure(s, { label: 'Model', description: structure_1.Structure.elementDescription(s) });
        }
        if (params.name === 'auto') {
            if (symmetry.assemblies.length === 0) {
                const s = structure_1.Structure.ofModel(model, props);
                return new objects_1.PluginStateObject.Molecule.Structure(s, { label: 'Model', description: structure_1.Structure.elementDescription(s) });
            }
            else {
                return buildAssembly(plugin, ctx, model, undefined, props);
            }
        }
        if (params.name === 'assembly') {
            return buildAssembly(plugin, ctx, model, params.params.id, props);
        }
        if (params.name === 'symmetry') {
            return buildSymmetry(ctx, model, params.params.ijkMin, params.params.ijkMax, props);
        }
        if (params.name === 'symmetry-mates') {
            return buildSymmetryMates(ctx, model, params.params.radius, props);
        }
        if (params.name === 'symmetry-assembly') {
            return buildSymmetryAssembly(ctx, model, params.params.generators, symmetry, props);
        }
        (0, type_helpers_1.assertUnreachable)(params);
    }
    RootStructureDefinition.create = create;
})(RootStructureDefinition || (exports.RootStructureDefinition = RootStructureDefinition = {}));
