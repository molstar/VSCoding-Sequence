/**
 * Copyright (c) 2018-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
/** A null value Location */
export const NullLocation = { kind: 'null-location' };
export function isNullLocation(x) {
    return !!x && x.kind === 'null-location';
}
export function DataLocation(tag, data, element) {
    return { kind: 'data-location', tag, data, element };
}
export function isDataLocation(x) {
    return !!x && x.kind === 'data-location';
}
