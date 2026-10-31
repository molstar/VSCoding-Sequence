/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ParamDefinition as PD } from '../../mol-util/param-definition';
import { OrderedMap } from 'immutable';
export { CustomProperty };
var CustomProperty;
(function (CustomProperty) {
    class Registry {
        constructor() {
            this.providers = OrderedMap().asMutable();
            this.defaultAutoAttachValues = new Map();
        }
        /** Get params for all applicable property providers */
        getParams(data) {
            const propertiesParams = {};
            const autoAttachOptions = [];
            const autoAttachDefault = [];
            if (data) {
                const values = this.providers.values();
                while (true) {
                    const v = values.next();
                    if (v.done)
                        break;
                    const provider = v.value;
                    if (!provider.isApplicable(data))
                        continue;
                    if (!provider.isHidden) {
                        autoAttachOptions.push([provider.descriptor.name, provider.label]);
                        if (this.defaultAutoAttachValues.get(provider.descriptor.name)) {
                            autoAttachDefault.push(provider.descriptor.name);
                        }
                    }
                    propertiesParams[provider.descriptor.name] = PD.Group({
                        ...provider.getParams(data)
                    }, { label: provider.label, isHidden: provider.isHidden });
                }
            }
            return {
                autoAttach: PD.MultiSelect(autoAttachDefault, autoAttachOptions),
                properties: PD.Group(propertiesParams, { isFlat: true })
            };
        }
        setDefaultAutoAttach(name, value) {
            this.defaultAutoAttachValues.set(name, value);
        }
        get(name) {
            const prop = this.providers.get(name);
            if (!prop) {
                throw new Error(`Custom property '${name}' is not registered.`);
            }
            return this.providers.get(name);
        }
        register(provider, defaultAutoAttach) {
            this.providers.set(provider.descriptor.name, provider);
            this.defaultAutoAttachValues.set(provider.descriptor.name, defaultAutoAttach);
        }
        unregister(name) {
            this.providers.delete(name);
            this.defaultAutoAttachValues.delete(name);
        }
    }
    CustomProperty.Registry = Registry;
})(CustomProperty || (CustomProperty = {}));
