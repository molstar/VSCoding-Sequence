/**
 * Copyright (c) 2022 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * Adapted from https://github.com/cheminfo-js/netcdfjs
 * MIT License, Copyright (c) 2016 cheminfo
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
import { IOBuffer } from '../io-buffer';
/**
 * Throws a non-valid NetCDF exception if the statement it's true
 */
function notNetcdf(statement, reason) {
    if (statement) {
        throw new TypeError('Not a valid NetCDF v3.x file: ' + reason);
    }
}
/**
 * Moves 1, 2, or 3 bytes to next 4-byte boundary
 */
function padding(buffer) {
    if ((buffer.offset % 4) !== 0) {
        buffer.skip(4 - (buffer.offset % 4));
    }
}
/**
 * Reads the name
 */
function readName(buffer) {
    // Read name
    const nameLength = buffer.readUint32();
    const name = buffer.readChars(nameLength);
    // validate name
    // TODO
    // Apply padding
    padding(buffer);
    return name;
}
const types = {
    BYTE: 1,
    CHAR: 2,
    SHORT: 3,
    INT: 4,
    FLOAT: 5,
    DOUBLE: 6
};
/**
 * Parse a number into their respective type
 */
function num2str(type) {
    switch (Number(type)) {
        case types.BYTE:
            return 'byte';
        case types.CHAR:
            return 'char';
        case types.SHORT:
            return 'short';
        case types.INT:
            return 'int';
        case types.FLOAT:
            return 'float';
        case types.DOUBLE:
            return 'double';
        default:
            return 'undefined';
    }
}
/**
 * Parse a number type identifier to his size in bytes
 */
function num2bytes(type) {
    switch (Number(type)) {
        case types.BYTE:
            return 1;
        case types.CHAR:
            return 1;
        case types.SHORT:
            return 2;
        case types.INT:
            return 4;
        case types.FLOAT:
            return 4;
        case types.DOUBLE:
            return 8;
        default:
            return -1;
    }
}
/**
 * Reverse search of num2str
 */
function str2num(type) {
    switch (String(type)) {
        case 'byte':
            return types.BYTE;
        case 'char':
            return types.CHAR;
        case 'short':
            return types.SHORT;
        case 'int':
            return types.INT;
        case 'float':
            return types.FLOAT;
        case 'double':
            return types.DOUBLE;
        default:
            return -1;
    }
}
/**
 * Auxiliary function to read numeric data
 */
function readNumber(size, bufferReader) {
    if (size !== 1) {
        const numbers = new Array(size);
        for (let i = 0; i < size; i++) {
            numbers[i] = bufferReader();
        }
        return numbers;
    }
    else {
        return bufferReader();
    }
}
/**
 * Given a type and a size reads the next element
 */
function readType(buffer, type, size) {
    switch (type) {
        case types.BYTE:
            return buffer.readBytes(size);
        case types.CHAR:
            return trimNull(buffer.readChars(size));
        case types.SHORT:
            return readNumber(size, buffer.readInt16.bind(buffer));
        case types.INT:
            return readNumber(size, buffer.readInt32.bind(buffer));
        case types.FLOAT:
            return readNumber(size, buffer.readFloat32.bind(buffer));
        case types.DOUBLE:
            return readNumber(size, buffer.readFloat64.bind(buffer));
        default:
            notNetcdf(true, 'non valid type ' + type);
            return undefined;
    }
}
/**
 * Removes null terminate value
 */
function trimNull(value) {
    if (value.charCodeAt(value.length - 1) === 0) {
        return value.substring(0, value.length - 1);
    }
    return value;
}
// const STREAMING = 4294967295;
/**
 * Read data for the given non-record variable
 */
function nonRecord(buffer, variable) {
    // variable type
    const type = str2num(variable.type);
    // size of the data
    const size = variable.size / num2bytes(type);
    // iterates over the data
    const data = new Array(size);
    for (let i = 0; i < size; i++) {
        data[i] = readType(buffer, type, 1);
    }
    return data;
}
/**
 * Read data for the given record variable
 */
