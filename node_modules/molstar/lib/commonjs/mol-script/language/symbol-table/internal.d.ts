/**
 * Copyright (c) 2019 Mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Type } from '../type';
import { Arguments, Argument } from '../symbol';
export declare const internal: {
    '@header': string;
    generator: {
        '@header': string;
        bundleElement: import("../symbol").MSymbol<Arguments<Arguments.PropTypes<{
            groupedUnits: Argument<Type.Any>;
            set: Argument<Type.Any>;
            ranges: Argument<Type.Any>;
        }>>, Type.Any>;
        bundle: import("../symbol").MSymbol<Arguments<Arguments.PropTypes<{
            elements: Argument<Type.Any>;
        }>>, Type.Container<(env: any) => unknown>>;
        current: import("../symbol").MSymbol<Arguments<{}>, Type.Container<(env: any) => unknown>>;
    };
};
