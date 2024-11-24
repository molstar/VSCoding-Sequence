/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Structure } from '../../mol-model/structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { CustomProperty } from './custom-property';
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
export { CustomStructureProperty };
declare namespace CustomStructureProperty {
    interface Provider<Params extends PD.Params, Value> extends CustomProperty.Provider<Structure, Params, Value> {
    }
    interface ProviderBuilder<Params extends PD.Params, Value> {
        readonly label: string;
        readonly descriptor: CustomPropertyDescriptor;
        readonly isHidden?: boolean;
        readonly defaultParams: Params;
        readonly getParams: (data: Structure) => Params;
        readonly isApplicable: (data: Structure) => boolean;
        readonly obtain: (ctx: CustomProperty.Context, data: Structure, props: PD.Values<Params>) => Promise<CustomProperty.Data<Value>>;
        readonly type: 'root' | 'local';
    }
    function createProvider<Params extends PD.Params, Value>(builder: ProviderBuilder<Params, Value>): CustomProperty.Provider<Structure, Params, Value>;
    function createSimple<T>(name: string, type: 'root' | 'local', defaultValue?: T): CustomProperty.Provider<Structure, {
        value: PD.Value<T | undefined>;
    }, T | undefined>;
}
