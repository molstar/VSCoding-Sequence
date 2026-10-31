"use strict";
/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLabelOptions = void 0;
exports.lociLabel = lociLabel;
exports.structureElementStatsLabel = structureElementStatsLabel;
exports.structureElementLociLabelMany = structureElementLociLabelMany;
exports.bondLabel = bondLabel;
exports.bundleLabel = bundleLabel;
exports._bundleLabel = _bundleLabel;
exports.elementLabel = elementLabel;
exports.distanceLabel = distanceLabel;
exports.angleLabel = angleLabel;
exports.dihedralLabel = dihedralLabel;
const structure_1 = require("../mol-model/structure");
const loci_1 = require("../mol-model/loci");
const int_1 = require("../mol-data/int");
const string_1 = require("../mol-util/string");
const linear_algebra_1 = require("../mol-math/linear-algebra");
const misc_1 = require("../mol-math/misc");
const volume_1 = require("../mol-model/volume");
exports.DefaultLabelOptions = {
    granularity: 'element',
    condensed: false,
    reverse: false,
    countsOnly: false,
    hidePrefix: false,
    htmlStyling: true,
};
function lociLabel(loci, options = {}) {
    var _a;
    switch (loci.kind) {
        case 'structure-loci':
            return loci.structure.models.map(m => m.entry).filter(l => !!l).join(', ');
        case 'element-loci':
            return structureElementStatsLabel(structure_1.StructureElement.Stats.ofLoci(loci), options);
        case 'bond-loci':
            const bond = loci.bonds[0];
            return bond ? bondLabel(bond, options) : '';
        case 'shape-loci':
            return loci.shape.name;
        case 'group-loci':
            const g = loci.groups[0];
            return g ? loci.shape.getLabel(int_1.OrderedSet.start(g.ids), g.instance) : '';
        case 'every-loci':
            return 'Everything';
        case 'empty-loci':
            return 'Nothing';
        case 'data-loci':
            return loci.getLabel();
        case 'volume-loci':
            return loci.volume.label || 'Volume';
        case 'isosurface-loci':
            return [
                `${loci.volume.label || 'Volume'}`,
                `Isosurface at ${volume_1.Volume.IsoValue.toString(loci.isoValue)}`
            ].join(' | ');
        case 'cell-loci':
            const size = int_1.OrderedSet.size(loci.indices);
            const start = int_1.OrderedSet.start(loci.indices);
            const absVal = volume_1.Volume.IsoValue.absolute(loci.volume.grid.cells.data[start]);
            const relVal = volume_1.Volume.IsoValue.toRelative(absVal, loci.volume.grid.stats);
            const label = [
                `${loci.volume.label || 'Volume'}`,
                `${size === 1 ? `Cell #${start}` : `${size} Cells`}`
            ];
            if (size === 1) {
                label.push(`${volume_1.Volume.IsoValue.toString(absVal)} (${volume_1.Volume.IsoValue.toString(relVal)})`);
            }
            return label.join(' | ');
        case 'segment-loci':
            const segmentLabels = (_a = volume_1.Volume.Segmentation.get(loci.volume)) === null || _a === void 0 ? void 0 : _a.labels;
            if (segmentLabels && loci.segments.length === 1) {
                const label = segmentLabels[loci.segments[0]];
                if (label)
                    return label;
            }
            return [
                `${loci.volume.label || 'Volume'}`,
                `${loci.segments.length === 1 ? `Segment ${loci.segments[0]}` : `${loci.segments.length} Segments`}`
            ].join(' | ');
    }
}
function countLabel(count, label) {
    return count === 1 ? `1 ${label}` : `${count} ${label}s`;
}
function otherLabel(count, location, granularity, hidePrefix, reverse, condensed) {
    return `${elementLabel(location, { granularity, hidePrefix, reverse, condensed })} <small>[+ ${countLabel(count - 1, `other ${(0, string_1.capitalize)(granularity)}`)}]</small>`;
}
/** Gets residue count of the model chain segments the unit is a subset of */
function getResidueCount(unit) {
    const { elements, model } = unit;
    const { chainAtomSegments, residueAtomSegments } = model.atomicHierarchy;
    const elementStart = chainAtomSegments.offsets[chainAtomSegments.index[elements[0]]];
    const elementEnd = chainAtomSegments.offsets[chainAtomSegments.index[elements[elements.length - 1]] + 1] - 1;
    return residueAtomSegments.index[elementEnd] - residueAtomSegments.index[elementStart] + 1;
}
function structureElementStatsLabel(stats, options = {}) {
    const o = { ...exports.DefaultLabelOptions, ...options };
    const label = _structureElementStatsLabel(stats, o.countsOnly, o.hidePrefix, o.condensed, o.reverse);
    return o.htmlStyling ? label : (0, string_1.stripTags)(label);
}
function structureElementLociLabelMany(locis, options = {}) {
    const stats = structure_1.StructureElement.Stats.create();
    for (const l of locis) {
        structure_1.StructureElement.Stats.add(stats, stats, structure_1.StructureElement.Stats.ofLoci(l));
    }
    return structureElementStatsLabel(stats, options);
}
function _structureElementStatsLabel(stats, countsOnly = false, hidePrefix = false, condensed = false, reverse = false) {
    const { structureCount, chainCount, residueCount, conformationCount, elementCount } = stats;
    if (!countsOnly && elementCount === 1 && residueCount === 0 && chainCount === 0) {
        return elementLabel(stats.firstElementLoc, { hidePrefix, condensed, granularity: 'element', reverse });
    }
    else if (!countsOnly && elementCount === 0 && residueCount === 1 && chainCount === 0) {
        return elementLabel(stats.firstResidueLoc, { hidePrefix, condensed, granularity: 'residue', reverse });
    }
    else if (!countsOnly && elementCount === 0 && residueCount === 0 && chainCount === 1) {
        const { unit } = stats.firstChainLoc;
        const granularity = (structure_1.Unit.isAtomic(unit) && getResidueCount(unit) === 1)
            ? 'residue' : structure_1.Unit.Traits.is(unit.traits, structure_1.Unit.Trait.MultiChain)
            ? 'residue' : 'chain';
        return elementLabel(stats.firstChainLoc, { hidePrefix, condensed, granularity, reverse });
    }
    else if (!countsOnly) {
        const label = [];
        if (structureCount > 0) {
            label.push(structureCount === 1 ? elementLabel(stats.firstStructureLoc, { hidePrefix, condensed, granularity: 'structure', reverse }) : otherLabel(structureCount, stats.firstStructureLoc, 'structure', hidePrefix, reverse, condensed));
        }
        if (chainCount > 0) {
            label.push(chainCount === 1 ? elementLabel(stats.firstChainLoc, { condensed, granularity: 'chain', hidePrefix, reverse }) : otherLabel(chainCount, stats.firstChainLoc, 'chain', hidePrefix, reverse, condensed));
            hidePrefix = true;
        }
        if (residueCount > 0) {
            label.push(residueCount === 1 ? elementLabel(stats.firstResidueLoc, { condensed, granularity: 'residue', hidePrefix, reverse }) : otherLabel(residueCount, stats.firstResidueLoc, 'residue', hidePrefix, reverse, condensed));
            hidePrefix = true;
        }
        if (conformationCount > 0) {
            label.push(conformationCount === 1 ? elementLabel(stats.firstConformationLoc, { condensed, granularity: 'conformation', hidePrefix, reverse }) : otherLabel(conformationCount, stats.firstConformationLoc, 'conformation', hidePrefix, reverse, condensed));
            hidePrefix = true;
        }
        if (elementCount > 0) {
            label.push(elementCount === 1 ? elementLabel(stats.firstElementLoc, { condensed, granularity: 'element', hidePrefix, reverse }) : otherLabel(elementCount, stats.firstElementLoc, 'element', hidePrefix, reverse, condensed));
        }
        return label.join('<small> + </small>');
    }
    else {
        const label = [];
        if (structureCount > 0)
            label.push(countLabel(structureCount, 'Structure'));
        if (chainCount > 0)
            label.push(countLabel(chainCount, 'Chain'));
        if (residueCount > 0)
            label.push(countLabel(residueCount, 'Residue'));
        if (conformationCount > 0)
            label.push(countLabel(conformationCount, 'Conformation'));
        if (elementCount > 0)
            label.push(countLabel(elementCount, 'Element'));
        return label.join('<small> + </small>');
    }
}
function bondLabel(bond, options = {}) {
    return bundleLabel({ loci: [
            structure_1.StructureElement.Loci(bond.aStructure, [{ unit: bond.aUnit, indices: int_1.OrderedSet.ofSingleton(bond.aIndex) }]),
            structure_1.StructureElement.Loci(bond.bStructure, [{ unit: bond.bUnit, indices: int_1.OrderedSet.ofSingleton(bond.bIndex) }])
        ] }, options);
}
function bundleLabel(bundle, options = {}) {
    const o = { ...exports.DefaultLabelOptions, ...options };
    const label = _bundleLabel(bundle, o);
    return o.htmlStyling ? label : (0, string_1.stripTags)(label);
}
function _bundleLabel(bundle, options) {
    const { granularity, hidePrefix, reverse, condensed } = options;
    let isSingleElements = true;
    for (const l of bundle.loci) {
        if (!structure_1.StructureElement.Loci.is(l) || structure_1.StructureElement.Loci.size(l) !== 1) {
            isSingleElements = false;
            break;
        }
    }
    if (isSingleElements) {
        const locations = bundle.loci.map(l => {
            const { unit, indices } = l.elements[0];
            return structure_1.StructureElement.Location.create(l.structure, unit, unit.elements[int_1.OrderedSet.start(indices)]);
        });
        const labels = locations.map(l => _elementLabel(l, granularity, hidePrefix, reverse || condensed));
        if (condensed) {
            return labels.map(l => l[0].replace(/\[.*\]/g, '').trim()).filter(l => !!l).join(' \u2014 ');
        }
        let offset = 0;
        for (let i = 0, il = Math.min(...labels.map(l => l.length)) - 1; i < il; ++i) {
            let areIdentical = true;
            for (let j = 1, jl = labels.length; j < jl; ++j) {
                if (labels[0][i] !== labels[j][i]) {
                    areIdentical = false;
                    break;
                }
            }
            if (areIdentical)
                offset += 1;
            else
                break;
        }
        if (offset > 0) {
            const offsetLabels = [labels[0].join(' | ')];
            for (let j = 1, jl = labels.length; j < jl; ++j) {
                offsetLabels.push(labels[j].slice(offset).filter(l => !!l).join(' | '));
            }
            return offsetLabels.join(' \u2014 ');
        }
        else {
            return labels.map(l => l.filter(l => !!l).join(' | ')).filter(l => !!l).join('</br>');
        }
    }
    else {
        const labels = bundle.loci.map(l => lociLabel(l, options));
        return labels.filter(l => !!l).join(condensed ? ' \u2014 ' : '</br>');
    }
}
function elementLabel(location, options = {}) {
    var _a, _b;
    const o = { ...exports.DefaultLabelOptions, ...options };
    const _label = _elementLabel(location, o.granularity, o.hidePrefix, o.reverse || o.condensed);
    // TODO: condensed label for single atom structure returns empty label.. handle this case here?
    const label = o.condensed ? (_b = (_a = _label[0]) === null || _a === void 0 ? void 0 : _a.replace(/\[.*\]/g, '').trim()) !== null && _b !== void 0 ? _b : '' : _label.filter(l => !!l).join(' | ');
    return o.htmlStyling ? label : (0, string_1.stripTags)(label);
}
function _elementLabel(location, granularity = 'element', hidePrefix = false, reverse = false) {
    const label = [];
    if (!hidePrefix) {
        let entry = location.unit.model.entry;
        if (entry.length > 30)
            entry = entry.substr(0, 27) + '\u2026'; // ellipsis
        label.push(`<small>${entry}</small>`); // entry
        if (granularity !== 'structure') {
            label.push(`<small>Model ${location.unit.model.modelNum}</small>`); // model
            label.push(`<small>Instance ${location.unit.conformation.operator.name}</small>`); // instance
        }
    }
    if (structure_1.Unit.isAtomic(location.unit)) {
        label.push(..._atomicElementLabel(location, granularity, reverse));
    }
    else if (structure_1.Unit.isCoarse(location.unit)) {
        label.push(..._coarseElementLabel(location, granularity));
    }
    else {
        label.push('Unknown');
    }
    return reverse ? label.reverse() : label;
}
function _atomicElementLabel(location, granularity, hideOccupancy = false) {
    const rI = structure_1.StructureElement.Location.residueIndex(location);
    const label_asym_id = structure_1.StructureProperties.chain.label_asym_id(location);
    const auth_asym_id = structure_1.StructureProperties.chain.auth_asym_id(location);
    const has_label_seq_id = location.unit.model.atomicHierarchy.residues.label_seq_id.valueKind(rI) === 0 /* Column.ValueKinds.Present */;
    const label_seq_id = structure_1.StructureProperties.residue.label_seq_id(location);
    const auth_seq_id = structure_1.StructureProperties.residue.auth_seq_id(location);
    const ins_code = structure_1.StructureProperties.residue.pdbx_PDB_ins_code(location);
    const comp_id = structure_1.StructureProperties.atom.label_comp_id(location);
    const atom_id = structure_1.StructureProperties.atom.label_atom_id(location);
    const alt_id = structure_1.StructureProperties.atom.label_alt_id(location);
    const occupancy = structure_1.StructureProperties.atom.occupancy(location);
    const microHetCompIds = structure_1.StructureProperties.residue.microheterogeneityCompIds(location);
    const compId = granularity === 'residue' && microHetCompIds.length > 1 ?
        `(${microHetCompIds.join('|')})` : comp_id;
    const label = [];
    switch (granularity) {
        case 'element':
            label.push(`<b>${atom_id}</b>${alt_id ? `%${alt_id}` : ''}`);
        case 'conformation':
            if (granularity === 'conformation' && alt_id) {
                label.push(`<small>Conformation</small> <b>${alt_id}</b>`);
            }
        case 'residue':
            const seq_id = label_seq_id === auth_seq_id || !has_label_seq_id ? auth_seq_id : label_seq_id;
            label.push(`<b>${compId} ${seq_id}</b>${seq_id !== auth_seq_id ? ` <small>[auth</small> <b>${auth_seq_id}</b><small>]</small>` : ''}<b>${ins_code ? ins_code : ''}</b>`);
        case 'chain':
            if (label_asym_id === auth_asym_id) {
                label.push(`<b>${label_asym_id}</b>`);
            }
            else {
                if (granularity === 'chain' && structure_1.Unit.Traits.is(location.unit.traits, structure_1.Unit.Trait.MultiChain)) {
                    label.push(`<small>[auth</small> <b>${auth_asym_id}</b><small>]</small>`);
                }
                else {
                    label.push(`<b>${label_asym_id}</b> <small>[auth</small> <b>${auth_asym_id}</b><small>]</small>`);
                }
            }
    }
    if (label.length > 0 && occupancy !== 1 && !hideOccupancy) {
        label[0] = `${label[0]} <small>[occupancy</small> <b>${Math.round(100 * occupancy) / 100}</b><small>]</small>`;
    }
    return label.reverse();
}
function _coarseElementLabel(location, granularity) {
    const asym_id = structure_1.StructureProperties.coarse.asym_id(location);
    const seq_id_begin = structure_1.StructureProperties.coarse.seq_id_begin(location);
    const seq_id_end = structure_1.StructureProperties.coarse.seq_id_end(location);
    const label = [];
    switch (granularity) {
        case 'element':
        case 'conformation':
        case 'residue':
            if (seq_id_begin === seq_id_end) {
                const entityIndex = structure_1.StructureProperties.coarse.entityKey(location);
                const seq = location.unit.model.sequence.byEntityKey[entityIndex];
                const comp_id = seq.sequence.compId.value(seq_id_begin - 1); // 1-indexed
                label.push(`<b>${comp_id} ${seq_id_begin}</b>`);
            }
            else {
                label.push(`<b>${seq_id_begin}-${seq_id_end}</b>`);
            }
        case 'chain':
            label.push(`<b>${asym_id}</b>`);
    }
    return label.reverse();
}
//
function distanceLabel(pair, options = {}) {
    const o = { ...exports.DefaultLabelOptions, measureOnly: false, unitLabel: '\u212B', ...options };
    const [cA, cB] = pair.loci.map(l => loci_1.Loci.getCenter(l));
    const distance = `${linear_algebra_1.Vec3.distance(cA, cB).toFixed(2)} ${o.unitLabel}`;
    if (o.measureOnly)
        return distance;
    const label = bundleLabel(pair, o);
    return o.condensed ? `${distance} | ${label}` : `Distance ${distance}</br>${label}`;
}
function angleLabel(triple, options = {}) {
    const o = { ...exports.DefaultLabelOptions, measureOnly: false, ...options };
    const [cA, cB, cC] = triple.loci.map(l => loci_1.Loci.getCenter(l));
    const vAB = linear_algebra_1.Vec3.sub((0, linear_algebra_1.Vec3)(), cA, cB);
    const vCB = linear_algebra_1.Vec3.sub((0, linear_algebra_1.Vec3)(), cC, cB);
    const angle = `${(0, misc_1.radToDeg)(linear_algebra_1.Vec3.angle(vAB, vCB)).toFixed(2)}\u00B0`;
    if (o.measureOnly)
        return angle;
    const label = bundleLabel(triple, o);
    return o.condensed ? `${angle} | ${label}` : `Angle ${angle}</br>${label}`;
}
function dihedralLabel(quad, options = {}) {
    const o = { ...exports.DefaultLabelOptions, measureOnly: false, ...options };
    const [cA, cB, cC, cD] = quad.loci.map(l => loci_1.Loci.getCenter(l));
    const dihedral = `${(0, misc_1.radToDeg)(linear_algebra_1.Vec3.dihedralAngle(cA, cB, cC, cD)).toFixed(2)}\u00B0`;
    if (o.measureOnly)
        return dihedral;
    const label = bundleLabel(quad, o);
    return o.condensed ? `${dihedral} | ${label}` : `Dihedral ${dihedral}</br>${label}`;
}
