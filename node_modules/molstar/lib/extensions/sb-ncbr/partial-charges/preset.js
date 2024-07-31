import { PresetStructureRepresentations, StructureRepresentationPresetProvider, } from '../../../mol-plugin-state/builder/structure/representation-preset';
import { StateObjectRef } from '../../../mol-state';
import { SbNcbrPartialChargesPropertyProvider } from './property';
import { SbNcbrPartialChargesColorThemeProvider } from './color';
export const SbNcbrPartialChargesPreset = StructureRepresentationPresetProvider({
    id: 'sb-ncbr-partial-charges-preset',
    display: {
        name: 'SB NCBR Partial Charges',
        group: 'Annotation',
        description: 'Color atoms and residues based on their partial charge.',
    },
    isApplicable(a) {
        return !!a.data.models.some((m) => SbNcbrPartialChargesPropertyProvider.isApplicable(m));
    },
    params: () => StructureRepresentationPresetProvider.CommonParams,
    async apply(ref, params, plugin) {
        var _a;
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, ref);
        const structure = (_a = structureCell === null || structureCell === void 0 ? void 0 : structureCell.obj) === null || _a === void 0 ? void 0 : _a.data;
        if (!structureCell || !structure)
            return {};
        const colorTheme = SbNcbrPartialChargesColorThemeProvider.name;
        return PresetStructureRepresentations.auto.apply(ref, { ...params, theme: { globalName: colorTheme, focus: { name: colorTheme, params: { chargeType: 'atom' } } } }, plugin);
    },
});
