/**
 * Copyright (c) 2020-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */
class FormatRegistry {
    constructor() {
        this.map = new Map();
        this.applicable = new Map();
    }
    add(kind, obtain, applicable) {
        this.map.set(kind, obtain);
        if (applicable)
            this.applicable.set(kind, applicable);
    }
    remove(kind) {
        this.map.delete(kind);
        this.applicable.delete(kind);
    }
    get(kind) {
        return this.map.get(kind);
    }
    isApplicable(model) {
        if (!this.map.has(model.sourceData.kind))
            return false;
        const isApplicable = this.applicable.get(model.sourceData.kind);
        return isApplicable ? isApplicable(model) : true;
    }
}
export { FormatPropertyProvider };
var FormatPropertyProvider;
(function (FormatPropertyProvider) {
    function create(descriptor, options) {
        const { name } = descriptor;
        const formatRegistry = new FormatRegistry();
        return {
            descriptor,
            formatRegistry,
            isApplicable(model) {
                return formatRegistry.isApplicable(model);
            },
            get(model) {
                const store = (options === null || options === void 0 ? void 0 : options.asDynamic) ? model._dynamicPropertyData : model._staticPropertyData;
                if (store[name])
                    return store[name];
                if (model.customProperties.has(descriptor))
                    return;
                const obtain = formatRegistry.get(model.sourceData.kind);
                if (!obtain)
                    return;
                store[name] = obtain(model);
                model.customProperties.add(descriptor);
                return store[name];
            },
            set(model, value) {
                if (options === null || options === void 0 ? void 0 : options.asDynamic) {
                    model._dynamicPropertyData[name] = value;
                }
                else {
                    model._staticPropertyData[name] = value;
                }
            },
            delete(model) {
                if (options === null || options === void 0 ? void 0 : options.asDynamic) {
                    delete model._dynamicPropertyData[name];
                }
                else {
                    delete model._staticPropertyData[name];
                }
            }
        };
    }
    FormatPropertyProvider.create = create;
})(FormatPropertyProvider || (FormatPropertyProvider = {}));
