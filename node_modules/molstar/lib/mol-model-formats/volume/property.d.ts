/**
 * Copyright (c) 2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
import { Volume } from '../../mol-model/volume/volume';
export { PropertyProvider };
interface PropertyProvider<T> {
    readonly descriptor: CustomPropertyDescriptor;
    get(volume: Volume): T | undefined;
    set(volume: Volume, value: T): void;
}
declare namespace PropertyProvider {
    function create<T>(descriptor: CustomPropertyDescriptor): PropertyProvider<T>;
}
export { RecommendedIsoValue };
type RecommendedIsoValue = Volume.IsoValue;
declare namespace RecommendedIsoValue {
    const Descriptor: CustomPropertyDescriptor;
    const Provider: PropertyProvider<Volume.IsoValue>;
}
