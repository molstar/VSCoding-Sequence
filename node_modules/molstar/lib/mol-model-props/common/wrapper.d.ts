/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { CifWriter } from '../../mol-io/writer/cif';
import { Model } from '../../mol-model/structure';
interface PropertyWrapper<Data> {
    info: PropertyWrapper.Info;
    data: Data;
}
declare namespace PropertyWrapper {
    interface Info {
        timestamp_utc: string;
    }
    function createInfo(): Info;
    function defaultInfoCategory<Ctx>(name: string, getter: (ctx: Ctx) => Info | undefined): CifWriter.Category<Ctx>;
    function tryGetInfoFromCif(categoryName: string, model: Model): Info | undefined;
}
export { PropertyWrapper };
