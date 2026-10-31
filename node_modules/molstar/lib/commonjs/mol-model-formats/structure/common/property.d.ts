/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { Model } from '../../../mol-model/structure';
import { ModelFormat } from '../../format';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
declare class FormatRegistry<T> {
    private map;
    private applicable;
    add(kind: ModelFormat['kind'], obtain: (model: Model) => T | undefined, applicable?: (model: Model) => boolean): void;
    remove(kind: ModelFormat['kind']): void;
    get(kind: ModelFormat['kind']): ((model: Model) => T | undefined) | undefined;
    isApplicable(model: Model): boolean;
}
export { FormatPropertyProvider };
interface FormatPropertyProvider<T> {
    readonly descriptor: CustomPropertyDescriptor;
    readonly formatRegistry: FormatRegistry<T>;
    isApplicable(model: Model): boolean;
    get(model: Model): T | undefined;
    set(model: Model, value: T): void;
    delete(model: Model): void;
}
declare namespace FormatPropertyProvider {
    function create<T>(descriptor: CustomPropertyDescriptor, options?: {
        asDynamic?: boolean;
    }): FormatPropertyProvider<T>;
}
