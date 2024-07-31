/**
 * Copyright (c) 2018-2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Column, Database } from '../../mol-data/db';
import { CifFrame } from '../../mol-io/reader/cif';
export declare const Mesh_Data_Schema: {
    mesh: {
        id: Column.Schema.Int;
    };
    mesh_vertex: {
        mesh_id: Column.Schema.Int;
        vertex_id: Column.Schema.Int;
        x: Column.Schema.Float;
        y: Column.Schema.Float;
        z: Column.Schema.Float;
    };
    /** Table of triangles, 3 rows per triangle */
    mesh_triangle: {
        mesh_id: Column.Schema.Int;
        /** Indices of vertices within mesh */
        vertex_id: Column.Schema.Int;
    };
};
export type Mesh_Data_Schema = typeof Mesh_Data_Schema;
export interface Mesh_Data_Database extends Database<Mesh_Data_Schema> {
}
export declare const CIF_schema_mesh: (frame: CifFrame) => Mesh_Data_Database;
