/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { CollapsableControls, CollapsableState } from '../../mol-plugin-ui/base';
import { VolsegEntry } from './entry-root';
import { VolsegGlobalStateData } from './global-state';
interface VolsegUIData {
    globalState?: VolsegGlobalStateData;
    availableNodes: VolsegEntry[];
    activeNode?: VolsegEntry;
}
declare namespace VolsegUIData {
    function changeAvailableNodes(data: VolsegUIData, newNodes: VolsegEntry[]): VolsegUIData;
    function changeActiveNode(data: VolsegUIData, newActiveRef: string): VolsegUIData;
    function equals(data1: VolsegUIData, data2: VolsegUIData): boolean;
}
export declare class VolsegUI extends CollapsableControls<{}, {
    data: VolsegUIData;
}> {
    protected defaultState(): CollapsableState & {
        data: VolsegUIData;
    };
    protected renderControls(): JSX.Element | null;
    componentDidMount(): void;
}
export {};
