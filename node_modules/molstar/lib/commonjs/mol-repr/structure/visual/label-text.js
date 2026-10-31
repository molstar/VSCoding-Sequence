"use strict";
/**
 * Copyright (c) 2019-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabelTextParams = void 0;
exports.LabelTextVisual = LabelTextVisual;
const param_definition_1 = require("../../../mol-util/param-definition");
const structure_1 = require("../../../mol-model/structure");
const text_builder_1 = require("../../../mol-geo/geometry/text/text-builder");
const complex_visual_1 = require("../complex-visual");
const element_1 = require("./util/element");
const names_1 = require("../../../mol-util/color/names");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const boundary_helper_1 = require("../../../mol-math/geometry/boundary-helper");
const element_2 = require("./util/element");
exports.LabelTextParams = {
    ...complex_visual_1.ComplexTextParams,
    background: param_definition_1.ParamDefinition.Boolean(false),
    backgroundMargin: param_definition_1.ParamDefinition.Numeric(0, { min: 0, max: 1, step: 0.01 }),
    backgroundColor: param_definition_1.ParamDefinition.Color(names_1.ColorNames.black),
    backgroundOpacity: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 1, step: 0.01 }),
    borderWidth: param_definition_1.ParamDefinition.Numeric(0.25, { min: 0, max: 0.5, step: 0.01 }),
    level: param_definition_1.ParamDefinition.Select('residue', [['chain', 'Chain'], ['residue', 'Residue'], ['element', 'Element']], { isEssential: true }),
    ignoreHydrogens: param_definition_1.ParamDefinition.Boolean(false),
    ignoreHydrogensVariant: param_definition_1.ParamDefinition.Select('all', param_definition_1.ParamDefinition.arrayToOptions(['all', 'non-polar'])),
    chainScale: param_definition_1.ParamDefinition.Numeric(10, { min: 0, max: 20, step: 0.1 }),
    residueScale: param_definition_1.ParamDefinition.Numeric(1, { min: 0, max: 20, step: 0.1 }),
    elementScale: param_definition_1.ParamDefinition.Numeric(0.5, { min: 0, max: 20, step: 0.1 }),
};
function LabelTextVisual(materialId) {
    return (0, complex_visual_1.ComplexTextVisual)({
        defaultProps: param_definition_1.ParamDefinition.getDefaultValues(exports.LabelTextParams),
        createGeometry: createLabelText,
        createLocationIterator: element_1.ElementIterator.fromStructure,
        getLoci: element_1.getSerialElementLoci,
        eachLocation: element_1.eachSerialElement,
        setUpdateState: (state, newProps, currentProps) => {
            state.createGeometry = (newProps.level !== currentProps.level ||
                (newProps.level === 'chain' && newProps.chainScale !== currentProps.chainScale) ||
                (newProps.level === 'residue' && newProps.residueScale !== currentProps.residueScale) ||
                (newProps.level === 'element' && newProps.elementScale !== currentProps.elementScale) ||
                newProps.ignoreHydrogens !== currentProps.ignoreHydrogens ||
                newProps.ignoreHydrogensVariant !== currentProps.ignoreHydrogensVariant);
        }
    }, materialId);
}
function createLabelText(ctx, structure, theme, props, text) {
    switch (props.level) {
        case 'chain': return createChainText(ctx, structure, theme, props, text);
        case 'residue': return createResidueText(ctx, structure, theme, props, text);
        case 'element': return createElementText(ctx, structure, theme, props, text);
    }
}
//
const tmpVec = (0, linear_algebra_1.Vec3)();
const boundaryHelper = new boundary_helper_1.BoundaryHelper('98');
function createChainText(ctx, structure, theme, props, text) {
    const l = structure_1.StructureElement.Location.create(structure);
    const { units, serialMapping } = structure;
    const { auth_asym_id, label_asym_id } = structure_1.StructureProperties.chain;
    const { cumulativeUnitElementCount } = serialMapping;
    const count = units.length;
    const { chainScale } = props;
    const builder = text_builder_1.TextBuilder.create(props, count, count / 2, text);
    for (let i = 0, il = units.length; i < il; ++i) {
        const unit = units[i];
        l.unit = unit;
        l.element = unit.elements[0];
        const { center, radius } = unit.lookup3d.boundary.sphere;
        linear_algebra_1.Vec3.transformMat4(tmpVec, center, unit.conformation.operator.matrix);
        const authId = auth_asym_id(l);
        const labelId = label_asym_id(l);
        const text = authId === labelId ? labelId : `${labelId} [${authId}]`;
        builder.add(text, tmpVec[0], tmpVec[1], tmpVec[2], radius, chainScale, cumulativeUnitElementCount[i]);
    }
    return builder.getText();
}
function createResidueText(ctx, structure, theme, props, text) {
    const l = structure_1.StructureElement.Location.create(structure);
    const { units, serialMapping } = structure;
    const { label_comp_id } = structure_1.StructureProperties.atom;
    const { auth_seq_id } = structure_1.StructureProperties.residue;
    const { cumulativeUnitElementCount } = serialMapping;
    const count = structure.polymerResidueCount * 2;
    const { residueScale } = props;
    const builder = text_builder_1.TextBuilder.create(props, count, count / 2, text);
    for (let i = 0, il = units.length; i < il; ++i) {
        const unit = units[i];
        const c = unit.conformation;
        const { elements } = unit;
        l.unit = unit;
        l.element = unit.elements[0];
        const residueIndex = unit.model.atomicHierarchy.residueAtomSegments.index;
        const groupOffset = cumulativeUnitElementCount[i];
        let j = 0;
        const jl = elements.length;
        while (j < jl) {
            const start = j, rI = residueIndex[elements[j]];
            j++;
            while (j < jl && residueIndex[elements[j]] === rI)
                j++;
            boundaryHelper.reset();
            for (let eI = start; eI < j; eI++) {
                c.position(elements[eI], tmpVec);
                boundaryHelper.includePosition(tmpVec);
            }
            boundaryHelper.finishedIncludeStep();
            for (let eI = start; eI < j; eI++) {
                c.position(elements[eI], tmpVec);
                boundaryHelper.radiusPosition(tmpVec);
            }
            l.element = elements[start];
            const { center, radius } = boundaryHelper.getSphere();
            const authSeqId = auth_seq_id(l);
            const compId = label_comp_id(l);
            const text = `${compId} ${authSeqId}`;
            builder.add(text, center[0], center[1], center[2], radius, residueScale, groupOffset + start);
        }
    }
    return builder.getText();
}
function createElementText(ctx, structure, theme, props, text) {
    const l = structure_1.StructureElement.Location.create(structure);
    const { units, serialMapping } = structure;
    const { label_atom_id, label_alt_id } = structure_1.StructureProperties.atom;
    const { cumulativeUnitElementCount } = serialMapping;
    const sizeTheme = theme.size;
    const count = structure.elementCount;
    const { elementScale } = props;
    const builder = text_builder_1.TextBuilder.create(props, count, count / 2, text);
    for (let i = 0, il = units.length; i < il; ++i) {
        const unit = units[i];
        const c = unit.conformation;
        const { elements } = unit;
        l.unit = unit;
        const groupOffset = cumulativeUnitElementCount[i];
        const ignore = (0, element_2.makeElementIgnoreTest)(structure, unit, { ...props, traceOnly: false });
        for (let j = 0, _j = elements.length; j < _j; j++) {
            if (ignore && ignore(elements[j]))
                continue;
            l.element = elements[j];
            c.position(l.element, tmpVec);
            const atomId = label_atom_id(l);
            const altId = label_alt_id(l);
            const text = altId ? `${atomId}%${altId}` : atomId;
            builder.add(text, tmpVec[0], tmpVec[1], tmpVec[2], sizeTheme.size(l), elementScale, groupOffset + j);
        }
    }
    return builder.getText();
}
