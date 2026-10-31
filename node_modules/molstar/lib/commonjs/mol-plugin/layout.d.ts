/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../mol-util/param-definition';
import { StatefulPluginComponent } from '../mol-plugin-state/component';
import { PluginContext } from './context';
export type PluginLayoutControlsDisplay = 'outside' | 'portrait' | 'landscape' | 'reactive';
export declare const PluginLayoutStateParams: {
    isExpanded: PD.BooleanParam;
    showControls: PD.BooleanParam;
    regionState: PD.Group<PD.Normalize<{
        left: "hidden" | "full" | "collapsed";
        top: "hidden" | "full";
        right: "hidden" | "full";
        bottom: "hidden" | "full";
    }>>;
    controlsDisplay: PD.Value<PluginLayoutControlsDisplay>;
};
export type PluginLayoutStateProps = PD.Values<typeof PluginLayoutStateParams>;
export type LeftPanelTabName = 'none' | 'root' | 'data' | 'states' | 'settings' | 'help';
export declare class PluginLayout extends StatefulPluginComponent<PluginLayoutStateProps> {
    private context;
    readonly events: {
        updated: import("rxjs").Subject<unknown>;
    };
    private updateProps;
    root: HTMLElement | undefined;
    private rootState;
    private expandedViewport;
    setProps(props: Partial<PluginLayoutStateProps>): void;
    setRoot(root: HTMLElement): void;
    private getScrollElement;
    private handleExpand;
    constructor(context: PluginContext);
}
