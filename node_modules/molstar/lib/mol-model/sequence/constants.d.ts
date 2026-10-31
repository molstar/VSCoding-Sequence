/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export type AminoAlphabet = 'H' | 'R' | 'K' | 'I' | 'F' | 'L' | 'W' | 'A' | 'M' | 'P' | 'C' | 'N' | 'V' | 'G' | 'S' | 'Q' | 'Y' | 'D' | 'E' | 'T' | 'U' | 'O' | 'X' /** = Unknown */ | '-'; /** = Gap */
export type NuclecicAlphabet = 'A' | 'C' | 'G' | 'T' | 'U' | 'X' /** = Unknown */ | '-'; /** = Gap */
export declare function getProteinOneLetterCode(residueName: string): AminoAlphabet;
export declare function getRnaOneLetterCode(residueName: string): NuclecicAlphabet;
export declare function getDnaOneLetterCode(residueName: string): NuclecicAlphabet;
