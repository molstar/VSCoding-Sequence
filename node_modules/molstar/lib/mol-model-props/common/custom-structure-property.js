/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { ValueBox } from '../../mol-util';
import { CustomPropertyDescriptor } from '../../mol-model/custom-property';
import { stringToWords } from '../../mol-util/string';
export { CustomStructureProperty };
var CustomStructureProperty;
(function (CustomStructureProperty) {
    function createProvider(builder) {
        const descriptorName = builder.descriptor.name;
        const propertyDataName = builder.type === 'root' ? 'inheritedPropertyData' : 'currentPropertyData';
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
                    data.customPropertyDescriptors.reference(builder.descriptor, true);
                if (builder.type === 'root')
                    data = data.root;
                const rootProps = get(data.root).props;
                const property = get(data);
                const p = PD.merge(builder.defaultParams, rootProps, props);
                if (property.data.value && PD.areEqual(builder.defaultParams, property.props, p))
                    return;
                const { value, assets } = await builder.obtain(ctx, data, p);
                data.customPropertyDescriptors.add(builder.descriptor);
                data.customPropertyDescriptors.assets(builder.descriptor, assets);
                set(data, p, value);
            },
            ref: (data, add) => data.customPropertyDescriptors.reference(builder.descriptor, add),
            get: (data) => get(data).data,
            set: (data, props = {}, value) => {
                if (builder.type === 'root')
                    data = data.root;
                const property = get(data);
                const p = PD.merge(builder.defaultParams, property.props, props);
                if (!PD.areEqual(builder.defaultParams, property.props, p)) {
                    // this invalidates property.value
                    set(data, p, value);
                    // dispose of assets
                    data.customPropertyDescriptors.assets(builder.descriptor);
                }
            },
            props: (data) => get(data).props,
        };
    }
    CustomStructureProperty.createProvider = createProvider;
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
    CustomStructureProperty.createSimple = createSimple;
})(CustomStructureProperty || (CustomStructureProperty = {}));
