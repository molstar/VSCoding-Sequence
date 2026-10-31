/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { UUID } from '../mol-util';
export { CustomPropertyDescriptor, CustomProperties };
function CustomPropertyDescriptor(desc) {
    return desc;
}
(function (CustomPropertyDescriptor) {
    function getUUID(prop) {
        if (!prop.__key) {
            prop.__key = UUID.create22();
        }
        return prop.__key;
    }
    CustomPropertyDescriptor.getUUID = getUUID;
})(CustomPropertyDescriptor || (CustomPropertyDescriptor = {}));
class CustomProperties {
    constructor() {
        this._list = [];
        this._set = new Set();
        this._refs = new Map();
        this._assets = new Map();
    }
    get all() {
        return this._list;
    }
    add(desc) {
        if (this._set.has(desc))
            return;
        this._list.push(desc);
        this._set.add(desc);
    }
    reference(desc, add) {
        let refs = this._refs.get(desc) || 0;
        refs += add ? 1 : -1;
        this._refs.set(desc, Math.max(refs, 0));
    }
    hasReference(desc) {
        return (this._refs.get(desc) || 0) > 0;
    }
    has(desc) {
        return this._set.has(desc);
    }
    /** Sets assets for a prop, disposes of existing assets for that prop */
    assets(desc, assets) {
        const prevAssets = this._assets.get(desc);
        if (prevAssets) {
            for (const a of prevAssets)
                a.dispose();
        }
        if (assets)
            this._assets.set(desc, assets);
        else
            this._assets.delete(desc);
    }
    /** Disposes of all assets of all props */
    dispose() {
        this._assets.forEach(assets => {
            for (const a of assets)
                a.dispose();
        });
    }
}
