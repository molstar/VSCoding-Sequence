/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureElement, Bond } from '../../mol-model/structure';
import { ColorScale, Color } from '../../mol-util/color';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ColorThemeCategory } from './categories';
const DefaultColor = Color(0xCCCCCC);
const Description = 'Gives every polymer residue a color based on its `seq_id` value.';
export const SequenceIdColorThemeParams = {
    list: PD.ColorList('turbo', { presetKind: 'scale' }),
};
export function getSequenceIdColorThemeParams(ctx) {
    return SequenceIdColorThemeParams; // TODO return copy
}
function getSeqId(unit, element) {
    const { model } = unit;
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */:
            const residueIndex = model.atomicHierarchy.residueAtomSegments.index[element];
            return model.atomicHierarchy.residues.label_seq_id.value(residueIndex);
        case 1 /* Unit.Kind.Spheres */:
            return Math.round((model.coarseHierarchy.spheres.seq_id_begin.value(element) +
                model.coarseHierarchy.spheres.seq_id_end.value(element)) / 2);
        case 2 /* Unit.Kind.Gaussians */:
            return Math.round((model.coarseHierarchy.gaussians.seq_id_begin.value(element) +
                model.coarseHierarchy.gaussians.seq_id_end.value(element)) / 2);
    }
}
function getSequenceLength(unit, element) {
    const { model } = unit;
    let entityId = '';
    switch (unit.kind) {
        case 0 /* Unit.Kind.Atomic */:
            const chainIndex = model.atomicHierarchy.chainAtomSegments.index[element];
            entityId = model.atomicHierarchy.chains.label_entity_id.value(chainIndex);
            break;
        case 1 /* Unit.Kind.Spheres */:
            entityId = model.coarseHierarchy.spheres.entity_id.value(element);
            break;
        case 2 /* Unit.Kind.Gaussians */:
            entityId = model.coarseHierarchy.gaussians.entity_id.value(element);
            break;
    }
    if (entityId === '')
        return 0;
    const entityIndex = model.entities.getEntityIndex(entityId);
    if (entityIndex === -1)
        return 0;
    const entity = model.sequence.byEntityKey[entityIndex];
    if (entity === undefined)
        return 0;
    return entity.sequence.length;
}
export function SequenceIdColorTheme(ctx, props) {
    const scale = ColorScale.create({
        listOrName: props.list.colors,
        minLabel: 'Start',
        maxLabel: 'End',
    });
    const color = (location) => {
        if (StructureElement.Location.is(location)) {
            const { unit, element } = location;
            const seq_id = getSeqId(unit, element);
            if (seq_id > 0) {
                const seqLen = getSequenceLength(unit, element);
                if (seqLen) {
                    scale.setDomain(0, seqLen - 1);
                    return scale.color(seq_id);
                }
            }
        }
        else if (Bond.isLocation(location)) {
            const { aUnit, aIndex } = location;
            const seq_id = getSeqId(aUnit, aUnit.elements[aIndex]);
            if (seq_id > 0) {
                const seqLen = getSequenceLength(aUnit, aUnit.elements[aIndex]);
                if (seqLen) {
                    scale.setDomain(0, seqLen - 1);
                    return scale.color(seq_id);
                }
            }
        }
        return DefaultColor;
    };
    return {
        factory: SequenceIdColorTheme,
        granularity: 'group',
        preferSmoothing: true,
        color,
        props,
        description: Description,
        legend: scale ? scale.legend : undefined
    };
}
export const SequenceIdColorThemeProvider = {
    name: 'sequence-id',
    label: 'Sequence Id',
    category: ColorThemeCategory.Residue,
    factory: SequenceIdColorTheme,
    getParams: getSequenceIdColorThemeParams,
    defaultValues: PD.getDefaultValues(SequenceIdColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
