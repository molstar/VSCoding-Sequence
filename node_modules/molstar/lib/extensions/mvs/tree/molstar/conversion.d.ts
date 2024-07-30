/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { MolstarTree } from './molstar-tree';
import { MVSTree } from '../mvs/mvs-tree';
/** Convert `format` parameter of `parse` node in `MolstarTree`
 * into `format` and `is_binary` parameters in `MolstarTree` */
export declare const ParseFormatMvsToMolstar: {
    mmcif: {
        format: "cif";
        is_binary: false;
    };
    bcif: {
        format: "cif";
        is_binary: true;
    };
    pdb: {
        format: "pdb";
        is_binary: false;
    };
};
/** Convert MolViewSpec tree into MolStar tree */
export declare function convertMvsToMolstar(mvsTree: MVSTree, sourceUrl: string | undefined): MolstarTree;
/** Run some sanity check on a MVSTree. Return a list of potential problems (`undefined` if there are none) */
export declare function mvsSanityCheckIssues(tree: MVSTree): string[] | undefined;
/** Run some sanity check on a MVSTree and print potential issues to the console. */
export declare function mvsSanityCheck(tree: MVSTree): void;
