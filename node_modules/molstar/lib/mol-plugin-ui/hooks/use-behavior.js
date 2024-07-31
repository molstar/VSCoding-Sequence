/**
 * Copyright (c) 2020-22 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import React from 'react';
import { skip } from 'rxjs';
function useBehaviorLegacy(s) {
    const [, next] = React.useState({});
    const current = React.useRef();
    current.current = s === null || s === void 0 ? void 0 : s.value;
    React.useEffect(() => {
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
    return React.useSyncExternalStore(React.useCallback((callback) => {
        const sub = s === null || s === void 0 ? void 0 : s.pipe(skip(1)).subscribe(callback);
        return () => sub === null || sub === void 0 ? void 0 : sub.unsubscribe();
    }, [s]), React.useCallback(() => s === null || s === void 0 ? void 0 : s.value, [s]));
}
const _useBehavior = !!React.useSyncExternalStore
    ? useBehaviorReact18
    : useBehaviorLegacy;
// eslint-disable-next-line
export function useBehavior(s) {
    return _useBehavior(s);
}
