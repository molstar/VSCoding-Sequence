"use strict";
/**
 * Copyright (c) 2020-22 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBehavior = useBehavior;
const tslib_1 = require("tslib");
const react_1 = tslib_1.__importDefault(require("react"));
const rxjs_1 = require("rxjs");
function useBehaviorLegacy(s) {
    const [, next] = react_1.default.useState({});
    const current = react_1.default.useRef();
    current.current = s === null || s === void 0 ? void 0 : s.value;
    react_1.default.useEffect(() => {
        if (!s) {
            return;
        }
        const sub = s.subscribe((v) => {
            if (current.current !== v)
                next({});
        });
        return () => sub.unsubscribe();
    }, [s]);
    return s === null || s === void 0 ? void 0 : s.value;
}
function useBehaviorReact18(s) {
    return react_1.default.useSyncExternalStore(react_1.default.useCallback((callback) => {
        const sub = s === null || s === void 0 ? void 0 : s.pipe((0, rxjs_1.skip)(1)).subscribe(callback);
        return () => sub === null || sub === void 0 ? void 0 : sub.unsubscribe();
    }, [s]), react_1.default.useCallback(() => s === null || s === void 0 ? void 0 : s.value, [s]));
}
const _useBehavior = !!react_1.default.useSyncExternalStore
    ? useBehaviorReact18
    : useBehaviorLegacy;
// eslint-disable-next-line
function useBehavior(s) {
    return _useBehavior(s);
}
