"use strict";
/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = void 0;
var Progress;
(function (Progress) {
    function _format(root, prefix = '') {
        const p = root.progress;
        if (!root.children.length) {
            if (p.isIndeterminate)
                return `${prefix}${p.taskName}: ${p.message}`;
            return `${prefix}${p.taskName}: [${p.current}/${p.max}] ${p.message}`;
        }
        const newPrefix = prefix + '  |_ ';
        const subTree = root.children.map(c => _format(c, newPrefix));
        if (p.isIndeterminate)
            return `${prefix}${p.taskName}: ${p.message}\n${subTree.join('\n')}`;
        return `${prefix}${p.taskName}: [${p.current}/${p.max}] ${p.message}\n${subTree.join('\n')}`;
    }
    function format(p) { return _format(p.root); }
    Progress.format = format;
})(Progress || (exports.Progress = Progress = {}));
