/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import * as React from 'react';
import { StructureHierarchyRef } from '../../mol-plugin-state/manager/structure/hierarchy-state';
import { PurePluginUIComponent } from '../base';
export declare class GenericEntryListControls extends PurePluginUIComponent {
    get current(): import("rxjs").BehaviorSubject<{
        hierarchy: import("../../mol-plugin-state/manager/structure/hierarchy-state").StructureHierarchy;
        trajectories: readonly import("../../mol-plugin-state/manager/structure/hierarchy-state").TrajectoryRef[];
        models: readonly import("../../mol-plugin-state/manager/structure/hierarchy-state").ModelRef[];
        structures: readonly import("../../mol-plugin-state/manager/structure/hierarchy-state").StructureRef[];
    }>;
    componentDidMount(): void;
    get unitcell(): import("react/jsx-runtime").JSX.Element | null;
    get customControls(): JSX.Element[] | null;
    render(): import("react/jsx-runtime").JSX.Element;
}
export declare class GenericEntry<T extends StructureHierarchyRef> extends PurePluginUIComponent<{
    refs: T[];
    labelMultiple?: string;
}, {
    showOptions: boolean;
}> {
    state: {
        showOptions: boolean;
    };
    componentDidMount(): void;
    get pivot(): T;
    toggleVisibility: (e: React.MouseEvent<HTMLElement>) => void;
    highlight: (e: React.MouseEvent<HTMLElement>) => void;
    clearHighlight: (e: React.MouseEvent<HTMLElement>) => void;
    focus: (e: React.MouseEvent<HTMLElement>) => void;
    toggleOptions: () => void;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