function record(buffer, variable, recordDimension) {
    // variable type
    const type = str2num(variable.type);
    const width = variable.size ? variable.size / num2bytes(type) : 1;
    // size of the data
    // TODO streaming data
    const size = recordDimension.length;
    // iterates over the data
    const data = new Array(size);
    const step = recordDimension.recordStep;
    for (let i = 0; i < size; i++) {
        const currentOffset = buffer.offset;
        data[i] = readType(buffer, type, width);
        buffer.seek(currentOffset + step);
    }
    return data;
}
// Grammar constants
const ZERO = 0;
const NC_DIMENSION = 10;
const NC_VARIABLE = 11;
const NC_ATTRIBUTE = 12;
/**
 * Read the header of the file
 * Returns object with the fields:
 *  - `recordDimension`: Number with the length of record dimension
 *  - `dimensions`: List of dimensions
 *  - `globalAttributes`: List of global attributes
 *  - `variables`: List of variables
 */
function header(buffer, version) {
    // Length of record dimension
    // sum of the varSize's of all the record variables.
    const header = { recordDimension: { length: buffer.readUint32() } };
    // Version
    header.version = version;
    // List of dimensions
    const dimList = dimensionsList(buffer);
    header.recordDimension.id = dimList.recordId;
    header.recordDimension.name = dimList.recordName;
    header.dimensions = dimList.dimensions;
    // List of global attributes
    header.globalAttributes = attributesList(buffer);
    // List of variables
    const variables = variablesList(buffer, dimList.recordId, version);
    header.variables = variables.variables;
    header.recordDimension.recordStep = variables.recordStep;
    return header;
}
/**
 * List of dimensions
 */
function dimensionsList(buffer) {
    let dimensions, recordId, recordName;
    const dimList = buffer.readUint32();
    if (dimList === ZERO) {
        notNetcdf((buffer.readUint32() !== ZERO), 'wrong empty tag for list of dimensions');
        return [];
    }
    else {
        notNetcdf((dimList !== NC_DIMENSION), 'wrong tag for list of dimensions');
        // Length of dimensions
        const dimensionSize = buffer.readUint32();
        dimensions = new Array(dimensionSize);
        for (let dim = 0; dim < dimensionSize; dim++) {
            // Read name
            const name = readName(buffer);
            // Read dimension size
            const size = buffer.readUint32();
            if (size === 0) {
                recordId = dim;
                recordName = name;
            }
            dimensions[dim] = {
                name: name,
                size: size
            };
        }
        return {
            dimensions: dimensions,
            recordId: recordId,
            recordName: recordName
        };
    }
}
/**
 * List of attributes
 */
function attributesList(buffer) {
    let attributes;
    const gAttList = buffer.readUint32();
    if (gAttList === ZERO) {
        notNetcdf((buffer.readUint32() !== ZERO), 'wrong empty tag for list of attributes');
        return [];
    }
    else {
        notNetcdf((gAttList !== NC_ATTRIBUTE), 'wrong tag for list of attributes');
        // Length of attributes
        const attributeSize = buffer.readUint32();
        attributes = new Array(attributeSize);
        for (let gAtt = 0; gAtt < attributeSize; gAtt++) {
            // Read name
            const name = readName(buffer);
            // Read type
            const type = buffer.readUint32();
            notNetcdf(((type < 1) || (type > 6)), 'non valid type ' + type);
            // Read attribute
            const size = buffer.readUint32();
            const value = readType(buffer, type, size);
            // Apply padding
            padding(buffer);
            attributes[gAtt] = {
                name: name,
                type: num2str(type),
                value: value
            };
        }
    }
    return attributes;
}
/**
 * List of variables
 */
