"use strict";
/**
 * Copyright (c) 2019-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityBuilder = void 0;
const types_1 = require("../../../mol-model/structure/model/types");
const db_1 = require("../../../mol-data/db");
const schema_1 = require("../basic/schema");
class EntityBuilder {
    constructor() {
        this.count = 0;
        this.ids = [];
        this.types = [];
        this.descriptions = [];
        this.compoundsMap = new Map();
        this.namesMap = new Map();
        this.heteroMap = new Map();
        this.chainMap = new Map();
    }
    set(type, description) {
        this.count += 1;
        this.ids.push(`${this.count}`);
        this.types.push(type);
        this.descriptions.push([description]);
    }
    getEntityId(compId, moleculeType, chainId, options) {
        if (moleculeType === 2 /* MoleculeType.Water */) {
            if (this.waterId === undefined) {
                this.set('water', (options === null || options === void 0 ? void 0 : options.customName) || 'Water');
                this.waterId = `${this.count}`;
            }
            return this.waterId;
        }
        else if ((0, types_1.isPolymer)(moleculeType)) {
            if (this.compoundsMap.has(chainId)) {
                return this.compoundsMap.get(chainId);
            }
            else {
                if (!this.chainMap.has(chainId)) {
                    this.set('polymer', (options === null || options === void 0 ? void 0 : options.customName) || `Polymer ${this.chainMap.size + 1}`);
                    this.chainMap.set(chainId, `${this.count}`);
                }
                return this.chainMap.get(chainId);
            }
        }
        else {
            if (!this.heteroMap.has(compId)) {
                this.set('non-polymer', (options === null || options === void 0 ? void 0 : options.customName) || this.namesMap.get(compId) || compId);
                this.heteroMap.set(compId, `${this.count}`);
            }
            return this.heteroMap.get(compId);
        }
    }
    getEntityTable() {
        return db_1.Table.ofPartialColumns(schema_1.BasicSchema.entity, {
            id: db_1.Column.ofStringArray(this.ids),
            type: db_1.Column.ofStringAliasArray(this.types),
            pdbx_description: db_1.Column.ofStringListArray(this.descriptions),
        }, this.count);
    }
    setCompounds(compounds) {
        for (let i = 0, il = compounds.length; i < il; ++i) {
            const { chains, description } = compounds[i];
            this.set('polymer', description);
            for (let j = 0, jl = chains.length; j < jl; ++j) {
                this.compoundsMap.set(chains[j], `${this.count}`);
            }
        }
    }
    setNames(names) {
        names.forEach(n => this.namesMap.set(n[0], n[1]));
    }
}
exports.EntityBuilder = EntityBuilder;
