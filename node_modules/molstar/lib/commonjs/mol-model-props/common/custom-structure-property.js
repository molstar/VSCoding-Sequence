"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomStructureProperty = void 0;
const param_definition_1 = require("../../mol-util/param-definition");
const mol_util_1 = require("../../mol-util");
const custom_property_1 = require("../../mol-model/custom-property");
const string_1 = require("../../mol-util/string");
var CustomStructureProperty;
(function (CustomStructureProperty) {
    function createProvider(builder) {
        const descriptorName = builder.descriptor.name;
        const propertyDataName = builder.type === 'root' ? 'inheritedPropertyData' : 'currentPropertyData';
        const get = (data) => {
            if (!(descriptorName in data[propertyDataName])) {
                data[propertyDataName][descriptorName] = {
                    props: { ...param_definition_1.ParamDefinition.getDefaultValues(builder.getParams(data)) },
                    data: mol_util_1.ValueBox.create(undefined)
                };
            }
            return data[propertyDataName][descriptorName];
        };
        const set = (data, props, value) => {
            const property = get(data);
            data[propertyDataName][descriptorName] = {
                props,
                data: mol_util_1.ValueBox.withValue(property.data, value)
            };
        };
        return {
            label: builder.label,
            descriptor: builder.descriptor,
            isHidden: builder.isHidden,
            getParams: (data) => {
                const params = param_definition_1.ParamDefinition.clone(builder.getParams(data));
                param_definition_1.ParamDefinition.setDefaultValues(params, get(data).props);
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
                const p = param_definition_1.ParamDefinition.merge(builder.defaultParams, rootProps, props);
                if (property.data.value && param_definition_1.ParamDefinition.areEqual(builder.defaultParams, property.props, p))
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
                const p = param_definition_1.ParamDefinition.merge(builder.defaultParams, property.props, props);
                if (!param_definition_1.ParamDefinition.areEqual(builder.defaultParams, property.props, p)) {
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
        const defaultParams = { value: param_definition_1.ParamDefinition.Value(defaultValue, { isHidden: true }) };
        return createProvider({
            label: (0, string_1.stringToWords)(name),
            descriptor: (0, custom_property_1.CustomPropertyDescriptor)({ name }),
            isHidden: true,
            type,
            defaultParams,
            getParams: () => ({ value: param_definition_1.ParamDefinition.Value(defaultValue, { isHidden: true }) }),
            isApplicable: () => true,
            obtain: async (ctx, data, props) => {
                return { ...param_definition_1.ParamDefinition.getDefaultValues(defaultParams), ...props };
            }
        });
    }
    CustomStructureProperty.createSimple = createSimple;
})(CustomStructureProperty || (exports.CustomStructureProperty = CustomStructureProperty = {}));