function variablesList(buffer, recordId, version) {
    const varList = buffer.readUint32();
    let recordStep = 0;
    let variables;
    if (varList === ZERO) {
        notNetcdf((buffer.readUint32() !== ZERO), 'wrong empty tag for list of variables');
        return [];
    }
    else {
        notNetcdf((varList !== NC_VARIABLE), 'wrong tag for list of variables');
        // Length of variables
        const variableSize = buffer.readUint32();
        variables = new Array(variableSize);
        for (let v = 0; v < variableSize; v++) {
            // Read name
            const name = readName(buffer);
            // Read dimensionality of the variable
            const dimensionality = buffer.readUint32();
            // Index into the list of dimensions
            const dimensionsIds = new Array(dimensionality);
            for (let dim = 0; dim < dimensionality; dim++) {
                dimensionsIds[dim] = buffer.readUint32();
            }
            // Read variables size
            const attributes = attributesList(buffer);
            // Read type
            const type = buffer.readUint32();
            notNetcdf(((type < 1) && (type > 6)), 'non valid type ' + type);
            // Read variable size
            // The 32-bit varSize field is not large enough to contain the
            // size of variables that require more than 2^32 - 4 bytes,
            // so 2^32 - 1 is used in the varSize field for such variables.
            const varSize = buffer.readUint32();
            // Read offset
            let offset = buffer.readUint32();
            if (version === 2) {
                notNetcdf((offset > 0), 'offsets larger than 4GB not supported');
                offset = buffer.readUint32();
            }
            // Count amount of record variables
            if (dimensionsIds[0] === recordId) {
                recordStep += varSize;
            }
            variables[v] = {
                name: name,
                dimensions: dimensionsIds,
                attributes: attributes,
                type: num2str(type),
                size: varSize,
                offset: offset,
                record: (dimensionsIds[0] === recordId)
            };
        }
    }
    return {
        variables: variables,
        recordStep: recordStep
    };
}
/**
 * Reads a NetCDF v3.x file
 * https://www.unidata.ucar.edu/software/netcdf/docs/file_format_specifications.html
 */
export class NetcdfReader {
    constructor(data) {
        const buffer = new IOBuffer(data);
        buffer.setBigEndian();
        // Validate that it's a NetCDF file
        notNetcdf((buffer.readChars(3) !== 'CDF'), 'should start with CDF');
        // Check the NetCDF format
        const version = buffer.readByte();
        notNetcdf((version > 2), 'unknown version');
        // Read the header
        this.header = header(buffer, version);
        this.buffer = buffer;
    }
    /**
     * Version for the NetCDF format
     */
    get version() {
        if (this.header.version === 1) {
            return 'classic format';
        }
        else {
            return '64-bit offset format';
        }
    }
    get recordDimension() {
        return this.header.recordDimension;
    }
    get dimensions() {
        return this.header.dimensions;
    }
    get globalAttributes() {
        return this.header.globalAttributes;
    }
    get variables() {
        return this.header.variables;
    }
    /**
     * Checks if a variable is available
     * @param {string|object} variableName - Name of the variable to check
     * @return {Boolean} - Variable existence
     */
    hasDataVariable(variableName) {
        return this.header.variables && this.header.variables.findIndex(val => val.name === variableName) !== -1;
    }
    /**
     * Retrieves the data for a given variable
     * @param {string|object} variableName - Name of the variable to search or variable object
     * @return {Array} - List with the variable values
     */
    getDataVariable(variableName) {
        var _a;
        let variable;
        if (typeof variableName === 'string') {
            // search the variable
            variable = (_a = this.header.variables) === null || _a === void 0 ? void 0 : _a.find((val) => val.name === variableName);
        }
        else {
            variable = variableName;
        }
        // throws if variable not found
        if (variable === undefined)
            throw new Error('variable not found');
        // go to the offset position
        this.buffer.seek(variable.offset);
        if (variable.record) {
            // record variable case
            return record(this.buffer, variable, this.header.recordDimension);
        }
        else {
            // non-record variable case
            return nonRecord(this.buffer, variable);
        }
    }
}
