/**
 * Copyright (c) 2023 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
/** Default values for params in `MVSTree` */
export declare const MVSDefaults: {
    root: {};
    download: {};
    parse: {};
    structure: {
        block_header: null;
        block_index: number;
        model_index: number;
        assembly_id: null;
        radius: number;
        ijk_min: [number, number, number];
        ijk_max: [number, number, number];
    };
    component: {
        selector: "all";
    };
    component_from_uri: {
        block_header: null;
        block_index: number;
        category_name: null;
        field_name: string;
        field_values: null;
    };
    component_from_source: {
        block_header: null;
        block_index: number;
        category_name: null;
        field_name: string;
        field_values: null;
    };
    representation: {};
    color: {
        selector: "all";
    };
    color_from_uri: {
        block_header: null;
        block_index: number;
        category_name: null;
        field_name: string;
    };
    color_from_source: {
        block_header: null;
        block_index: number;
        category_name: null;
        field_name: string;
    };
    label: {};
    label_from_uri: {
        block_header: null;
        block_index: number;
        category_name: null;
        field_name: string;
    };
    label_from_source: {
        block_header: null;
        block_index: number;
        category_name: null;
        field_name: string;
    };
    tooltip: {};
    tooltip_from_uri: {
        block_header: null;
        block_index: number;
        category_name: null;
        field_name: string;
    };
    tooltip_from_source: {
        block_header: null;
        block_index: number;
        category_name: null;
        field_name: string;
    };
    focus: {
        direction: [number, number, number];
        up: [number, number, number];
    };
    transform: {
        rotation: number[];
        translation: [number, number, number];
    };
    canvas: {};
    camera: {
        up: [number, number, number];
    };
};
/** Color to be used e.g. for representations without 'color' node */
export declare const DefaultColor = "white";
