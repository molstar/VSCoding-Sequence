/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { PluginContext } from '../../../mol-plugin/context';
/** All public functions provided by the StructConn extension  */
export declare const wwPDBStructConnExtensionFunctions: {
    /** Return an object with all struct_conn records for a loaded structure.
     * Applies to the first structure belonging to `entry` (e.g. '1tqn'),
     * or to the first loaded structure overall if `entry` is `undefined`.
     */
    getStructConns(plugin: PluginContext, entry: string | undefined): {
        [id: string]: StructConnRecord;
    };
    /** Create visuals for residues and atoms involved in a struct_conn with ID `structConnId`
     * and zoom on them. If `keepExisting` is false (default), remove any such visuals created by previous calls to this function.
     * Also hide all carbohydrate SNFG visuals within the structure (as they would occlude our residues of interest).
     * Return a promise that resolves to the number of involved atoms which were successfully selected (2, 1, or 0).
     */
    inspectStructConn(plugin: PluginContext, entry: string | undefined, structConnId: string, keepExisting?: boolean): Promise<number>;
    /** Remove anything created by `inspectStructConn` within the structure and
     * make visible any carbohydrate SNFG visuals that have been hidden by `inspectStructConn`.
     */
    clearStructConnInspections(plugin: PluginContext, entry: string | undefined): Promise<void>;
};
/** Represents one partner (i.e. atom) of a struct_conn */
interface StructConnPartner {
    asymId: string;
    seqId: number | undefined;
    authSeqId: number | undefined;
    insCode: string;
    compId: string;
    atomId: string;
    /** Alternative location (use empty string if not given) */
    altId: string;
}
/** Represents a struct_conn (interaction between two partners) */
export interface StructConnRecord {
    id: string;
    distance: number;
    partner1: StructConnPartner;
    partner2: StructConnPartner;
}
export {};
