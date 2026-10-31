/**
 * Copyright (c) 2018-2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { SortedArray } from '../../mol-data/int';
import { AssignableArrayLike } from '../../mol-util/type-helpers';
/**
 * Represent a graph using vertex adjacency list.
 *
 * Edges of the i-th vertex are stored in the arrays a and b
 * for indices in the range [offset[i], offset[i+1]).
 *
 * Edge properties are indexed same as in the arrays a and b.
 */
export interface IntAdjacencyGraph<VertexIndex extends number, EdgeProps extends IntAdjacencyGraph.EdgePropsBase, Props = any> {
    readonly offset: ArrayLike<number>;
    readonly a: ArrayLike<VertexIndex>;
    readonly b: ArrayLike<VertexIndex>;
    readonly vertexCount: number;
    readonly edgeCount: number;
    readonly edgeProps: Readonly<EdgeProps>;
    readonly props?: Props;
    /**
     * Get the edge index between i-th and j-th vertex.
     * -1 if the edge does not exist.
     *
     * Because the a and b arrays contains each edge twice,
     * this always returns the smaller of the indices.
     *
     * `getEdgeIndex(i, j) === getEdgeIndex(j, i)`
     */
    getEdgeIndex(i: VertexIndex, j: VertexIndex): number;
    /**
     * Get the edge index between i-th and j-th vertex.
     * -1 if the edge does not exist.
     *
     * `getEdgeIndex(i, j) !== getEdgeIndex(j, i)`
     */
    getDirectedEdgeIndex(i: VertexIndex, j: VertexIndex): number;
    getVertexEdgeCount(i: VertexIndex): number;
}
export declare namespace IntAdjacencyGraph {
    type EdgePropsBase = {
        [name: string]: ArrayLike<any>;
    };
    function areEqual<VertexIndex extends number, EdgeProps extends IntAdjacencyGraph.EdgePropsBase>(a: IntAdjacencyGraph<VertexIndex, EdgeProps>, b: IntAdjacencyGraph<VertexIndex, EdgeProps>): boolean;
    function create<VertexIndex extends number, EdgeProps extends IntAdjacencyGraph.EdgePropsBase, Props>(offset: ArrayLike<number>, a: ArrayLike<VertexIndex>, b: ArrayLike<VertexIndex>, edgeCount: number, edgeProps?: EdgeProps, props?: Props): IntAdjacencyGraph<VertexIndex, EdgeProps, Props>;
    class EdgeBuilder<VertexIndex extends number> {
        vertexCount: number;
        xs: ArrayLike<VertexIndex>;
        ys: ArrayLike<VertexIndex>;
        private bucketFill;
        private current;
        private curA;
        private curB;
        offsets: Int32Array;
        edgeCount: number;
        /** the size of the A and B arrays */
        slotCount: number;
        a: AssignableArrayLike<VertexIndex>;
        b: AssignableArrayLike<VertexIndex>;
        createGraph<EdgeProps extends IntAdjacencyGraph.EdgePropsBase, Props>(edgeProps: EdgeProps, props?: Props): IntAdjacencyGraph<VertexIndex, EdgeProps, Props>;
        /**
         * @example
         *   const property = new Int32Array(builder.slotCount);
         *   for (let i = 0; i < builder.edgeCount; i++) {
         *     builder.addNextEdge();
         *     builder.assignProperty(property, srcProp[i]);
         *   }
         *   return builder.createGraph({ property });
         */
        addNextEdge(): void;
        /** Builds property-less graph */
        addAllEdges(): void;
        assignProperty<T>(prop: {
            [i: number]: T;
        }, value: T): void;
        assignDirectedProperty<T>(propA: {
            [i: number]: T;
        }, valueA: T, propB: {
            [i: number]: T;
        }, valueB: T): void;
        constructor(vertexCount: number, xs: ArrayLike<VertexIndex>, ys: ArrayLike<VertexIndex>);
    }
    class DirectedEdgeBuilder<VertexIndex extends number> {
        vertexCount: number;
        xs: ArrayLike<VertexIndex>;
        ys: ArrayLike<VertexIndex>;
        private bucketFill;
        private current;
        private curA;
        offsets: Int32Array;
        edgeCount: number;
        /** the size of the A and B arrays */
        slotCount: number;
        a: AssignableArrayLike<VertexIndex>;
        b: AssignableArrayLike<VertexIndex>;
        createGraph<EdgeProps extends IntAdjacencyGraph.EdgePropsBase, Props>(edgeProps: EdgeProps, props?: Props): IntAdjacencyGraph<VertexIndex, EdgeProps, Props>;
        /**
         * @example
         *   const property = new Int32Array(builder.slotCount);
         *   for (let i = 0; i < builder.edgeCount; i++) {
         *     builder.addNextEdge();
         *     builder.assignProperty(property, srcProp[i]);
         *   }
         *   return builder.createGraph({ property });
         */
        addNextEdge(): void;
        /** Builds property-less graph */
        addAllEdges(): void;
        assignProperty<T>(prop: {
            [i: number]: T;
        }, value: T): void;
        constructor(vertexCount: number, xs: ArrayLike<VertexIndex>, ys: ArrayLike<VertexIndex>);
    }
    class UniqueEdgeBuilder<VertexIndex extends number> {
        vertexCount: number;
        private xs;
        private ys;
        private included;
        addEdge(i: VertexIndex, j: VertexIndex): boolean;
        getGraph(): IntAdjacencyGraph<VertexIndex, {}>;
        getEdgeBuiler(): EdgeBuilder<VertexIndex>;
        constructor(vertexCount: number);
    }
    function fromVertexPairs<VertexIndex extends number>(vertexCount: number, xs: VertexIndex[], ys: VertexIndex[]): IntAdjacencyGraph<VertexIndex, {}, unknown>;
    function induceByVertices<VertexIndex extends number, EdgeProps extends IntAdjacencyGraph.EdgePropsBase, Props>(graph: IntAdjacencyGraph<VertexIndex, EdgeProps>, vertexIndices: ArrayLike<number>, props?: Props): IntAdjacencyGraph<VertexIndex, EdgeProps>;
    function connectedComponents(graph: IntAdjacencyGraph<any, any>): {
        componentCount: number;
        componentIndex: Int32Array;
    };
    /**
     * Check if any vertex in `verticesA` is connected to any vertex in `verticesB`
     * via at most `maxDistance` edges.
     *
     * Returns true if verticesA and verticesB are intersecting.
     */
    function areVertexSetsConnected(graph: IntAdjacencyGraph<any, any>, verticesA: SortedArray<number>, verticesB: SortedArray<number>, maxDistance: number): boolean;
}
