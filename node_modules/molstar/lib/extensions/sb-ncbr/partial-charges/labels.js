import { StructureElement, StructureProperties } from '../../../mol-model/structure';
import { SbNcbrPartialChargesPropertyProvider, hasPartialChargesCategories } from './property';
export function SbNcbrPartialChargesLociLabelProvider(ctx) {
    return {
        label: (loci) => {
            var _a, _b;
            if (!StructureElement.Loci.is(loci))
                return;
            const model = loci.structure.model;
            if (!hasPartialChargesCategories(model))
                return;
            const data = SbNcbrPartialChargesPropertyProvider.get(model).value;
            if (!data)
                return;
            const loc = StructureElement.Loci.getFirstLocation(loci);
            if (!loc)
                return;
            const granularity = ctx.managers.interactivity.props.granularity;
            if (granularity !== 'element' && granularity !== 'residue') {
                return;
            }
            const atomId = StructureProperties.atom.id(loc);
            const { typeIdToAtomIdToCharge, typeIdToResidueToCharge } = data;
            const typeId = SbNcbrPartialChargesPropertyProvider.props(model).typeId;
            const showResidueCharge = granularity === 'residue';
            const charge = showResidueCharge
                ? (_a = typeIdToResidueToCharge.get(typeId)) === null || _a === void 0 ? void 0 : _a.get(atomId)
                : (_b = typeIdToAtomIdToCharge.get(typeId)) === null || _b === void 0 ? void 0 : _b.get(atomId);
            const label = granularity === 'residue' ? 'Residue charge' : 'Atom charge';
            return `<strong>${label}: ${(charge === null || charge === void 0 ? void 0 : charge.toFixed(4)) || 'undefined'}</strong>`;
        },
        group: (label) => label.toString().replace(/Model [0-9]+/g, 'Models'),
    };
}
