/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Michal Malý <michal.maly@ibt.cas.cz>
 * @author Jiří Černý <jiri.cerny@ibt.cas.cz>
 */
import { DnatcoTypes } from '../types';
import { DataLocation } from '../../../mol-model/location';
import { DataLoci } from '../../../mol-model/loci';
export declare namespace ConfalPyramidsTypes {
    interface Location extends DataLocation<DnatcoTypes.HalfStep, {}> {
    }
    function Location(step: DnatcoTypes.Step, isLower: boolean): DataLocation<{
        step: DnatcoTypes.Step;
        isLower: boolean;
    }, {}>;
    function isLocation(x: any): x is Location;
    interface Loci extends DataLoci<DnatcoTypes.Step[], number> {
    }
    function Loci(data: DnatcoTypes.Step[], elements: ReadonlyArray<number>): Loci;
    function isLoci(x: any): x is Loci;
}
