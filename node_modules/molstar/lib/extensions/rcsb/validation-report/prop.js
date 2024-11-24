/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { Structure, Unit } from '../../../mol-model/structure';
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
import { Model } from '../../../mol-model/structure/model';
import { IntAdjacencyGraph } from '../../../mol-math/graph';
import { CustomStructureProperty } from '../../../mol-model-props/common/custom-structure-property';
import { InterUnitGraph } from '../../../mol-math/graph/inter-unit-graph';
import { IntMap, SortedArray } from '../../../mol-data/int';
import { arrayMax } from '../../../mol-util/array';
import { equalEps } from '../../../mol-math/linear-algebra/3d/common';
import { Vec3 } from '../../../mol-math/linear-algebra';
import { QuerySymbolRuntime } from '../../../mol-script/runtime/query/compiler';
import { CustomPropSymbol } from '../../../mol-script/language/symbol';
import { Type } from '../../../mol-script/language/type';
import { Asset } from '../../../mol-util/assets';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
export { ValidationReport };
var ValidationReport;
(function (ValidationReport) {
    let Tag;
    (function (Tag) {
        Tag["DensityFit"] = "rcsb-density-fit";
        Tag["GeometryQuality"] = "rcsb-geometry-quality";
        Tag["RandomCoilIndex"] = "rcsb-random-coil-index";
        Tag["Clashes"] = "rcsb-clashes";
    })(Tag = ValidationReport.Tag || (ValidationReport.Tag = {}));
    ValidationReport.DefaultBaseUrl = 'https://files.rcsb.org/pub/pdb/validation_reports';
    function getEntryUrl(pdbId, baseUrl) {
        const id = pdbId.toLowerCase();
        return `${baseUrl}/${id.substr(1, 2)}/${id}/${id}_validation.xml.gz`;
    }
    ValidationReport.getEntryUrl = getEntryUrl;
    function isApplicable(model) {
        return !!model && Model.hasPdbId(model);
    }
    ValidationReport.isApplicable = isApplicable;
    function fromXml(xml, model) {
        return parseValidationReportXml(xml, model);
    }
    ValidationReport.fromXml = fromXml;
    async function fetch(ctx, model, props) {
        const url = Asset.getUrlAsset(ctx.assetManager, getEntryUrl(model.entryId, props.baseUrl));
        const xml = await ctx.assetManager.resolve(url, 'xml').runInContext(ctx.runtime);
        return { value: fromXml(xml.data, model), assets: [xml] };
    }
    ValidationReport.fetch = fetch;
    async function open(ctx, model, props) {
        if (props.input === null)
            throw new Error('No file given');
        const xml = await ctx.assetManager.resolve(props.input, 'xml').runInContext(ctx.runtime);
        return { value: fromXml(xml.data, model), assets: [xml] };
    }
    ValidationReport.open = open;
    async function obtain(ctx, model, props) {
        switch (props.source.name) {
            case 'file': return open(ctx, model, props.source.params);
            case 'server': return fetch(ctx, model, props.source.params);
        }
    }
    ValidationReport.obtain = obtain;
    ValidationReport.symbols = {
        hasClash: QuerySymbolRuntime.Dynamic(CustomPropSymbol('rcsb', 'validation-report.has-clash', Type.Bool), ctx => {
            const { unit, element } = ctx.element;
            if (!Unit.isAtomic(unit))
                return 0;
            const validationReport = ValidationReportProvider.get(unit.model).value;
            return validationReport && validationReport.clashes.getVertexEdgeCount(element) > 0;
        }),
        issueCount: QuerySymbolRuntime.Dynamic(CustomPropSymbol('rcsb', 'validation-report.issue-count', Type.Num), ctx => {
            var _a;
            const { unit, element } = ctx.element;
            if (!Unit.isAtomic(unit))
                return 0;
            const validationReport = ValidationReportProvider.get(unit.model).value;
            return ((_a = validationReport === null || validationReport === void 0 ? void 0 : validationReport.geometryIssues.get(unit.residueIndex[element])) === null || _a === void 0 ? void 0 : _a.size) || 0;
        }),
    };
})(ValidationReport || (ValidationReport = {}));
const FileSourceParams = {
    input: PD.File({ accept: '.xml,.gz,.zip' })
};
const ServerSourceParams = {
    baseUrl: PD.Text(ValidationReport.DefaultBaseUrl, { description: 'Base URL to directory tree' })
};
export const ValidationReportParams = {
    source: PD.MappedStatic('server', {
        'file': PD.Group(FileSourceParams, { label: 'File', isFlat: true }),
        'server': PD.Group(ServerSourceParams, { label: 'Server', isFlat: true }),
    }, { options: [['file', 'File'], ['server', 'Server']] })
};
export const ValidationReportProvider = CustomModelProperty.createProvider({
    label: 'Validation Report',
    descriptor: CustomPropertyDescriptor({
        name: 'rcsb_validation_report',
        symbols: ValidationReport.symbols
    }),
    type: 'dynamic',
    defaultParams: ValidationReportParams,
    getParams: (data) => ValidationReportParams,
    isApplicable: (data) => ValidationReport.isApplicable(data),
    obtain: async (ctx, data, props) => {
        const p = { ...PD.getDefaultValues(ValidationReportParams), ...props };
        return await ValidationReport.obtain(ctx, data, p);
    }
});
function createInterUnitClashes(structure, clashes) {
    const builder = new InterUnitGraph.Builder();
    const { a, b, edgeProps: { id, magnitude, distance } } = clashes;
    const pA = Vec3(), pB = Vec3();
    Structure.eachUnitPair(structure, (unitA, unitB) => {
        const elementsA = unitA.elements;
        const elementsB = unitB.elements;
        builder.startUnitPair(unitA.id, unitB.id);
        for (let i = 0, il = clashes.edgeCount * 2; i < il; ++i) {
            // TODO create lookup
            const indexA = SortedArray.indexOf(elementsA, a[i]);
            const indexB = SortedArray.indexOf(elementsB, b[i]);
            if (indexA !== -1 && indexB !== -1) {
                unitA.conformation.position(a[i], pA);
                unitB.conformation.position(b[i], pB);
                // check actual distance to avoid clashes between unrelated chain instances
                if (equalEps(distance[i], Vec3.distance(pA, pB), 0.1)) {
                    builder.add(indexA, indexB, {
                        id: id[i],
                        magnitude: magnitude[i],
                        distance: distance[i],
                    });
                }
            }
        }
        builder.finishUnitPair();
    }, {
        maxRadius: arrayMax(clashes.edgeProps.distance),
        validUnit: (unit) => Unit.isAtomic(unit),
        validUnitPair: (unitA, unitB) => unitA.model === unitB.model
    });
    return new InterUnitGraph(builder.getMap());
}
function createIntraUnitClashes(unit, clashes) {
    const aIndices = [];
    const bIndices = [];
    const ids = [];
    const magnitudes = [];
    const distances = [];
    const pA = Vec3(), pB = Vec3();
    const { elements } = unit;
    const { a, b, edgeCount, edgeProps } = clashes;
    for (let i = 0, il = edgeCount * 2; i < il; ++i) {
        // TODO create lookup
        const indexA = SortedArray.indexOf(elements, a[i]);
        const indexB = SortedArray.indexOf(elements, b[i]);
        if (indexA !== -1 && indexB !== -1) {
            unit.conformation.position(a[i], pA);
            unit.conformation.position(b[i], pB);
            // check actual distance to avoid clashes between unrelated chain instances
            if (equalEps(edgeProps.distance[i], Vec3.distance(pA, pB), 0.1)) {
                aIndices.push(indexA);
                bIndices.push(indexB);
                ids.push(edgeProps.id[i]);
                magnitudes.push(edgeProps.magnitude[i]);
                distances.push(edgeProps.distance[i]);
            }
        }
    }
    const builder = new IntAdjacencyGraph.EdgeBuilder(elements.length, aIndices, bIndices);
    const id = new Int32Array(builder.slotCount);
    const magnitude = new Float32Array(builder.slotCount);
    const distance = new Float32Array(builder.slotCount);
    for (let i = 0, _i = builder.edgeCount; i < _i; i++) {
        builder.addNextEdge();
        builder.assignProperty(id, ids[i]);
        builder.assignProperty(magnitude, magnitudes[i]);
        builder.assignProperty(distance, distances[i]);
    }
    return builder.createGraph({ id, magnitude, distance });
}
function createClashes(structure, clashes) {
    const intraUnit = IntMap.Mutable();
    for (let i = 0, il = structure.unitSymmetryGroups.length; i < il; ++i) {
        const group = structure.unitSymmetryGroups[i];
        if (!Unit.isAtomic(group.units[0]))
            continue;
        const intraClashes = createIntraUnitClashes(group.units[0], clashes);
        for (let j = 0, jl = group.units.length; j < jl; ++j) {
            intraUnit.set(group.units[j].id, intraClashes);
        }
    }
    return {
        interUnit: createInterUnitClashes(structure, clashes),
        intraUnit
    };
}
export const ClashesProvider = CustomStructureProperty.createProvider({
    label: 'Clashes',
    descriptor: CustomPropertyDescriptor({
        name: 'rcsb_clashes',
        // TODO `cifExport` and `symbol`
    }),
    type: 'local',
    defaultParams: {},
    getParams: (data) => ({}),
    isApplicable: (data) => true,
    obtain: async (ctx, data) => {
        await ValidationReportProvider.attach(ctx, data.models[0]);
        const validationReport = ValidationReportProvider.get(data.models[0]).value;
        return {
            value: createClashes(data, validationReport.clashes)
        };
    }
});
//
function getItem(a, name) {
    const item = a.getNamedItem(name);
    return item !== null ? item.value : '';
}
function hasAttr(a, name, value) {
    const item = a.getNamedItem(name);
    return item !== null && item.value === value;
}
function getMogInfo(a) {
    return {
        mean: parseFloat(getItem(a, 'mean')),
        obs: parseFloat(getItem(a, 'obsval')),
        stdev: parseFloat(getItem(a, 'stdev')),
        z: parseFloat(getItem(a, 'Zscore')),
    };
}
function getMolInfo(a) {
    return {
        mean: parseFloat(getItem(a, 'mean')),
        obs: parseFloat(getItem(a, 'obs')),
        stdev: parseFloat(getItem(a, 'stdev')),
        z: parseInt(getItem(a, 'z')),
    };
}
function addIndex(index, element, map) {
    if (map.has(element))
        map.get(element).push(index);
    else
        map.set(element, [index]);
}
function ClashesBuilder(elementsCount) {
    const aIndices = [];
    const bIndices = [];
    const ids = [];
    const magnitudes = [];
    const distances = [];
    const seen = new Map();
    return {
        add(element, id, magnitude, distance, isSymop) {
            const hash = `${id}|${isSymop ? 's' : ''}`;
            const other = seen.get(hash);
            if (other !== undefined) {
                aIndices[aIndices.length] = element;
                bIndices[bIndices.length] = other;
                ids[ids.length] = id;
                magnitudes[magnitudes.length] = magnitude;
                distances[distances.length] = distance;
            }
            else {
                seen.set(hash, element);
            }
        },
        get() {
            const builder = new IntAdjacencyGraph.EdgeBuilder(elementsCount, aIndices, bIndices);
            const id = new Int32Array(builder.slotCount);
            const magnitude = new Float32Array(builder.slotCount);
            const distance = new Float32Array(builder.slotCount);
            for (let i = 0, _i = builder.edgeCount; i < _i; i++) {
                builder.addNextEdge();
                builder.assignProperty(id, ids[i]);
                builder.assignProperty(magnitude, magnitudes[i]);
                builder.assignProperty(distance, distances[i]);
            }
            return builder.createGraph({ id, magnitude, distance });
        }
    };
}
function parseValidationReportXml(xml, model) {
    const rsrz = new Map();
    const rscc = new Map();
    const rci = new Map();
    const geometryIssues = new Map();
    const bondOutliers = {
        index: new Map(),
        data: []
    };
    const angleOutliers = {
        index: new Map(),
        data: []
    };
    const clashesBuilder = ClashesBuilder(model.atomicHierarchy.atoms._rowCount);
    const { index } = model.atomicHierarchy;
    const entries = xml.getElementsByTagName('Entry');
    if (entries.length === 1) {
        const chemicalShiftLists = entries[0].getElementsByTagName('chemical_shift_list');
        if (chemicalShiftLists.length === 1) {
            const randomCoilIndices = chemicalShiftLists[0].getElementsByTagName('random_coil_index');
            for (let j = 0, jl = randomCoilIndices.length; j < jl; ++j) {
                const { attributes } = randomCoilIndices[j];
                const value = parseFloat(getItem(attributes, 'value'));
                const auth_asym_id = getItem(attributes, 'chain');
                const auth_comp_id = getItem(attributes, 'rescode');
                const auth_seq_id = parseInt(getItem(attributes, 'resnum'));
                const rI = index.findResidueAuth({ auth_asym_id, auth_comp_id, auth_seq_id });
                if (rI !== -1)
                    rci.set(rI, value);
            }
        }
    }
    const groups = xml.getElementsByTagName('ModelledSubgroup');
    for (let i = 0, il = groups.length; i < il; ++i) {
        const g = groups[i];
        const ga = g.attributes;
        const pdbx_PDB_model_num = parseInt(getItem(ga, 'model'));
        if (model.modelNum !== pdbx_PDB_model_num)
            continue;
        const auth_asym_id = getItem(ga, 'chain');
        const auth_comp_id = getItem(ga, 'resname');
        const auth_seq_id = parseInt(getItem(ga, 'resnum'));
        const pdbx_PDB_ins_code = getItem(ga, 'icode').trim() || undefined;
        const label_alt_id = getItem(ga, 'altcode').trim() || undefined;
        const rI = index.findResidueAuth({ auth_asym_id, auth_comp_id, auth_seq_id, pdbx_PDB_ins_code });
        // continue if no residue index is found
        if (rI === -1)
            continue;
        if (ga.getNamedItem('rsrz') !== null)
            rsrz.set(rI, parseFloat(getItem(ga, 'rsrz')));
        if (ga.getNamedItem('rscc') !== null)
            rscc.set(rI, parseFloat(getItem(ga, 'rscc')));
        const isPolymer = getItem(ga, 'seq') !== '.';
        const issues = new Set();
        if (isPolymer) {
            const molBondOutliers = g.getElementsByTagName('bond-outlier');
            if (molBondOutliers.length)
                issues.add('bond-outlier');
            for (let j = 0, jl = molBondOutliers.length; j < jl; ++j) {
                const bo = molBondOutliers[j].attributes;
                const idx = bondOutliers.data.length;
                const atomA = index.findAtomOnResidue(rI, getItem(bo, 'atom0'));
                const atomB = index.findAtomOnResidue(rI, getItem(bo, 'atom1'));
                addIndex(idx, atomA, bondOutliers.index);
                addIndex(idx, atomB, bondOutliers.index);
                bondOutliers.data.push({
                    tag: 'bond-outlier', atomA, atomB, ...getMolInfo(bo)
                });
            }
            const molAngleOutliers = g.getElementsByTagName('angle-outlier');
            if (molAngleOutliers.length)
                issues.add('angle-outlier');
            for (let j = 0, jl = molAngleOutliers.length; j < jl; ++j) {
                const ao = molAngleOutliers[j].attributes;
                const idx = bondOutliers.data.length;
                const atomA = index.findAtomOnResidue(rI, getItem(ao, 'atom0'));
                const atomB = index.findAtomOnResidue(rI, getItem(ao, 'atom1'));
                const atomC = index.findAtomOnResidue(rI, getItem(ao, 'atom2'));
                addIndex(idx, atomA, angleOutliers.index);
                addIndex(idx, atomB, angleOutliers.index);
                addIndex(idx, atomC, angleOutliers.index);
                angleOutliers.data.push({
                    tag: 'angle-outlier', atomA, atomB, atomC, ...getMolInfo(ao)
                });
            }
            const planeOutliers = g.getElementsByTagName('plane-outlier');
            if (planeOutliers.length)
                issues.add('plane-outlier');
            if (hasAttr(ga, 'rota', 'OUTLIER'))
                issues.add('rotamer-outlier');
            if (hasAttr(ga, 'rama', 'OUTLIER'))
                issues.add('ramachandran-outlier');
            if (hasAttr(ga, 'RNApucker', 'outlier'))
                issues.add('RNApucker-outlier');
        }
        else {
            const mogBondOutliers = g.getElementsByTagName('mog-bond-outlier');
            if (mogBondOutliers.length)
                issues.add('mog-bond-outlier');
            for (let j = 0, jl = mogBondOutliers.length; j < jl; ++j) {
                const mbo = mogBondOutliers[j].attributes;
                const atoms = getItem(mbo, 'atoms').split(',');
                const idx = bondOutliers.data.length;
                const atomA = index.findAtomOnResidue(rI, atoms[0]);
                const atomB = index.findAtomOnResidue(rI, atoms[1]);
                addIndex(idx, atomA, bondOutliers.index);
                addIndex(idx, atomB, bondOutliers.index);
                bondOutliers.data.push({
                    tag: 'mog-bond-outlier', atomA, atomB, ...getMogInfo(mbo)
                });
            }
            const mogAngleOutliers = g.getElementsByTagName('mog-angle-outlier');
            if (mogAngleOutliers.length)
                issues.add('mog-angle-outlier');
            for (let j = 0, jl = mogAngleOutliers.length; j < jl; ++j) {
                const mao = mogAngleOutliers[j].attributes;
                const atoms = getItem(mao, 'atoms').split(',');
                const idx = angleOutliers.data.length;
                const atomA = index.findAtomOnResidue(rI, atoms[0]);
                const atomB = index.findAtomOnResidue(rI, atoms[1]);
                const atomC = index.findAtomOnResidue(rI, atoms[2]);
                addIndex(idx, atomA, angleOutliers.index);
                addIndex(idx, atomB, angleOutliers.index);
                addIndex(idx, atomC, angleOutliers.index);
                angleOutliers.data.push({
                    tag: 'mog-angle-outlier', atomA, atomB, atomC, ...getMogInfo(mao)
                });
            }
        }
        const clashes = g.getElementsByTagName('clash');
        if (clashes.length)
            issues.add('clash');
        for (let j = 0, jl = clashes.length; j < jl; ++j) {
            const ca = clashes[j].attributes;
            const id = parseInt(getItem(ca, 'cid'));
            const magnitude = parseFloat(getItem(ca, 'clashmag'));
            const distance = parseFloat(getItem(ca, 'dist'));
            const label_atom_id = getItem(ca, 'atom');
            const element = index.findAtomOnResidue(rI, label_atom_id, label_alt_id);
            if (element !== -1) {
                clashesBuilder.add(element, id, magnitude, distance, false);
            }
        }
        const symmClashes = g.getElementsByTagName('symm-clash');
        if (symmClashes.length)
            issues.add('symm-clash');
        for (let j = 0, jl = symmClashes.length; j < jl; ++j) {
            const sca = symmClashes[j].attributes;
            const id = parseInt(getItem(sca, 'scid'));
            const magnitude = parseFloat(getItem(sca, 'clashmag'));
            const distance = parseFloat(getItem(sca, 'dist'));
            const label_atom_id = getItem(sca, 'atom');
            const element = index.findAtomOnResidue(rI, label_atom_id, label_alt_id);
            if (element !== -1) {
                clashesBuilder.add(element, id, magnitude, distance, true);
            }
        }
        geometryIssues.set(rI, issues);
    }
    const clashes = clashesBuilder.get();
    const validationReport = {
        rsrz, rscc, rci, geometryIssues,
        bondOutliers, angleOutliers,
        clashes
    };
    return validationReport;
}
