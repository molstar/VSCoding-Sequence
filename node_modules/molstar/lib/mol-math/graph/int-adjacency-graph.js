/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { arrayPickIndices, cantorPairing } from '../../mol-data/util';
import { LinkedIndex, SortedArray } from '../../mol-data/int';
export var IntAdjacencyGraph;
(function (IntAdjacencyGraph) {
    function areEqual(a, b) {
        if (a === b)
            return true;
        if (a.vertexCount !== b.vertexCount || a.edgeCount !== b.edgeCount)
            return false;
        const { a: aa, b: ab, offset: ao } = a;
        const { a: ba, b: bb, offset: bo } = b;
        for (let i = 0, _i = a.a.length; i < _i; i++) {
            if (aa[i] !== ba[i])
                return false;
        }
        for (let i = 0, _i = a.b.length; i < _i; i++) {
            if (ab[i] !== bb[i])
                return false;
        }
        for (let i = 0, _i = a.offset.length; i < _i; i++) {
            if (ao[i] !== bo[i])
                return false;
        }
        for (const k of Object.keys(a.edgeProps)) {
            const pa = a.edgeProps[k], pb = b.edgeProps[k];
            if (!pb)
                return false;
            for (let i = 0, _i = pa.length; i < _i; i++) {
                if (pa[i] !== pb[i])
                    return false;
            }
        }
        return true;
    }
    IntAdjacencyGraph.areEqual = areEqual;
    class IntGraphImpl {
        getEdgeIndex(i, j) {
            let a, b;
            if (i < j) {
                a = i;
                b = j;
            }
            else {
                a = j;
                b = i;
            }
            for (let t = this.offset[a], _t = this.offset[a + 1]; t < _t; t++) {
                if (this.b[t] === b)
                    return t;
            }
            return -1;
        }
        getDirectedEdgeIndex(i, j) {
            for (let t = this.offset[i], _t = this.offset[i + 1]; t < _t; t++) {
                if (this.b[t] === j)
                    return t;
            }
            return -1;
        }
        getVertexEdgeCount(i) {
            return this.offset[i + 1] - this.offset[i];
        }
        constructor(offset, a, b, edgeCount, edgeProps, props) {
            this.offset = offset;
            this.a = a;
            this.b = b;
            this.edgeCount = edgeCount;
            this.props = props;
            this.vertexCount = offset.length - 1;
            this.edgeProps = (edgeProps || {});
        }
    }
    function create(offset, a, b, edgeCount, edgeProps, props) {
        return new IntGraphImpl(offset, a, b, edgeCount, edgeProps, props);
    }
    IntAdjacencyGraph.create = create;
    class EdgeBuilder {
        createGraph(edgeProps, props) {
            return create(this.offsets, this.a, this.b, this.edgeCount, edgeProps, props);
        }
        /**
         * @example
         *   const property = new Int32Array(builder.slotCount);
         *   for (let i = 0; i < builder.edgeCount; i++) {
         *     builder.addNextEdge();
         *     builder.assignProperty(property, srcProp[i]);
         *   }
         *   return builder.createGraph({ property });
         */
        addNextEdge() {
            const a = this.xs[this.current], b = this.ys[this.current];
            const oa = this.offsets[a] + this.bucketFill[a];
            this.a[oa] = a;
            this.b[oa] = b;
            this.bucketFill[a]++;
            const ob = this.offsets[b] + this.bucketFill[b];
            this.a[ob] = b;
            this.b[ob] = a;
            this.bucketFill[b]++;
            this.current++;
            this.curA = oa;
            this.curB = ob;
        }
        /** Builds property-less graph */
        addAllEdges() {
            for (let i = 0; i < this.edgeCount; i++) {
                this.addNextEdge();
            }
        }
        assignProperty(prop, value) {
            prop[this.curA] = value;
            prop[this.curB] = value;
        }
        assignDirectedProperty(propA, valueA, propB, valueB) {
            propA[this.curA] = valueA;
            propA[this.curB] = valueB;
            propB[this.curB] = valueA;
            propB[this.curA] = valueB;
        }
        constructor(vertexCount, xs, ys) {
            this.vertexCount = vertexCount;
            this.xs = xs;
            this.ys = ys;
            this.current = 0;
            this.curA = 0;
            this.curB = 0;
            this.edgeCount = xs.length;
            this.offsets = new Int32Array(this.vertexCount + 1);
            this.bucketFill = new Int32Array(this.vertexCount);
            const bucketSizes = new Int32Array(this.vertexCount);
            for (let i = 0, _i = this.xs.length; i < _i; i++)
                bucketSizes[this.xs[i]]++;
            for (let i = 0, _i = this.ys.length; i < _i; i++)
                bucketSizes[this.ys[i]]++;
            let offset = 0;
            for (let i = 0; i < this.vertexCount; i++) {
                this.offsets[i] = offset;
                offset += bucketSizes[i];
            }
            this.offsets[this.vertexCount] = offset;
            this.slotCount = offset;
            this.a = new Int32Array(offset);
            this.b = new Int32Array(offset);
        }
    }
    IntAdjacencyGraph.EdgeBuilder = EdgeBuilder;
    class DirectedEdgeBuilder {
        createGraph(edgeProps, props) {
            return create(this.offsets, this.a, this.b, this.edgeCount, edgeProps, props);
        }
        /**
         * @example
         *   const property = new Int32Array(builder.slotCount);
         *   for (let i = 0; i < builder.edgeCount; i++) {
         *     builder.addNextEdge();
         *     builder.assignProperty(property, srcProp[i]);
         *   }
         *   return builder.createGraph({ property });
         */
        addNextEdge() {
            const a = this.xs[this.current], b = this.ys[this.current];
            const oa = this.offsets[a] + this.bucketFill[a];
            this.a[oa] = a;
            this.b[oa] = b;
            this.bucketFill[a]++;
            this.current++;
            this.curA = oa;
        }
        /** Builds property-less graph */
        addAllEdges() {
            for (let i = 0; i < this.edgeCount; i++) {
                this.addNextEdge();
            }
        }
        assignProperty(prop, value) {
            prop[this.curA] = value;
        }
        constructor(vertexCount, xs, ys) {
            this.vertexCount = vertexCount;
            this.xs = xs;
            this.ys = ys;
            this.current = 0;
            this.curA = 0;
            this.edgeCount = xs.length;
            this.offsets = new Int32Array(this.vertexCount + 1);
            this.bucketFill = new Int32Array(this.vertexCount);
            const bucketSizes = new Int32Array(this.vertexCount);
            for (let i = 0, _i = this.xs.length; i < _i; i++)
                bucketSizes[this.xs[i]]++;
            let offset = 0;
            for (let i = 0; i < this.vertexCount; i++) {
                this.offsets[i] = offset;
                offset += bucketSizes[i];
            }
            this.offsets[this.vertexCount] = offset;
            this.slotCount = offset;
            this.a = new Int32Array(offset);
            this.b = new Int32Array(offset);
        }
    }
    IntAdjacencyGraph.DirectedEdgeBuilder = DirectedEdgeBuilder;
    class UniqueEdgeBuilder {
        addEdge(i, j) {
            let u = i, v = j;
            if (i > j) {
                u = j;
                v = i;
            }
            const id = cantorPairing(u, v);
            if (this.included.has(id))
                return false;
            this.included.add(id);
            this.xs[this.xs.length] = u;
            this.ys[this.ys.length] = v;
            return true;
        }
        getGraph() {
            return fromVertexPairs(this.vertexCount, this.xs, this.ys);
        }
        // if we cant to add custom props as well
        getEdgeBuiler() {
            return new EdgeBuilder(this.vertexCount, this.xs, this.ys);
        }
        constructor(vertexCount) {
            this.vertexCount = vertexCount;
            this.xs = [];
            this.ys = [];
            this.included = new Set();
        }
    }
    IntAdjacencyGraph.UniqueEdgeBuilder = UniqueEdgeBuilder;
    function fromVertexPairs(vertexCount, xs, ys) {
        const graphBuilder = new IntAdjacencyGraph.EdgeBuilder(vertexCount, xs, ys);
        graphBuilder.addAllEdges();
        return graphBuilder.createGraph({});
    }
    IntAdjacencyGraph.fromVertexPairs = fromVertexPairs;
    function induceByVertices(graph, vertexIndices, props) {
        const { b, offset, vertexCount, edgeProps } = graph;
        const vertexMap = new Int32Array(vertexCount);
        for (let i = 0, _i = vertexIndices.length; i < _i; i++)
            vertexMap[vertexIndices[i]] = i + 1;
        let newEdgeCount = 0;
        for (let i = 0; i < vertexCount; i++) {
            if (vertexMap[i] === 0)
                continue;
            for (let j = offset[i], _j = offset[i + 1]; j < _j; j++) {
                if (b[j] > i && vertexMap[b[j]] !== 0)
                    newEdgeCount++;
            }
        }
        const newOffsets = new Int32Array(vertexIndices.length + 1);
        const edgeIndices = new Int32Array(2 * newEdgeCount);
        const newA = new Int32Array(2 * newEdgeCount);
        const newB = new Int32Array(2 * newEdgeCount);
        let eo = 0, vo = 0;
        for (let i = 0; i < vertexCount; i++) {
            if (vertexMap[i] === 0)
                continue;
            const aa = vertexMap[i] - 1;
            for (let j = offset[i], _j = offset[i + 1]; j < _j; j++) {
                const bb = vertexMap[b[j]];
                if (bb === 0)
                    continue;
                newA[eo] = aa;
                newB[eo] = bb - 1;
                edgeIndices[eo] = j;
                eo++;
            }
            newOffsets[++vo] = eo;
        }
        const newEdgeProps = {};
        for (const key of Object.keys(edgeProps)) {
            newEdgeProps[key] = arrayPickIndices(edgeProps[key], edgeIndices);
        }
        return create(newOffsets, newA, newB, newEdgeCount, newEdgeProps, props);
    }
    IntAdjacencyGraph.induceByVertices = induceByVertices;
    function connectedComponents(graph) {
        const vCount = graph.vertexCount;
        if (vCount === 0)
            return { componentCount: 0, componentIndex: new Int32Array(0) };
        if (graph.edgeCount === 0) {
            const componentIndex = new Int32Array(vCount);
            for (let i = 0, _i = vCount; i < _i; i++) {
                componentIndex[i] = i;
            }
            return { componentCount: vCount, componentIndex };
        }
        const componentIndex = new Int32Array(vCount);
        for (let i = 0, _i = vCount; i < _i; i++)
            componentIndex[i] = -1;
        let currentComponent = 0;
        componentIndex[0] = currentComponent;
        const { offset, b: neighbor } = graph;
        const stack = [0];
        const list = LinkedIndex(vCount);
        list.remove(0);
        while (stack.length > 0) {
            const v = stack.pop();
            const cIdx = componentIndex[v];
            for (let eI = offset[v], _eI = offset[v + 1]; eI < _eI; eI++) {
                const n = neighbor[eI];
                if (!list.has(n))
                    continue;
                list.remove(n);
                stack.push(n);
                componentIndex[n] = cIdx;
            }
            // check if we visited all vertices.
            // If not, create a new component and continue.
            if (stack.length === 0 && list.head >= 0) {
                stack.push(list.head);
                componentIndex[list.head] = ++currentComponent;
                list.remove(list.head);
            }
        }
        return { componentCount: vCount, componentIndex };
    }
    IntAdjacencyGraph.connectedComponents = connectedComponents;
    /**
     * Check if any vertex in `verticesA` is connected to any vertex in `verticesB`
     * via at most `maxDistance` edges.
     *
     * Returns true if verticesA and verticesB are intersecting.
     */
    function areVertexSetsConnected(graph, verticesA, verticesB, maxDistance) {
        // check if A and B are intersecting, this handles maxDistance = 0
        if (SortedArray.areIntersecting(verticesA, verticesB))
            return true;
        if (maxDistance < 1)
            return false;
        const visited = new Set();
        for (let i = 0, il = verticesA.length; i < il; ++i) {
            visited.add(verticesA[i]);
        }
        return areVertexSetsConnectedImpl(graph, verticesA, verticesB, maxDistance, visited);
    }
    IntAdjacencyGraph.areVertexSetsConnected = areVertexSetsConnected;
})(IntAdjacencyGraph || (IntAdjacencyGraph = {}));
function areVertexSetsConnectedImpl(graph, frontier, target, distance, visited) {
    const { b: neighbor, offset } = graph;
    const newFrontier = [];
    for (let i = 0, il = frontier.length; i < il; ++i) {
        const src = frontier[i];
        for (let j = offset[src], jl = offset[src + 1]; j < jl; ++j) {
            const other = neighbor[j];
            if (visited.has(other))
                continue;
            if (SortedArray.has(target, other))
                return true;
            visited.add(other);
            newFrontier[newFrontier.length] = other;
        }
    }
    return distance > 1 ? areVertexSetsConnectedImpl(graph, newFrontier, target, distance - 1, visited) : false;
}
