"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SbNcbrPartialChargesPreset = void 0;
const representation_preset_1 = require("../../../mol-plugin-state/builder/structure/representation-preset");
const mol_state_1 = require("../../../mol-state");
const property_1 = require("./property");
const color_1 = require("./color");
exports.SbNcbrPartialChargesPreset = (0, representation_preset_1.StructureRepresentationPresetProvider)({
    id: 'sb-ncbr-partial-charges-preset',
    display: {
        name: 'SB NCBR Partial Charges',
        group: 'Annotation',
        description: 'Color atoms and residues based on their partial charge.',
    },
    isApplicable(a) {
        return !!a.data.models.some((m) => property_1.SbNcbrPartialChargesPropertyProvider.isApplicable(m));
    },
    params: () => representation_preset_1.StructureRepresentationPresetProvider.CommonParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = mol_state_1.StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        const colorTheme = color_1.SbNcbrPartialChargesColorThemeProvider.name;
        return representation_preset_1.PresetStructureRepresentations.auto.apply(ref, { ...params, theme: { globalName: colorTheme, focus: { name: colorTheme, params: { chargeType: 'atom' } } } }, plugin);
    },
});
