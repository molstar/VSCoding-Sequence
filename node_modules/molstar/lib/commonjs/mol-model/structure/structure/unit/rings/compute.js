"use strict";
/**
 * Copyright (c) 2018 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeRings = computeRings;
exports.getFingerprint = getFingerprint;
exports.createIndex = createIndex;
const int_1 = require("../../../../../mol-data/int");
const graph_1 = require("../../../../../mol-math/graph");
const types_1 = require("../../../model/types");
const util_1 = require("../../../../../mol-data/util");
const array_1 = require("../../../../../mol-util/array");
function computeRings(unit) {
    const size = largestResidue(unit);
    const state = State(unit, size);
    const residuesIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, unit.elements);
    while (residuesIt.hasNext) {
        const seg = residuesIt.move();
        processResidue(state, seg.start, seg.end);
    }
    return state.rings;
}
function State(unit, capacity) {
    return {
        startVertex: 0,
        endVertex: 0,
        count: 0,
        isRingAtom: new Int32Array(capacity),
        marked: new Int32Array(capacity),
        queue: new Int32Array(capacity),
        pred: new Int32Array(capacity),
        depth: new Int32Array(capacity),
        left: new Int32Array(5 /* Constants.MaxDepth */),
        right: new Int32Array(5 /* Constants.MaxDepth */),
        color: new Int32Array(capacity),
        currentColor: 0,
        currentAltLoc: '',
        hasAltLoc: false,
        rings: [],
        currentRings: [],
        unit,
        bonds: unit.bonds,
        altLoc: unit.model.atomicHierarchy.atoms.label_alt_id
    };
}
function resetState(state) {
    state.count = state.endVertex - state.startVertex;
    const { isRingAtom, pred, color, depth, marked } = state;
    for (let i = 0; i < state.count; i++) {
        isRingAtom[i] = 0;
        pred[i] = -1;
        marked[i] = -1;
        color[i] = 0;
        depth[i] = 0;
    }
    state.currentColor = 0;
    state.currentAltLoc = '';
    state.hasAltLoc = false;
}
function resetDepth(state) {
    const { depth } = state;
    for (let i = 0; i < state.count; i++) {
        depth[i] = state.count + 1;
    }
}
function largestResidue(unit) {
    const residuesIt = int_1.Segmentation.transientSegments(unit.model.atomicHierarchy.residueAtomSegments, unit.elements);
    let size = 0;
    while (residuesIt.hasNext) {
        const seg = residuesIt.move();
        size = Math.max(size, seg.end - seg.start);
    }
    return size;
}
function isStartIndex(state, i) {
    const bondOffset = state.bonds.offset;
    const a = state.startVertex + i;
    const bStart = bondOffset[a], bEnd = bondOffset[a + 1];
    const bondCount = bEnd - bStart;
    if (bondCount <= 1 || (state.isRingAtom[i] && bondCount === 2))
        return false;
    return true;
}
function processResidue(state, start, end) {
    state.startVertex = start;
    state.endVertex = end;
    // no two atom rings
    if (state.endVertex - state.startVertex < 3)
        return;
    state.currentRings = [];
    const { elements } = state.unit;
    const altLocs = [];
    for (let i = state.startVertex; i < state.endVertex; i++) {
        const altLoc = state.altLoc.value(elements[i]);
        (0, array_1.arraySetAdd)(altLocs, altLoc);
    }
    (0, array_1.arraySetRemove)(altLocs, '');
    let mark = 1;
    if (altLocs.length === 0) {
        resetState(state);
        for (let i = 0; i < state.count; i++) {
            if (!isStartIndex(state, i))
                continue;
            resetDepth(state);
            mark = findRings(state, i, mark);
        }
    }
    else {
        for (let aI = 0; aI < altLocs.length; aI++) {
            resetState(state);
            state.hasAltLoc = true;
            state.currentAltLoc = altLocs[aI];
            for (let i = 0; i < state.count; i++) {
                if (!isStartIndex(state, i))
                    continue;
                const altLoc = state.altLoc.value(elements[state.startVertex + i]);
                if (altLoc && altLoc !== state.currentAltLoc) {
                    continue;
                }
                resetDepth(state);
                mark = findRings(state, i, mark);
            }
        }
    }
    for (let i = 0, _i = state.currentRings.length; i < _i; i++) {
        state.rings.push(state.currentRings[i]);
    }
}
function addRing(state, a, b, isRingAtom) {
    // only "monotonous" rings
    if (b < a) {
        return false;
    }
    const { pred, color, left, right } = state;
    const nc = ++state.currentColor;
    let current = a;
    for (let t = 0; t < 5 /* Constants.MaxDepth */; t++) {
        color[current] = nc;
        current = pred[current];
        if (current < 0)
            break;
    }
    let leftOffset = 0, rightOffset = 0;
    let found = false, target = 0;
    current = b;
    for (let t = 0; t < 5 /* Constants.MaxDepth */; t++) {
        if (color[current] === nc) {
            target = current;
            found = true;
            break;
        }
        right[rightOffset++] = current;
        current = pred[current];
        if (current < 0)
            break;
    }
    if (!found) {
        return false;
    }
    current = a;
    for (let t = 0; t < 5 /* Constants.MaxDepth */; t++) {
        left[leftOffset++] = current;
        if (target === current)
            break;
        current = pred[current];
        if (current < 0)
            break;
    }
    const len = leftOffset + rightOffset;
    // rings must have at least three elements
    if (len < 3) {
        return false;
    }
    const ring = new Int32Array(len);
    let ringOffset = 0;
    for (let t = 0; t < leftOffset; t++) {
        ring[ringOffset++] = state.startVertex + left[t];
        isRingAtom[left[t]] = 1;
    }
    for (let t = rightOffset - 1; t >= 0; t--) {
        ring[ringOffset++] = state.startVertex + right[t];
        isRingAtom[right[t]] = 1;
    }
    (0, util_1.sortArray)(ring);
    // Check if the ring is unique and another one is not it's subset
    for (let rI = 0, _rI = state.currentRings.length; rI < _rI; rI++) {
        const r = state.currentRings[rI];
        if (ring.length === r.length) {
            if (int_1.SortedArray.areEqual(ring, r))
                return false;
        }
        else if (ring.length > r.length) {
            if (int_1.SortedArray.isSubset(ring, r))
                return false;
        }
    }
    state.currentRings.push(int_1.SortedArray.ofSortedArray(ring));
    return true;
}
function findRings(state, from, mark) {
    const { bonds, startVertex, endVertex, isRingAtom, marked, queue, pred, depth } = state;
    const { elements } = state.unit;
    const { b: neighbor, edgeProps: { flags: bondFlags }, offset } = bonds;
    marked[from] = mark;
    depth[from] = 0;
    queue[0] = from;
    let head = 0, size = 1;
    while (head < size) {
        const top = queue[head++];
        const d = depth[top];
        const a = startVertex + top;
        const start = offset[a], end = offset[a + 1];
        for (let i = start; i < end; i++) {
            const b = neighbor[i];
            if (b < startVertex || b >= endVertex || !types_1.BondType.isCovalent(bondFlags[i]))
                continue;
            if (state.hasAltLoc) {
                const altLoc = state.altLoc.value(elements[b]);
                if (altLoc && state.currentAltLoc !== altLoc) {
                    continue;
                }
            }
            const other = b - startVertex;
            if (marked[other] === mark) {
                if (pred[other] !== top && pred[top] !== other) {
                    if (addRing(state, top, other, isRingAtom)) {
                        return mark + 1;
                    }
                }
                continue;
            }
            const newDepth = Math.min(depth[other], d + 1);
            if (newDepth > 5 /* Constants.MaxDepth */)
                continue;
            depth[other] = newDepth;
            marked[other] = mark;
            queue[size++] = other;
            pred[other] = top;
        }
    }
    return mark + 1;
}
function getFingerprint(elements) {
    const len = elements.length;
    const reversed = new Array(len);
    for (let i = 0; i < len; i++)
        reversed[i] = elements[len - i - 1];
    const rotNormal = getMinimalRotation(elements);
    const rotReversed = getMinimalRotation(reversed);
    let isNormalSmaller = false;
    for (let i = 0; i < len; i++) {
        const u = elements[(i + rotNormal) % len], v = reversed[(i + rotReversed) % len];
        if (u !== v) {
            isNormalSmaller = u < v;
            break;
        }
    }
    if (isNormalSmaller)
        return buildFinderprint(elements, rotNormal);
    return buildFinderprint(reversed, rotReversed);
}
function getMinimalRotation(elements) {
    // adapted from http://en.wikipedia.org/wiki/Lexicographically_minimal_string_rotation
    const len = elements.length;
    const f = new Int32Array(len * 2);
    for (let i = 0; i < f.length; i++)
        f[i] = -1;
    let u = '', v = '', k = 0;
    for (let j = 1; j < f.length; j++) {
        let i = f[j - k - 1];
        while (i !== -1) {
            u = elements[j % len];
            v = elements[(k + i + 1) % len];
            if (u === v)
                break;
            if (u < v)
                k = j - i - 1;
            i = f[i];
        }
        if (i === -1) {
            u = elements[j % len];
            v = elements[(k + i + 1) % len];
            if (u !== v) {
                if (u < v)
                    k = j;
                f[j - k] = -1;
            }
            else
                f[j - k] = i + 1;
        }
        else
            f[j - k] = i + 1;
    }
    return k;
}
function buildFinderprint(elements, offset) {
    const len = elements.length;
    const ret = [];
    let i;
    for (i = 0; i < len - 1; i++) {
        ret.push(elements[(i + offset) % len]);
        ret.push('-');
    }
    ret.push(elements[(i + offset) % len]);
    return ret.join('');
}
function createIndex(rings, aromaticRings) {
    const elementRingIndices = new Map();
    const elementAromaticRingIndices = new Map();
    // for each ring atom, assign all rings that it is present in
    for (let rI = 0, _rI = rings.length; rI < _rI; rI++) {
        const r = rings[rI];
        for (let i = 0, _i = r.length; i < _i; i++) {
            const e = r[i];
            if (elementRingIndices.has(e))
                elementRingIndices.get(e).push(rI);
            else
                elementRingIndices.set(e, [rI]);
        }
    }
    // for each ring atom, assign all aromatic rings that it is present in
    for (let aI = 0, _aI = aromaticRings.length; aI < _aI; aI++) {
        const rI = aromaticRings[aI];
        const r = rings[rI];
        for (let i = 0, _i = r.length; i < _i; i++) {
            const e = r[i];
            if (elementAromaticRingIndices.has(e))
                elementAromaticRingIndices.get(e).push(rI);
            else
                elementAromaticRingIndices.set(e, [rI]);
        }
    }
    // create a graph where vertices are rings, edge if two rings share at least one atom
    const graph = new graph_1.IntAdjacencyGraph.UniqueEdgeBuilder(rings.length);
    for (let rI = 0, _rI = rings.length; rI < _rI; rI++) {
        const r = rings[rI];
        for (let i = 0, _i = r.length; i < _i; i++) {
            const e = r[i];
            const containedRings = elementRingIndices.get(e);
            if (containedRings.length === 1)
                continue;
            for (let j = 0, _j = containedRings.length; j < _j; j++) {
                const rJ = containedRings[j];
                if (rI >= rJ)
                    continue;
                graph.addEdge(rI, rJ);
            }
        }
    }
    const components = graph_1.IntAdjacencyGraph.connectedComponents(graph.getGraph());
    const ringComponentIndex = components.componentIndex;
    const ringComponents = [];
    for (let i = 0; i < components.componentCount; i++)
        ringComponents[i] = [];
    for (let rI = 0, _rI = rings.length; rI < _rI; rI++) {
        ringComponents[ringComponentIndex[rI]].push(rI);
    }
    return { elementRingIndices, elementAromaticRingIndices, ringComponentIndex, ringComponents };
}
