/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export type SubstitutionMatrixData = Readonly<{
    [k: string]: Readonly<{
        [k: string]: number;
    }>;
}>;
export declare const SubstitutionMatrices: {
    blosum62: Readonly<{
        [k: string]: Readonly<{
            [k: string]: number;
        }>;
    }>;
    blosum62x: Readonly<{
        [k: string]: Readonly<{
            [k: string]: number;
        }>;
    }>;
};
export type SubstitutionMatrix = keyof typeof SubstitutionMatrices;
