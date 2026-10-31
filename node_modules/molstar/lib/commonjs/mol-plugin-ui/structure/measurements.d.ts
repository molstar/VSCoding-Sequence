/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Jason Pattle <jpattle.exscientia.co.uk>
 */
import { StructureElement } from '../../mol-model/structure';
import { StructureMeasurementCell } from '../../mol-plugin-state/manager/structure/measurement';
import { StructureSelectionHistoryEntry } from '../../mol-plugin-state/manager/structure/selection';
import { CollapsableControls, PurePluginUIComponent } from '../base';
import { ActionMenu } from '../controls/action-menu';
import { PencilRulerSvg } from '../controls/icons';
export declare class StructureMeasurementsControls extends CollapsableControls {
    defaultState(): {
        isCollapsed: boolean;
        header: string;
        brand: {
            accent: "gray";
            svg: typeof PencilRulerSvg;
        };
    };
    renderControls(): import("react/jsx-runtime").JSX.Element;
}
export declare class MeasurementList extends PurePluginUIComponent {
    componentDidMount(): void;
    renderGroup(cells: ReadonlyArray<StructureMeasurementCell>, header: string): import("react/jsx-runtime").JSX.Element | null;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class MeasurementControls extends PurePluginUIComponent<{}, {
    isBusy: boolean;
    action?: 'add' | 'options';
}> {
    state: {
        isBusy: boolean;
        action: "add" | "options" | undefined;
    };
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: {}, prevState: {
        isBusy: boolean;
        action?: 'add' | 'options';
    }): void;
    clearOrderLabels(): void;
    updateOrderLabels(): void;
    get selection(): import("../../mol-plugin-state/manager/structure/selection").StructureSelectionManager;
    measureDistance: () => void;
    measureAngle: () => void;
    measureDihedral: () => void;
    addLabel: () => void;
    addOrientation: () => void;
    addPlane: () => void;
    get actions(): ActionMenu.Items;
    selectAction: ActionMenu.OnSelect;
    toggleAdd: () => void;
    toggleOptions: () => void;
    highlight(loci: StructureElement.Loci): void;
    moveHistory(e: StructureSelectionHistoryEntry, direction: 'up' | 'down'): void;
    focusLoci(loci: StructureElement.Loci): void;
    historyEntry(e: StructureSelectionHistoryEntry, idx: number): import("react/jsx-runtime").JSX.Element;
    add(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
