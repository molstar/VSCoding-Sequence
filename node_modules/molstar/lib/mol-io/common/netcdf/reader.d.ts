/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from https://github.com/cheminfo-js/netcdfjs
 * MIT License, Copyright (c) 2016 cheminfo
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { IOBuffer } from '../io-buffer';
export interface NetCDFRecordDimension {
    length: number;
    id?: number;
    name?: string;
    recordStep?: number;
}
export interface NetCDFVariable {
    name: string;
    dimensions: any[];
    attributes: any[];
    type: string;
    size: number;
    offset: number;
    record: boolean;
}
export interface NetCDFHeader {
    recordDimension: NetCDFRecordDimension;
    version: number;
    dimensions: {
        name: string;
        size: number;
    }[];
    globalAttributes: {
        name: string;
        type: string;
        value: string | number;
    }[];
    variables: NetCDFVariable[];
}
export interface NetCDFDimension {
    name: string;
    size: number;
}
/**
 * Reads a NetCDF v3.x file
 * https://www.unidata.ucar.edu/software/netcdf/docs/file_format_specifications.html
 */
export declare class NetcdfReader {
    header: Partial<NetCDFHeader>;
    buffer: IOBuffer;
    constructor(data: ArrayBuffer);
    /**
     * Version for the NetCDF format
     */
    get version(): "classic format" | "64-bit offset format";
    get recordDimension(): NetCDFRecordDimension | undefined;
    get dimensions(): {
        name: string;
        size: number;
    }[] | undefined;
    get globalAttributes(): {
        name: string;
        type: string;
        value: string | number;
    }[] | undefined;
    get variables(): NetCDFVariable[] | undefined;
    /**
     * Checks if a variable is available
     * @param {string|object} variableName - Name of the variable to check
     * @return {Boolean} - Variable existence
     */
    hasDataVariable(variableName: string): boolean | undefined;
    /**
     * Retrieves the data for a given variable
     * @param {string|object} variableName - Name of the variable to search or variable object
     * @return {Array} - List with the variable values
     */
    getDataVariable(variableName: string | NetCDFVariable): any[];
}
