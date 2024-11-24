"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomElementProperty = void 0;
const structure_1 = require("../../mol-model/structure/structure");
const int_1 = require("../../mol-data/int");
const custom_model_property_1 = require("./custom-model-property");
const custom_property_1 = require("../../mol-model/custom-property");
var CustomElementProperty;
(function (CustomElementProperty) {
    function create(builder) {
        var _a;
        const modelProperty = createModelProperty(builder);
        return {
            propertyProvider: modelProperty,
            colorThemeProvider: ((_a = builder.coloring) === null || _a === void 0 ? void 0 : _a.getColor) && createColorThemeProvider(modelProperty, builder.coloring.getColor, builder.coloring.defaultColor),
            labelProvider: builder.getLabel && createLabelProvider(modelProperty, builder.getLabel)
        };
    }
    CustomElementProperty.create = create;
    function createModelProperty(builder) {
        return custom_model_property_1.CustomModelProperty.createProvider({
            label: builder.label,
            descriptor: (0, custom_property_1.CustomPropertyDescriptor)({
                name: builder.name,
            }),
            type: builder.type || 'dynamic',
            defaultParams: {},
            getParams: (data) => ({}),
            isApplicable: (data) => !builder.isApplicable || !!builder.isApplicable(data),
            obtain: async (ctx, data) => {
                return await builder.getData(data, ctx);
            }
        });
    }
    function createColorThemeProvider(modelProperty, getColor, defaultColor) {
        function Coloring(ctx, props) {
            let color;
            const property = ctx.structure && modelProperty.get(ctx.structure.models[0]);
            const contextHash = property === null || property === void 0 ? void 0 : property.version;
            if ((property === null || property === void 0 ? void 0 : property.value) && ctx.structure) {
                const data = property.value;
                color = (location) => {
                    if (structure_1.StructureElement.Location.is(location)) {
                        const e = data.get(location.element);
                        if (typeof e !== 'undefined')
                            return getColor(e);
                    }
                    return defaultColor;
                };
            }
            else {
                color = () => defaultColor;
            }
            return {
                factory: Coloring,
                granularity: 'group',
                color: color,
                props: props,
                contextHash,
                description: `Assign element colors based on '${modelProperty.label}' data.`
            };
        }
        return {
            name: modelProperty.descriptor.name,
            label: modelProperty.label,
            category: 'Custom',
            factory: Coloring,
            getParams: () => ({}),
            defaultValues: {},
            isApplicable: (ctx) => !!ctx.structure,
            ensureCustomProperties: {
                attach: (ctx, data) => data.structure ? modelProperty.attach(ctx, data.structure.models[0], void 0, true) : Promise.resolve(),
                detach: (data) => data.structure && data.structure.models[0].customProperties.reference(modelProperty.descriptor, false)
            }
        };
    }
    function createLabelProvider(modelProperty, getLabel) {
        return {
            label: (loci) => {
                if (loci.kind === 'element-loci') {
                    const e = loci.elements[0];
                    if (!e || !e.unit.model.customProperties.hasReference(modelProperty.descriptor))
                        return;
                    const data = modelProperty.get(e.unit.model).value;
                    const element = e.unit.elements[int_1.OrderedSet.start(e.indices)];
                    const value = data === null || data === void 0 ? void 0 : data.get(element);
                    if (value === undefined)
                        return;
                    return getLabel(value);
                }
                return;
            }
        };
    }
})(CustomElementProperty || (exports.CustomElementProperty = CustomElementProperty = {}));
