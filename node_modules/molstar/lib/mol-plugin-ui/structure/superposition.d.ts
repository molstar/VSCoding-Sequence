/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 */
import { SymmetryOperator } from '../../mol-math/geometry';
import { Mat4 } from '../../mol-math/linear-algebra';
import { StructureElement } from '../../mol-model/structure';
import { StructureSelectionHistoryEntry } from '../../mol-plugin-state/manager/structure/selection';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { StateObjectCell, StateObjectRef } from '../../mol-state';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { CollapsableControls, PurePluginUIComponent } from '../base';
export declare class StructureSuperpositionControls extends CollapsableControls {
    defaultState(): {
        isCollapsed: boolean;
        header: string;
        brand: {
            accent: "gray";
            svg: typeof import("../controls/icons").FlipToFrontSvg;
        };
        isHidden: boolean;
    };
    componentDidMount(): void;
    renderControls(): import("react/jsx-runtime").JSX.Element;
}
export declare const StructureSuperpositionParams: {
    alignSequences: PD.BooleanParam;
    traceOnly: PD.BooleanParam;
};
export type StructureSuperpositionOptions = PD.ValuesFor<typeof StructureSuperpositionParams>;
type SuperpositionControlsState = {
    isBusy: boolean;
    action?: 'byChains' | 'byAtoms' | 'options';
    canUseDb?: boolean;
    options: StructureSuperpositionOptions;
};
export interface LociEntry {
    loci: StructureElement.Loci;
    label: string;
    cell: StateObjectCell<PluginStateObject.Molecule.Structure>;
}
interface AtomsLociEntry extends LociEntry {
    atoms: StructureSelectionHistoryEntry[];
}
export declare class SuperpositionControls extends PurePluginUIComponent<{}, SuperpositionControlsState> {
    state: SuperpositionControlsState;
    componentDidMount(): void;
    get selection(): import("../../mol-plugin-state/manager/structure/selection").StructureSelectionManager;
    transform(s: StateObjectRef<PluginStateObject.Molecule.Structure>, matrix: Mat4, coordinateSystem?: SymmetryOperator): Promise<void>;
    private getRootStructure;
    superposeChains: () => Promise<void>;
    superposeAtoms: () => Promise<void>;
    superposeDb: () => Promise<void>;
    cameraReset(): Promise<void>;
    toggleByChains: () => void;
    toggleByAtoms: () => void;
    toggleOptions: () => void;
    highlight(loci: StructureElement.Loci): void;
    moveHistory(e: StructureSelectionHistoryEntry, direction: 'up' | 'down'): void;
    focusLoci(loci: StructureElement.Loci): void;
    lociEntry(e: LociEntry, idx: number): import("react/jsx-runtime").JSX.Element;
    historyEntry(e: StructureSelectionHistoryEntry, idx: number): import("react/jsx-runtime").JSX.Element;
    atomsLociEntry(e: AtomsLociEntry, idx: number): import("react/jsx-runtime").JSX.Element;
    get chainEntries(): LociEntry[];
    get atomEntries(): AtomsLociEntry[];
    toggleHint(): import("react/jsx-runtime").JSX.Element | null;
    addByChains(): import("react/jsx-runtime").JSX.Element;
    addByAtoms(): import("react/jsx-runtime").JSX.Element;
    superposeByDbMapping(): import("react/jsx-runtime").JSX.Element;
    private setOptions;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};
