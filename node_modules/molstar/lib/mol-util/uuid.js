/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
import { now } from '../mol-util/now';
var UUID;
(function (UUID) {
    const _btoa = typeof btoa !== 'undefined' ? btoa : (s) => Buffer.from(s).toString('base64');
    const chars = [];
    /** Creates a 22 characters 'base64' encoded UUID */
    function create22() {
        let d = (+new Date()) + now();
        for (let i = 0; i < 16; i++) {
            chars[i] = String.fromCharCode((d + Math.random() * 0xff) % 0xff | 0);
            d = Math.floor(d / 0xff);
        }
        return _btoa(chars.join('')).replace(/\+/g, '-').replace(/\//g, '_').substr(0, 22);
    }
    UUID.create22 = create22;
    function createv4() {
        let d = (+new Date()) + now();
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    UUID.createv4 = createv4;
    function is(x) {
        return typeof x === 'string';
    }
    UUID.is = is;
})(UUID || (UUID = {}));
export { UUID };
