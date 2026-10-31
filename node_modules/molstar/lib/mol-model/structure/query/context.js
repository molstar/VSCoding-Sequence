/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { StructureElement } from '../structure';
import { now } from '../../../mol-util/now';
import { defaultBondTest } from './queries/internal';
export class QueryContext {
    pushCurrentElement() {
        this.currentElementStack[this.currentElementStack.length] = this.element;
        this.element = StructureElement.Location.create(void 0);
        return this.element;
    }
    popCurrentElement() {
        this.element = this.currentElementStack.pop();
    }
    pushCurrentBond() {
        if (this.atomicBond)
            this.currentAtomicBondStack.push(this.atomicBond);
        this.atomicBond = new QueryContextBondInfo();
        return this.atomicBond;
    }
    popCurrentBond() {
        if (this.currentAtomicBondStack.length > 0) {
            this.atomicBond = this.currentAtomicBondStack.pop();
        }
        else {
            this.atomicBond = void 0;
        }
    }
    pushCurrentStructure() {
        if (this.currentStructure)
            this.currentStructureStack.push(this.currentStructure);
    }
    popCurrentStructure() {
        if (this.currentStructureStack.length)
            this.currentStructure = this.currentStructureStack.pop();
        else
            this.currentStructure = void 0;
    }
    pushInputStructure(structure) {
        this.inputStructureStack.push(this.inputStructure);
        this.inputStructure = structure;
    }
    popInputStructure() {
        if (this.inputStructureStack.length === 0)
            throw new Error('Must push before pop.');
        this.inputStructure = this.inputStructureStack.pop();
    }
    throwIfTimedOut() {
        if (this.timeoutMs === 0)
            return;
        if (now() - this.timeCreated > this.timeoutMs) {
            throw new Error(`The query took too long to execute (> ${this.timeoutMs / 1000}s).`);
        }
    }
    tryGetCurrentSelection() {
        if (!this.currentSelection)
            throw new Error('The current selection is not assigned.');
        return this.currentSelection;
    }
    constructor(structure, options) {
        this.currentElementStack = [];
        this.currentAtomicBondStack = [];
        this.currentStructureStack = [];
        this.inputStructureStack = [];
        this.timeCreated = now();
        /** Current element */
        this.element = StructureElement.Location.create(void 0);
        this.currentStructure = void 0;
        /** Current bond between atoms */
        this.atomicBond = new QueryContextBondInfo();
        /** Supply this from the outside. Used by the internal.generator.current symbol */
        this.currentSelection = void 0;
        this.inputStructure = structure;
        this.timeoutMs = (options && options.timeoutMs) || 0;
        this.currentSelection = options && options.currentSelection;
    }
}
class QueryContextBondInfo {
    constructor() {
        this.a = StructureElement.Location.create(void 0);
        this.aIndex = 0;
        this.b = StructureElement.Location.create(void 0);
        this.bIndex = 0;
        this.type = 0 /* BondType.Flag.None */;
        this.order = 0;
        this.key = -1;
        this.testFn = defaultBondTest;
    }
    setStructure(s) {
        this.a.structure = s;
        this.b.structure = s;
    }
    setTestFn(fn) {
        this.testFn = fn || defaultBondTest;
    }
    test(ctx, trySwap) {
        if (this.testFn(ctx))
            return true;
        if (trySwap) {
            this.swap();
            return this.testFn(ctx);
        }
        return false;
    }
    swap() {
        // const sA = this.a.structure;
        // this.a.structure = this.b.structure;
        // this.b.structure = sA;
        const idxA = this.aIndex;
        this.aIndex = this.bIndex;
        this.bIndex = idxA;
        const unitA = this.a.unit;
        this.a.unit = this.b.unit;
        this.b.unit = unitA;
        const eA = this.a.element;
        this.a.element = this.b.element;
        this.b.element = eA;
    }
    get length() {
        return StructureElement.Location.distance(this.a, this.b);
    }
}
