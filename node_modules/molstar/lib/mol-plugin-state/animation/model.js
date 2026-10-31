/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export { PluginStateAnimation };
var PluginStateAnimation;
(function (PluginStateAnimation) {
    function create(params) {
        return params;
    }
    PluginStateAnimation.create = create;
    function getDuration(ctx, instance) {
        var _a, _b;
        if (instance.customDurationMs)
            return instance.customDurationMs;
        const d = (_b = (_a = instance.definition).getDuration) === null || _b === void 0 ? void 0 : _b.call(_a, instance.params, ctx);
        if ((d === null || d === void 0 ? void 0 : d.kind) === 'fixed')
            return d.durationMs;
    }
    PluginStateAnimation.getDuration = getDuration;
})(PluginStateAnimation || (PluginStateAnimation = {}));
