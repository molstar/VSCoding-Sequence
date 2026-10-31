/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export declare const ccd_chemCompAtom_schema: {
    comp_id: import("../../../../mol-data/db").Column.Schema.Str;
    atom_id: import("../../../../mol-data/db").Column.Schema.Str;
    charge: import("../../../../mol-data/db").Column.Schema.Int;
    pdbx_stereo_config: import("../../../../mol-data/db").Column.Schema.Aliased<"s" | "r" | "n">;
};
