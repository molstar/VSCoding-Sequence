"use strict";
/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MVSData = void 0;
const tree_schema_1 = require("./tree/generic/tree-schema");
const tree_utils_1 = require("./tree/generic/tree-utils");
const mvs_builder_1 = require("./tree/mvs/mvs-builder");
const mvs_tree_1 = require("./tree/mvs/mvs-tree");
exports.MVSData = {
    /** Currently supported major version of MolViewSpec format (e.g. 1 for version '1.0.8') */
    SupportedVersion: 1,
    /** Parse MVSJ (MolViewSpec-JSON) format to `MVSData`. Does not include any validation. */
    fromMVSJ(mvsjString) {
        var _a, _b;
        const result = JSON.parse(mvsjString);
        const major = majorVersion((_a = result === null || result === void 0 ? void 0 : result.metadata) === null || _a === void 0 ? void 0 : _a.version);
        if (major === undefined) {
            console.error('Loaded MVS does not contain valid version info.');
        }
        else if (major > ((_b = majorVersion(exports.MVSData.SupportedVersion)) !== null && _b !== void 0 ? _b : 0)) {
            console.warn(`Loaded MVS is of higher version (${result.metadata.version}) than currently supported version (${exports.MVSData.SupportedVersion}). Some features may not work as expected.`);
        }
        return result;
    },
    /** Encode `MVSData` to MVSJ (MolViewSpec-JSON) string. Use `space` parameter to control formatting (as with `JSON.stringify`). */
    toMVSJ(mvsData, space) {
        return JSON.stringify(mvsData, undefined, space);
    },
    /** Validate `MVSData`. Return `true` if OK; `false` if not OK.
     * If `options.noExtra` is true, presence of any extra node parameters is treated as an issue. */
    isValid(mvsData, options = {}) {
        return exports.MVSData.validationIssues(mvsData, options) === undefined;
    },
    /** Validate `MVSData`. Return `undefined` if OK; list of issues if not OK.
     * If `options.noExtra` is true, presence of any extra node parameters is treated as an issue. */
    validationIssues(mvsData, options = {}) {
        var _a;
        const version = (_a = mvsData === null || mvsData === void 0 ? void 0 : mvsData.metadata) === null || _a === void 0 ? void 0 : _a.version;
        if (typeof version !== 'string')
            return [`"version" in MVS must be a string, not ${typeof version}: ${version}`];
        if (mvsData.root === undefined)
            return [`"root" missing in MVS`];
        return (0, tree_schema_1.treeValidationIssues)(mvs_tree_1.MVSTreeSchema, mvsData.root, options);
    },
    /** Return a human-friendly textual representation of `mvsData`. */
    toPrettyString(mvsData) {
        const title = mvsData.metadata.title !== undefined ? ` "${mvsData.metadata.title}"` : '';
        return `MolViewSpec tree${title} (version ${mvsData.metadata.version}, created ${mvsData.metadata.timestamp}):\n${(0, tree_utils_1.treeToString)(mvsData.root)}`;
    },
    /** Create a new MolViewSpec builder containing only a root node. Example of MVS builder usage:
     *
     * ```
     * const builder = MVSData.createBuilder();
     * builder.canvas({ background_color: 'white' });
     * const struct = builder.download({ url: 'https://www.ebi.ac.uk/pdbe/entry-files/download/1og2_updated.cif' }).parse({ format: 'mmcif' }).modelStructure();
     * struct.component().representation().color({ color: '#3050F8' });
     * console.log(MVSData.toPrettyString(builder.getState()));
     * ```
     */
    createBuilder() {
        return (0, mvs_builder_1.createMVSBuilder)();
    },
};
/** Get the major version from a semantic version string, e.g. '1.0.8' -> 1 */
function majorVersion(semanticVersion) {
    if (typeof semanticVersion === 'string')
        return parseInt(semanticVersion.split('.')[0]);
    if (typeof semanticVersion === 'number')
        return Math.floor(semanticVersion);
    console.error(`Version should be a string, not ${typeof semanticVersion}: ${semanticVersion}`);
    return undefined;
}
