"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SbNcbrPartialChargesLociLabelProvider = SbNcbrPartialChargesLociLabelProvider;
const structure_1 = require("../../../mol-model/structure");
const property_1 = require("./property");
function SbNcbrPartialChargesLociLabelProvider(ctx) {
    return {
        label: (loci) => {
            var _a, _b;
            if (!structure_1.StructureElement.Loci.is(loci))
                return;
            const model = loci.structure.model;
            if (!(0, property_1.hasPartialChargesCategories)(model))
                return;
            const data = property_1.SbNcbrPartialChargesPropertyProvider.get(model).value;
            if (!data)
                return;
            const loc = structure_1.StructureElement.Loci.getFirstLocation(loci);
            if (!loc)
                return;
            const granularity = ctx.managers.interactivity.props.granularity;
            if (granularity !== 'element' && granularity !== 'residue') {
                return;
            }
            const atomId = structure_1.StructureProperties.atom.id(loc);
            const { typeIdToAtomIdToCharge, typeIdToResidueToCharge } = data;
            const typeId = property_1.SbNcbrPartialChargesPropertyProvider.props(model).typeId;
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
