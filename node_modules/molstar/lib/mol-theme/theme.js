/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { ColorTheme } from './color';
import { SizeTheme } from './size';
import { ParamDefinition as PD } from '../mol-util/param-definition';
import { objectForEach } from '../mol-util/object';
export { Theme };
var Theme;
(function (Theme) {
    function create(ctx, data, props, theme) {
        theme = theme || createEmpty();
        const colorProps = props.colorTheme;
        const sizeProps = props.sizeTheme;
        theme.color = ctx.colorThemeRegistry.create(colorProps.name, data, colorProps.params);
        theme.size = ctx.sizeThemeRegistry.create(sizeProps.name, data, sizeProps.params);
        return theme;
    }
    Theme.create = create;
    function createEmpty() {
        return { color: ColorTheme.Empty, size: SizeTheme.Empty };
    }
    Theme.createEmpty = createEmpty;
    async function ensureDependencies(ctx, theme, data, props) {
        var _a, _b;
        await ((_a = theme.colorThemeRegistry.get(props.colorTheme.name).ensureCustomProperties) === null || _a === void 0 ? void 0 : _a.attach(ctx, data));
        await ((_b = theme.sizeThemeRegistry.get(props.sizeTheme.name).ensureCustomProperties) === null || _b === void 0 ? void 0 : _b.attach(ctx, data));
    }
    Theme.ensureDependencies = ensureDependencies;
    function releaseDependencies(theme, data, props) {
        var _a, _b;
        (_a = theme.colorThemeRegistry.get(props.colorTheme.name).ensureCustomProperties) === null || _a === void 0 ? void 0 : _a.detach(data);
        (_b = theme.sizeThemeRegistry.get(props.sizeTheme.name).ensureCustomProperties) === null || _b === void 0 ? void 0 : _b.detach(data);
    }
    Theme.releaseDependencies = releaseDependencies;
})(Theme || (Theme = {}));
function getTypes(list) {
    return list.map(e => [e.name, e.provider.label, e.provider.category]);
}
export class ThemeRegistry {
    get default() { return this._list[0]; }
    get list() { return this._list; }
    get types() { return getTypes(this._list); }
    constructor(builtInThemes, emptyProvider) {
        this.emptyProvider = emptyProvider;
        this._list = [];
        this._map = new Map();
        this._name = new Map();
        objectForEach(builtInThemes, (p, k) => {
            if (p.name !== k)
                throw new Error(`Fix build in themes to have matching names. ${p.name} ${k}`);
            this.add(p);
        });
    }
    sort() {
        this._list.sort((a, b) => {
            if (a.provider.category === b.provider.category) {
                return a.provider.label < b.provider.label ? -1 : a.provider.label > b.provider.label ? 1 : 0;
            }
            return a.provider.category < b.provider.category ? -1 : 1;
        });
    }
    add(provider) {
        if (this._map.has(provider.name)) {
            throw new Error(`${provider.name} already registered.`);
        }
        const name = provider.name;
        this._list.push({ name, provider });
        this._map.set(name, provider);
        this._name.set(provider, name);
        this.sort();
    }
    remove(provider) {
        this._list.splice(this._list.findIndex(e => e.name === provider.name), 1);
        const p = this._map.get(provider.name);
        if (p) {
            this._map.delete(provider.name);
            this._name.delete(p);
        }
    }
    has(provider) {
        return this._map.has(provider.name);
    }
    get(name) {
        return this._map.get(name) || this.emptyProvider;
    }
    getName(provider) {
        if (!this._name.has(provider))
            throw new Error(`'${provider.label}' is not a registered theme provider.`);
        return this._name.get(provider);
    }
    create(name, ctx, props = {}) {
        const provider = this.get(name);
        return provider.factory(ctx, { ...PD.getDefaultValues(provider.getParams(ctx)), ...props });
    }
    getApplicableList(ctx) {
        return this._list.filter(e => e.provider.isApplicable(ctx));
    }
    getApplicableTypes(ctx) {
        return getTypes(this.getApplicableList(ctx));
    }
    clear() {
        this._list.length = 0;
        this._map.clear();
        this._name.clear();
    }
}
