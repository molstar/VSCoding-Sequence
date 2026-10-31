/**
 * Copyright (c) 2019-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ValueBox } from '../../mol-util';
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
import { stringToWords } from '../../mol-util/string';
export { CustomModelProperty };
var CustomModelProperty;
(function (CustomModelProperty) {
    function createProvider(builder) {
        const descriptorName = builder.descriptor.name;
        const propertyDataName = builder.type === 'static' ? '_staticPropertyData' : '_dynamicPropertyData';
        const get = (data) => {
            if (!(descriptorName in data[propertyDataName])) {
                data[propertyDataName][descriptorName] = {
                    props: { ...PD.getDefaultValues(builder.getParams(data)) },
                    data: ValueBox.create(undefined)
                };
            }
            return data[propertyDataName][descriptorName];
        };
        const set = (data, props, value) => {
            const property = get(data);
            data[propertyDataName][descriptorName] = {
                props,
                data: ValueBox.withValue(property.data, value)
            };
        };
        return {
            label: builder.label,
            descriptor: builder.descriptor,
            isHidden: builder.isHidden,
            getParams: (data) => {
                const params = PD.clone(builder.getParams(data));
                PD.setDefaultValues(params, get(data).props);
                return params;
            },
            defaultParams: builder.defaultParams,
            isApplicable: builder.isApplicable,
            attach: async (ctx, data, props = {}, addRef) => {
                if (addRef)
                    data.customProperties.reference(builder.descriptor, true);
                const property = get(data);
                const p = PD.merge(builder.defaultParams, property.props, props);
                if (property.data.value && PD.areEqual(builder.defaultParams, property.props, p))
                    return;
                const { value, assets } = await builder.obtain(ctx, data, p);
                data.customProperties.add(builder.descriptor);
                data.customProperties.assets(builder.descriptor, assets);
                set(data, p, value);
            },
            ref: (data, add) => data.customProperties.reference(builder.descriptor, add),
            get: (data) => { var _a; return (_a = get(data)) === null || _a === void 0 ? void 0 : _a.data; },
            set: (data, props = {}, value) => {
                const property = get(data);
                const p = PD.merge(builder.defaultParams, property.props, props);
                if (!PD.areEqual(builder.defaultParams, property.props, p)) {
                    // this invalidates property.value
                    set(data, p, value);
                    // dispose of assets
                    data.customProperties.assets(builder.descriptor);
                }
            },
            props: (data) => get(data).props,
        };
    }
    CustomModelProperty.createProvider = createProvider;
    function createSimple(name, type, defaultValue) {
        const defaultParams = { value: PD.Value(defaultValue, { isHidden: true }) };
        return createProvider({
            label: stringToWords(name),
            descriptor: CustomPropertyDescriptor({ name }),
            isHidden: true,
            type,
            defaultParams,
            getParams: () => ({ value: PD.Value(defaultValue, { isHidden: true }) }),
            isApplicable: () => true,
            obtain: async (ctx, data, props) => {
                return { ...PD.getDefaultValues(defaultParams), ...props };
            }
        });
    }
    CustomModelProperty.createSimple = createSimple;
})(CustomModelProperty || (CustomModelProperty = {}));
