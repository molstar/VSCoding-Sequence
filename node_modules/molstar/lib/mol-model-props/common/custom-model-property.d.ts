/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { Model } from '../../mol-model/structure';
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { CustomProperty } from './custom-property';
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
export { CustomModelProperty };
declare namespace CustomModelProperty {
    interface Provider<Params extends PD.Params, Value> extends CustomProperty.Provider<Model, Params, Value> {
    }
    interface ProviderBuilder<Params extends PD.Params, Value> {
        readonly label: string;
        readonly descriptor: CustomPropertyDescriptor;
        readonly isHidden?: boolean;
        readonly defaultParams: Params;
        readonly getParams: (data: Model) => Params;
        readonly isApplicable: (data: Model) => boolean;
        readonly obtain: (ctx: CustomProperty.Context, data: Model, props: PD.Values<Params>) => Promise<CustomProperty.Data<Value>>;
        readonly type: 'static' | 'dynamic';
    }
    function createProvider<Params extends PD.Params, Value>(builder: ProviderBuilder<Params, Value>): CustomProperty.Provider<Model, Params, Value>;
    function createSimple<T>(name: string, type: 'static' | 'dynamic', defaultValue?: T): CustomProperty.Provider<Model, {
        value: PD.Value<T | undefined>;
    }, T | undefined>;
}
