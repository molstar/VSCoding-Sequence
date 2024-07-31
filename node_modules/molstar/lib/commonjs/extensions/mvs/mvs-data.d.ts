/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Root } from './tree/mvs/mvs-builder';
import { MVSTree } from './tree/mvs/mvs-tree';
/** Top level of the MolViewSpec (MVS) data format. */
export interface MVSData {
    /** MolViewSpec tree */
    root: MVSTree;
    /** Associated metadata */
    metadata: MVSMetadata;
}
interface MVSMetadata {
    /** Version of the spec used to write this tree */
    version: string;
    /** Name of this view */
    title?: string;
    /** Detailed description of this view */
    description?: string;
    /** Format of the description */
    description_format?: 'markdown' | 'plaintext';
    /** Timestamp when this view was exported */
    timestamp: string;
}
export declare const MVSData: {
    /** Currently supported major version of MolViewSpec format (e.g. 1 for version '1.0.8') */
    SupportedVersion: number;
    /** Parse MVSJ (MolViewSpec-JSON) format to `MVSData`. Does not include any validation. */
    fromMVSJ(mvsjString: string): MVSData;
    /** Encode `MVSData` to MVSJ (MolViewSpec-JSON) string. Use `space` parameter to control formatting (as with `JSON.stringify`). */
    toMVSJ(mvsData: MVSData, space?: string | number): string;
    /** Validate `MVSData`. Return `true` if OK; `false` if not OK.
     * If `options.noExtra` is true, presence of any extra node parameters is treated as an issue. */
    isValid(mvsData: MVSData, options?: {
        noExtra?: boolean;
    }): boolean;
    /** Validate `MVSData`. Return `undefined` if OK; list of issues if not OK.
     * If `options.noExtra` is true, presence of any extra node parameters is treated as an issue. */
    validationIssues(mvsData: MVSData, options?: {
        noExtra?: boolean;
    }): string[] | undefined;
    /** Return a human-friendly textual representation of `mvsData`. */
    toPrettyString(mvsData: MVSData): string;
    /** Create a new MolViewSpec builder containing only a root node. Example of MVS builder usage:
     *
     * ```
     * const builder = MVSData.createBuilder();
     * builder.canvas({ background_color: 'white' });
     * const struct = builder.download({ url: 'https://www.ebi.ac.uk/pdbe/entry-files/download/1og2_updated.cif' }).parse({ format: 'mmcif' }).modelStructure();
     * struct.component().representation().color({ color: '#3050F8' });
     * console.log(MVSData.toPrettyString(builder.getState()));
     * ```
     */
    createBuilder(): Root;
};
export {};
