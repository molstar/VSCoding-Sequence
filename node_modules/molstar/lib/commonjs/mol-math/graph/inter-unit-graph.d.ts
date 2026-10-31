/**
 * Copyright (c) 2017-2020 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
export { InterUnitGraph };
declare class InterUnitGraph<UnitId extends number, VertexIndex extends number, EdgeProps extends InterUnitGraph.EdgePropsBase = {}> {
    protected readonly map: Map<number, InterUnitGraph.UnitPairEdges<UnitId, VertexIndex, EdgeProps>[]>;
    /** Number of inter-unit edges */
    readonly edgeCount: number;
    /** Array of inter-unit edges */
    readonly edges: ReadonlyArray<InterUnitGraph.Edge<UnitId, VertexIndex, EdgeProps>>;
    private readonly edgeKeyIndex;
    private readonly vertexKeyIndex;
    /** Get an array of unit-pair-edges that are connected to the given unit */
    getConnectedUnits(unit: UnitId): ReadonlyArray<InterUnitGraph.UnitPairEdges<UnitId, VertexIndex, EdgeProps>>;
    /** Index into this.edges */
    getEdgeIndex(indexA: VertexIndex, unitA: UnitId, indexB: VertexIndex, unitB: UnitId): number;
    /** Check if edge exists */
    hasEdge(indexA: VertexIndex, unitA: UnitId, indexB: VertexIndex, unitB: UnitId): boolean;
    /** Get inter-unit edge given a pair of indices and units */
    getEdge(indexA: VertexIndex, unitA: UnitId, indexB: VertexIndex, unitB: UnitId): InterUnitGraph.Edge<UnitId, VertexIndex, EdgeProps> | undefined;
    /** Indices into this.edges */
    getEdgeIndices(index: VertexIndex, unit: UnitId): ReadonlyArray<number>;
    constructor(map: Map<number, InterUnitGraph.UnitPairEdges<UnitId, VertexIndex, EdgeProps>[]>);
}
declare namespace InterUnitGraph {
    class UnitPairEdges<UnitId extends number, VertexIndex extends number, EdgeProps extends EdgePropsBase = {}> {
        unitA: UnitId;
        unitB: UnitId;
        edgeCount: number;
        connectedIndices: ReadonlyArray<VertexIndex>;
        private edgeMap;
        hasEdges(indexA: VertexIndex): boolean;
        getEdges(indexA: VertexIndex): ReadonlyArray<EdgeInfo<VertexIndex, EdgeProps>>;
        get areUnitsOrdered(): boolean;
        constructor(unitA: UnitId, unitB: UnitId, edgeCount: number, connectedIndices: ReadonlyArray<VertexIndex>, edgeMap: Map<number, EdgeInfo<VertexIndex, EdgeProps>[]>);
    }
    type EdgePropsBase = {
        [name: string]: any;
    };
    interface EdgeInfo<VertexIndex extends number, EdgeProps extends EdgePropsBase = {}> {
        /** indexInto */
        readonly indexB: VertexIndex;
        readonly props: EdgeProps;
    }
    interface Edge<UnitId extends number, VertexIndex extends number, EdgeProps extends EdgePropsBase = {}> {
        readonly unitA: UnitId;
        readonly unitB: UnitId;
        readonly indexA: VertexIndex;
        readonly indexB: VertexIndex;
        readonly props: EdgeProps;
    }
    function getEdgeKey<UnitId extends number, VertexIndex extends number>(indexA: VertexIndex, unitA: UnitId, indexB: VertexIndex, unitB: UnitId): string;
    function getVertexKey<UnitId extends number, VertexIndex extends number>(index: VertexIndex, unit: UnitId): string;
    class Builder<UnitId extends number, VertexIndex extends number, EdgeProps extends InterUnitGraph.EdgePropsBase = {}> {
        private uA;
        private uB;
        private mapAB;
        private mapBA;
        private linkedA;
        private linkedB;
        private linkCount;
        private map;
        startUnitPair(unitA: UnitId, unitB: UnitId): void;
        finishUnitPair(): void;
        add(indexA: VertexIndex, indexB: VertexIndex, props: EdgeProps): void;
        getMap(): Map<number, InterUnitGraph.UnitPairEdges<UnitId, VertexIndex, EdgeProps>[]>;
    }
}
