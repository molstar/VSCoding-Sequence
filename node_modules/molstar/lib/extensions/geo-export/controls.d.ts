/**
 * Copyright (c) 2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sukolsak Sakshuwong <sukolsak@stanford.edu>
 */
import { PluginComponent } from '../../mol-plugin-state/component';
import { PluginContext } from '../../mol-plugin/context';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
export declare const GeometryParams: {
    format: PD.Select<string>;
};
export declare class GeometryControls extends PluginComponent {
    private plugin;
    readonly behaviors: {
        params: import("rxjs").BehaviorSubject<PD.Values<{
            format: PD.Select<string>;
        }>>;
    };
    private getFilename;
    exportGeometry(): Promise<{
        blob: Blob;
        filename: string;
    }>;
    constructor(plugin: PluginContext);
}
