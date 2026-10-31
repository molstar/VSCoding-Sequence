/**
 * Copyright (c) 2017-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SortedArray } from '../../../mol-data/int';
import { EquivalenceClasses } from '../../../mol-data/util';
import { Spacegroup, SpacegroupCell, SymmetryOperator } from '../../../mol-math/geometry';
import { Vec3, Mat4 } from '../../../mol-math/linear-algebra';
import { Task } from '../../../mol-task';
import { Symmetry, Model } from '../model';
import { QueryContext, StructureSelection, Queries as Q } from '../query';
import { Structure } from './structure';
import { Unit } from './unit';
import { ModelSymmetry } from '../../../mol-model-formats/structure/property/symmetry';
import { StructureProperties } from './properties';
var StructureSymmetry;
(function (StructureSymmetry) {
    function buildAssembly(structure, asmName) {
        return Task.create('Build Assembly', async (ctx) => {
            const models = structure.models;
            if (models.length !== 1)
                throw new Error('Can only build assemblies from structures based on 1 model.');
            const assembly = Symmetry.findAssembly(models[0], asmName);
            if (!assembly)
                throw new Error(`Assembly '${asmName}' is not defined.`);
            const coordinateSystem = SymmetryOperator.create(assembly.id, Mat4.identity(), { assembly: { id: assembly.id, operId: 0, operList: [] } });
            const assembler = Structure.Builder({
                coordinateSystem,
                label: structure.label,
                dynamicBonds: structure.dynamicBonds
            });
            const queryCtx = new QueryContext(structure);
            for (const g of assembly.operatorGroups) {
                const selection = g.selector(queryCtx);
                if (StructureSelection.structureCount(selection) === 0) {
                    continue;
                }
                const { units } = StructureSelection.unionStructure(selection);
                for (const oper of g.operators) {
                    for (const unit of units) {
                        assembler.addWithOperator(unit, oper);
                    }
                }
            }
            return assembler.getStructure();
        });
    }
    StructureSymmetry.buildAssembly = buildAssembly;
    function buildSymmetryAssembly(structure, generators, symmetry) {
        return Task.create('Build Symmetry Assembly', async (ctx) => {
            const models = structure.models;
            if (models.length !== 1)
                throw new Error('Can only build symmetry assemblies from structures based on 1 model.');
            const modelCenter = Vec3();
            const assembler = Structure.Builder({
                label: structure.label,
                representativeModel: models[0],
                dynamicBonds: structure.dynamicBonds
            });
            const queryCtx = new QueryContext(structure);
            for (const g of generators) {
                const selector = getSelector(g.asymIds);
                const selection = selector(queryCtx);
                if (StructureSelection.structureCount(selection) === 0) {
                    continue;
                }
                const { units } = StructureSelection.unionStructure(selection);
                for (const { index, shift: [i, j, k] } of g.operators) {
                    const operators = getOperatorsForIndex(symmetry, index, i, j, k, modelCenter);
                    for (const unit of units) {
                        for (const op of operators) {
                            assembler.addWithOperator(unit, op);
                        }
                    }
                }
            }
            return assembler.getStructure();
        });
    }
    StructureSymmetry.buildSymmetryAssembly = buildSymmetryAssembly;
    function builderSymmetryMates(structure, radius) {
        return Task.create('Find Symmetry Mates', ctx => findMatesRadius(ctx, structure, radius));
    }
    StructureSymmetry.builderSymmetryMates = builderSymmetryMates;
    function buildSymmetryRange(structure, ijkMin, ijkMax) {
        return Task.create('Build Symmetry', ctx => findSymmetryRange(ctx, structure, ijkMin, ijkMax));
    }
    StructureSymmetry.buildSymmetryRange = buildSymmetryRange;
    /** Builds NCS structure, returns the original if NCS operators are not present. */
    function buildNcs(structure) {
        return Task.create('Build NCS', ctx => _buildNCS(ctx, structure));
    }
    StructureSymmetry.buildNcs = buildNcs;
    function areUnitsEquivalent(a, b) {
        return a.invariantId === b.invariantId && a.model.id === b.model.id && SortedArray.areEqual(a.elements, b.elements);
    }
    StructureSymmetry.areUnitsEquivalent = areUnitsEquivalent;
    function UnitEquivalenceBuilder() {
        return EquivalenceClasses(Unit.hashUnit, areUnitsEquivalent);
    }
    StructureSymmetry.UnitEquivalenceBuilder = UnitEquivalenceBuilder;
    function computeTransformGroups(s) {
        const groups = UnitEquivalenceBuilder();
        for (const u of s.units)
            groups.add(u.id, u);
        const ret = [];
        for (const eqUnits of groups.groups) {
            ret.push(Unit.SymmetryGroup(eqUnits.map(id => s.unitMap.get(id))));
        }
        return ret;
    }
    StructureSymmetry.computeTransformGroups = computeTransformGroups;
    /** Checks if transform groups are equal up to their unit's transformations */
    function areTransformGroupsEquivalent(a, b) {
        if (a.length !== b.length)
            return false;
        for (let i = 0, il = a.length; i < il; ++i) {
            const au = a[i].units, bu = b[i].units;
            if (au.length !== bu.length)
                return false;
            if (a[i].hashCode !== b[i].hashCode)
                return false;
            for (let j = 0, _j = au.length; j < _j; j++) {
                if (au[j].conformation !== bu[j].conformation)
                    return false;
            }
        }
        return true;
    }
    StructureSymmetry.areTransformGroupsEquivalent = areTransformGroupsEquivalent;
})(StructureSymmetry || (StructureSymmetry = {}));
function getSelector(asymIds) {
    return Q.generators.atoms({ chainTest: Q.pred.and(Q.pred.eq(ctx => StructureProperties.unit.operator_name(ctx.element), SymmetryOperator.DefaultName), Q.pred.inSet(ctx => StructureProperties.chain.label_asym_id(ctx.element), asymIds)) });
}
function getOperatorsForIndex(symmetry, index, i, j, k, modelCenter) {
    const { spacegroup, ncsOperators } = symmetry;
    const operators = [];
    const { toFractional } = spacegroup.cell;
    const ref = Vec3.transformMat4(Vec3(), modelCenter, toFractional);
    const symOp = Spacegroup.getSymmetryOperatorRef(spacegroup, index, i, j, k, ref);
    if (ncsOperators && ncsOperators.length) {
        for (let u = 0, ul = ncsOperators.length; u < ul; ++u) {
            const ncsOp = ncsOperators[u];
            const matrix = Mat4.mul(Mat4(), symOp.matrix, ncsOp.matrix);
            const operator = SymmetryOperator.create(`${symOp.name} ${ncsOp.name}`, matrix, {
                assembly: symOp.assembly,
                ncsId: ncsOp.ncsId,
                hkl: symOp.hkl,
                spgrOp: symOp.spgrOp
            });
            operators.push(operator);
        }
    }
    else {
        operators.push(symOp);
    }
    return operators;
}
function getOperatorsForRange(symmetry, ijkMin, ijkMax, modelCenter) {
    const { spacegroup, ncsOperators } = symmetry;
    const ncsCount = (ncsOperators && ncsOperators.length) || 0;
    const operators = [];
    if (!ncsCount &&
        ijkMin[0] <= 0 && ijkMax[0] >= 0 &&
        ijkMin[1] <= 0 && ijkMax[1] >= 0 &&
        ijkMin[2] <= 0 && ijkMax[2] >= 0) {
        operators[0] = Spacegroup.getSymmetryOperator(spacegroup, 0, 0, 0, 0);
    }
    for (let op = 0; op < spacegroup.operators.length; op++) {
        for (let i = ijkMin[0]; i <= ijkMax[0]; i++) {
            for (let j = ijkMin[1]; j <= ijkMax[1]; j++) {
                for (let k = ijkMin[2]; k <= ijkMax[2]; k++) {
                    // check if we have added identity as the 1st operator.
                    if (!ncsCount && op === 0 && i === 0 && j === 0 && k === 0)
                        continue;
                    operators.push(...getOperatorsForIndex(symmetry, op, i, j, k, modelCenter));
                }
            }
        }
    }
    return operators;
}
function getOperatorsCached333(symmetry, ref) {
    if (symmetry._operators_333 && Vec3.equals(ref, symmetry._operators_333.ref)) {
        return symmetry._operators_333.operators;
    }
    symmetry._operators_333 = {
        ref: Vec3.clone(ref),
        operators: getOperatorsForRange(symmetry, Vec3.create(-3, -3, -3), Vec3.create(3, 3, 3), ref)
    };
    return symmetry._operators_333.operators;
}
function assembleOperators(structure, operators) {
    const assembler = Structure.Builder({
        label: structure.label,
        dynamicBonds: structure.dynamicBonds
    });
    const { units } = structure;
    for (const oper of operators) {
        for (const unit of units) {
            assembler.addWithOperator(unit, oper);
        }
    }
    return assembler.getStructure();
}
async function _buildNCS(ctx, structure) {
    const models = structure.models;
    if (models.length !== 1)
        throw new Error('Can only build NCS from structures based on 1 model.');
    const symmetry = ModelSymmetry.Provider.get(models[0]);
    if (!symmetry)
        return structure;
    const operators = symmetry.ncsOperators;
    if (!operators || !operators.length)
        return structure;
    return assembleOperators(structure, operators);
}
async function findSymmetryRange(ctx, structure, ijkMin, ijkMax) {
    const models = structure.models;
    if (models.length !== 1)
        throw new Error('Can only build symmetries from structures based on 1 model.');
    const symmetry = ModelSymmetry.Provider.get(models[0]);
    if (!symmetry)
        return structure;
    const { spacegroup } = symmetry;
    if (SpacegroupCell.isZero(spacegroup.cell))
        return structure;
    const modelCenter = Model.getCenter(models[0]);
    const operators = getOperatorsForRange(symmetry, ijkMin, ijkMax, modelCenter);
    return assembleOperators(structure, operators);
}
async function findMatesRadius(ctx, structure, radius) {
    const models = structure.models;
    if (models.length !== 1)
        throw new Error('Can only build symmetries from structures based on 1 model.');
    const symmetry = ModelSymmetry.Provider.get(models[0]);
    if (!symmetry)
        return structure;
    const { spacegroup } = symmetry;
    if (SpacegroupCell.isZero(spacegroup.cell))
        return structure;
    if (ctx.shouldUpdate)
        await ctx.update('Initialing...');
    const modelCenter = Model.getCenter(models[0]);
    const operators = getOperatorsCached333(symmetry, modelCenter);
    const lookup = structure.lookup3d;
    // keep track of added invariant-unit and operator combinations
    const added = new Set();
    function hash(unit, oper) {
        return `${unit.invariantId}|${oper.name}`;
    }
    const assembler = Structure.Builder({
        label: structure.label,
        dynamicBonds: structure.dynamicBonds
    });
    const { units } = structure;
    const center = Vec3.zero();
    for (const oper of operators) {
        for (const unit of units) {
            const boundingSphere = unit.lookup3d.boundary.sphere;
            Vec3.transformMat4(center, boundingSphere.center, oper.matrix);
            const closeUnits = lookup.findUnitIndices(center[0], center[1], center[2], boundingSphere.radius + radius);
            for (let uI = 0, _uI = closeUnits.count; uI < _uI; uI++) {
                const closeUnit = units[closeUnits.indices[uI]];
                if (!closeUnit.lookup3d.check(center[0], center[1], center[2], boundingSphere.radius + radius))
                    continue;
                const h = hash(unit, oper);
                if (!added.has(h)) {
                    assembler.addWithOperator(unit, oper);
                    added.add(h);
                }
            }
        }
        if (ctx.shouldUpdate)
            await ctx.update('Building symmetry...');
    }
    return assembler.getStructure();
}
export { StructureSymmetry };
