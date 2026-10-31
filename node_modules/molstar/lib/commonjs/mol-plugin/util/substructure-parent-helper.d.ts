/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Structure } from '../../mol-model/structure';
import { PluginStateObject } from '../../mol-plugin-state/objects';
import { StateObjectCell } from '../../mol-state';
import { PluginContext } from '../context';
export { SubstructureParentHelper };
declare class SubstructureParentHelper {
    private plugin;
    private ev;
    readonly events: {
        updated: import("rxjs").Subject<{
            ref: string;
            oldObj: PluginStateObject.Molecule.Structure | undefined;
            obj: PluginStateObject.Molecule.Structure;
        }>;
        removed: import("rxjs").Subject<{
            ref: string;
            obj: PluginStateObject.Molecule.Structure | undefined;
        }>;
    };
    private root;
    private tracked;
    private getDecorator;
    /** Returns the root node of given structure if existing, takes decorators into account */
    get(s: Structure, ignoreDecorators?: boolean): StateObjectCell<PluginStateObject.Molecule.Structure> | undefined;
    private addMapping;
    private removeMapping;
    private updateMapping;
    dispose(): void;
    constructor(plugin: PluginContext);
}
