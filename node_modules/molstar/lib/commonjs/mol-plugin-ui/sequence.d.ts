/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { PluginUIComponent } from './base';
import { Structure, StructureElement } from '../mol-model/structure';
import { SequenceWrapper } from './sequence/wrapper';
import { State } from '../mol-state';
import { StructureSelectionManager } from '../mol-plugin-state/manager/structure/selection';
export declare function opKey(l: StructureElement.Location): string;
export declare function splitModelEntityId(modelEntityId: string): (string | number)[];
export declare function getSequenceWrapper(state: {
    structure: Structure;
    modelEntityId: string;
    chainGroupId: number;
    operatorKey: string;
}, structureSelection: StructureSelectionManager): SequenceWrapper.Any | string;
export declare function getModelEntityOptions(structure: Structure, polymersOnly?: boolean): [string, string][];
export declare function getChainOptions(structure: Structure, modelEntityId: string): [number, string][];
export declare function getOperatorOptions(structure: Structure, modelEntityId: string, chainGroupId: number): [string, string][];
export declare function getStructureOptions(state: State): {
    options: [string, string][];
    all: Structure[];
};
export type SequenceViewMode = 'single' | 'polymers' | 'all';
type SequenceViewState = {
    structureOptions: {
        options: [string, string][];
        all: Structure[];
    };
    structure: Structure;
    structureRef: string;
    modelEntityId: string;
    chainGroupId: number;
    operatorKey: string;
    mode: SequenceViewMode;
};
export declare class SequenceView extends PluginUIComponent<{
    defaultMode?: SequenceViewMode;
}, SequenceViewState> {
    state: SequenceViewState;
    componentDidMount(): void;
    private sync;
    private getStructure;
    private getSequenceWrapper;
    private getSequenceWrappers;
    private getInitialState;
    private get params();
    private get values();
    private setParamProps;
    render(): import("react/jsx-runtime").JSX.Element;
}
export {};
