/**
 * Copyright (c) 2023-2024 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Adam Midlik <midlik@gmail.com>
 */
import { Column } from '../../../mol-data/db';
import { CIF, CifBlock, CifFile } from '../../../mol-io/reader/cif';
import { toTable } from '../../../mol-io/reader/cif/schema';
import { MmcifFormat } from '../../../mol-model-formats/structure/mmcif';
import { CustomModelProperty } from '../../../mol-model-props/common/custom-model-property';
import { CustomPropertyDescriptor } from '../../../mol-model/custom-property';
import { arrayExtend } from '../../../mol-util/array';
import { Asset } from '../../../mol-util/assets';
import { canonicalJsonString } from '../../../mol-util/json';
import { pickObjectKeys, promiseAllObj } from '../../../mol-util/object';
import { Choice } from '../../../mol-util/param-choice';
import { ParamDefinition as PD } from '../../../mol-util/param-definition';
import { AtomRanges } from '../helpers/atom-ranges';
import { IndicesAndSortings } from '../helpers/indexing';
import { MaybeStringParamDefinition } from '../helpers/param-definition';
import { MVSAnnotationSchema, getCifAnnotationSchema } from '../helpers/schemas';
import { atomQualifies, getAtomRangesForRow } from '../helpers/selections';
import { safePromise } from '../helpers/utils';
/** Allowed values for the annotation format parameter */
const MVSAnnotationFormat = new Choice({ json: 'json', cif: 'cif', bcif: 'bcif' }, 'json');
const MVSAnnotationFormatTypes = { json: 'string', cif: 'string', bcif: 'binary' };
export const MVSAnnotationsParams = {
    annotations: PD.ObjectList({
        source: PD.MappedStatic('source-cif', {
            'source-cif': PD.EmptyGroup(),
            'url': PD.Group({
                url: PD.Text(''),
                format: MVSAnnotationFormat.PDSelect(),
            }),
        }),
        schema: MVSAnnotationSchema.PDSelect(),
        cifBlock: PD.MappedStatic('index', {
            index: PD.Group({ index: PD.Numeric(0, { min: 0, step: 1 }, { description: '0-based index of the block' }) }),
            header: PD.Group({ header: PD.Text(undefined, { description: 'Block header' }) }),
        }, { description: 'Specify which CIF block contains annotation data (only relevant when format=cif or format=bcif)' }),
        cifCategory: MaybeStringParamDefinition(undefined, { description: 'Specify which CIF category contains annotation data (only relevant when format=cif or format=bcif)' }),
        id: PD.Text('', { description: 'Arbitrary identifier that can be referenced by MVSAnnotationColorTheme' }),
    }, obj => obj.id),
};
/** Provider for custom model property "Annotations" */
export const MVSAnnotationsProvider = CustomModelProperty.createProvider({
    label: 'MVS Annotations',
    descriptor: CustomPropertyDescriptor({
        name: 'mvs-annotations',
    }),
    type: 'static',
    defaultParams: MVSAnnotationsParams,
    getParams: (data) => MVSAnnotationsParams,
    isApplicable: (data) => true,
    obtain: async (ctx, data, props) => {
        var _a;
        props = { ...PD.getDefaultValues(MVSAnnotationsParams), ...props };
        const specs = (_a = props.annotations) !== null && _a !== void 0 ? _a : [];
        const annots = await MVSAnnotations.fromSpecs(ctx, specs, data);
        return { value: annots };
    }
});
/** Represents multiple annotations retrievable by their ID */
export class MVSAnnotations {
    constructor(dict) {
        this.dict = dict;
    }
    static async fromSpecs(ctx, specs, model) {
        const sources = specs.map(annotationSourceFromSpec);
        const files = await getFilesFromSources(ctx, sources, model);
        const annots = {};
        for (let i = 0; i < specs.length; i++) {
            const spec = specs[i];
            try {
                const file = files[i];
                if (!file.ok)
                    throw file.error;
                annots[spec.id] = await MVSAnnotation.fromSpec(ctx, spec, file.value);
            }
            catch (err) {
                console.error(`Failed to obtain annotation (${err}).\nAnnotation specification:`, spec);
                annots[spec.id] = MVSAnnotation.createEmpty(spec.schema);
            }
        }
        return new MVSAnnotations(annots);
    }
    getAnnotation(id) {
        return this.dict[id];
    }
    getAllAnnotations() {
        return Object.values(this.dict);
    }
}
/** Retrieve annotation with given `annotationId` from custom model property "MVS Annotations" and the model from which it comes */
export function getMVSAnnotationForStructure(structure, annotationId) {
    const models = structure.isEmpty ? [] : structure.models;
    for (const model of models) {
        if (model.customProperties.has(MVSAnnotationsProvider.descriptor)) {
            const annots = MVSAnnotationsProvider.get(model).value;
            const annotation = annots === null || annots === void 0 ? void 0 : annots.getAnnotation(annotationId);
            if (annotation) {
                return { annotation, model };
            }
        }
    }
    return { annotation: undefined, model: undefined };
}
/** Main class for processing MVS annotation */
export class MVSAnnotation {
    constructor(data, schema) {
        this.data = data;
        this.schema = schema;
        /** Store mapping `ElementIndex` -> annotation row index for each `Model`, -1 means no row applies */
        this.indexedModels = new Map();
        this.rows = undefined;
    }
    /** Create a new `MVSAnnotation` based on specification `spec`. Use `file` if provided, otherwise download the file.
     * Throw error if download fails or problem with data. */
    static async fromSpec(ctx, spec, file) {
        var _a;
        file !== null && file !== void 0 ? file : (file = await getFileFromSource(ctx, annotationSourceFromSpec(spec)));
        let data;
        switch (file.format) {
            case 'json':
                data = file;
                break;
            case 'cif':
                if (file.data.blocks.length === 0)
                    throw new Error('No block in CIF');
                const blockSpec = spec.cifBlock;
                let block;
                switch (blockSpec.name) {
                    case 'header':
                        const foundBlock = file.data.blocks.find(b => b.header === blockSpec.params.header);
                        if (!foundBlock)
                            throw new Error(`CIF block with header ${blockSpec.params.header} not found`);
                        block = foundBlock;
                        break;
                    case 'index':
                        block = file.data.blocks[blockSpec.params.index];
                        if (!block)
                            throw new Error(`CIF block with index ${blockSpec.params.index} not found`);
                        break;
                }
                const categoryName = (_a = spec.cifCategory) !== null && _a !== void 0 ? _a : Object.keys(block.categories)[0];
                if (!categoryName)
                    throw new Error('There are no categories in CIF block');
                const category = block.categories[categoryName];
                if (!category)
                    throw new Error(`CIF category ${categoryName} not found`);
                data = { format: 'cif', data: category };
                break;
        }
        return new MVSAnnotation(data, spec.schema);
    }
    static createEmpty(schema) {
        return new MVSAnnotation({ format: 'json', data: [] }, schema);
    }
    /** Reference implementation of `getAnnotationForLocation`, just for checking, DO NOT USE DIRECTLY */
    getAnnotationForLocation_Reference(loc) {
        const model = loc.unit.model;
        const iAtom = loc.element;
        let result = undefined;
        for (const row of this.getRows()) {
            if (atomQualifies(model, iAtom, row))
                result = row;
        }
        return result;
    }
    /** Return value of field `fieldName` assigned to location `loc`, if any */
    getValueForLocation(loc, fieldName) {
        const indexedModel = this.getIndexedModel(loc.unit.model);
        const iRow = indexedModel[loc.element];
        return this.getValueForRow(iRow, fieldName);
    }
    /** Return value of field `fieldName` assigned to `i`-th annotation row, if any */
    getValueForRow(i, fieldName) {
        if (i < 0)
            return undefined;
        switch (this.data.format) {
            case 'json':
                const value = getValueFromJson(i, fieldName, this.data.data);
                if (value === undefined || typeof value === 'string')
                    return value;
                else
                    return `${value}`;
            case 'cif':
                return getValueFromCif(i, fieldName, this.data.data);
        }
    }
    /** Return cached `ElementIndex` -> `MVSAnnotationRow` mapping for `Model` (or create it if not cached yet) */
    getIndexedModel(model) {
        const key = model.id;
        if (!this.indexedModels.has(key)) {
            const result = this.getRowForEachAtom(model);
            this.indexedModels.set(key, result);
        }
        return this.indexedModels.get(key);
    }
    /** Create `ElementIndex` -> `MVSAnnotationRow` mapping for `Model` */
    getRowForEachAtom(model) {
        const indices = IndicesAndSortings.get(model);
        const nAtoms = model.atomicHierarchy.atoms._rowCount;
        const result = Array(nAtoms).fill(-1);
        const rows = this.getRows();
        for (let i = 0, nRows = rows.length; i < nRows; i++) {
            const atomRanges = getAtomRangesForRow(model, rows[i], indices);
            AtomRanges.foreach(atomRanges, (from, to) => result.fill(i, from, to));
        }
        return result;
    }
    /** Parse and return all annotation rows in this annotation */
    _getRows() {
        switch (this.data.format) {
            case 'json':
                return getRowsFromJson(this.data.data, this.schema);
            case 'cif':
                return getRowsFromCif(this.data.data, this.schema);
        }
    }
    /** Parse and return all annotation rows in this annotation, or return cached result if available */
    getRows() {
        var _a;
        return (_a = this.rows) !== null && _a !== void 0 ? _a : (this.rows = this._getRows());
    }
}
function getValueFromJson(rowIndex, fieldName, data) {
    var _a, _b;
    const js = data;
    if (Array.isArray(js)) {
        const row = (_a = js[rowIndex]) !== null && _a !== void 0 ? _a : {};
        return row[fieldName];
    }
    else {
        const column = (_b = js[fieldName]) !== null && _b !== void 0 ? _b : [];
        return column[rowIndex];
    }
}
function getValueFromCif(rowIndex, fieldName, data) {
    const column = data.getField(fieldName);
    if (!column)
        return undefined;
    if (column.valueKind(rowIndex) !== Column.ValueKind.Present)
        return undefined;
    return column.str(rowIndex);
}
function getRowsFromJson(data, schema) {
    const js = data;
    const cifSchema = getCifAnnotationSchema(schema);
    if (Array.isArray(js)) {
        // array of objects
        return js.map(row => pickObjectKeys(row, Object.keys(cifSchema)));
    }
    else {
        // object of arrays
        const rows = [];
        const keys = Object.keys(js).filter(key => Object.hasOwn(cifSchema, key));
        if (keys.length > 0) {
            const n = js[keys[0]].length;
            if (keys.some(key => js[key].length !== n))
                throw new Error('FormatError: arrays must have the same length.');
            for (let i = 0; i < n; i++) {
                const item = {};
                for (const key of keys) {
                    item[key] = js[key][i];
                }
                rows.push(item);
            }
        }
        return rows;
    }
}
function getRowsFromCif(data, schema) {
    const rows = [];
    const cifSchema = getCifAnnotationSchema(schema);
    const table = toTable(cifSchema, data);
    arrayExtend(rows, getRowsFromTable(table)); // Avoiding Table.getRows(table) as it replaces . and ? fields by 0 or ''
    return rows;
}
/** Same as `Table.getRows` but omits `.` and `?` fields (instead of using type defaults) */
function getRowsFromTable(table) {
    const rows = [];
    const columns = table._columns;
    const nRows = table._rowCount;
    const Present = Column.ValueKind.Present;
    for (let iRow = 0; iRow < nRows; iRow++) {
        const row = {};
        for (const col of columns) {
            if (table[col].valueKind(iRow) === Present) {
                row[col] = table[col].value(iRow);
            }
        }
        rows[iRow] = row;
    }
    return rows;
}
async function getFileFromSource(ctx, source, model) {
    switch (source.kind) {
        case 'source-cif':
            return { format: 'cif', data: getSourceFileFromModel(model) };
        case 'url':
            const url = Asset.getUrlAsset(ctx.assetManager, source.url);
            const dataType = MVSAnnotationFormatTypes[source.format];
            const dataWrapper = await ctx.assetManager.resolve(url, dataType).runInContext(ctx.runtime);
            const rawData = dataWrapper.data;
            if (!rawData)
                throw new Error('Missing data');
            switch (source.format) {
                case 'json':
                    const json = JSON.parse(rawData);
                    return { format: 'json', data: json };
                case 'cif':
                case 'bcif':
                    const parsed = await CIF.parse(rawData).run();
                    if (parsed.isError)
                        throw new Error(`Failed to parse ${source.format}`);
                    return { format: 'cif', data: parsed.result };
            }
    }
}
/** Like `sources.map(s => safePromise(getFileFromSource(ctx, s)))`
 * but downloads a repeating source only once. */
async function getFilesFromSources(ctx, sources, model) {
    var _a;
    const promises = {};
    for (const src of sources) {
        const key = canonicalJsonString(src);
        (_a = promises[key]) !== null && _a !== void 0 ? _a : (promises[key] = safePromise(getFileFromSource(ctx, src, model)));
    }
    const files = await promiseAllObj(promises);
    return sources.map(src => files[canonicalJsonString(src)]);
}
function getSourceFileFromModel(model) {
    if (model && MmcifFormat.is(model.sourceData)) {
        if (model.sourceData.data.file) {
            return model.sourceData.data.file;
        }
        else {
            const frame = model.sourceData.data.frame;
            const block = CifBlock(Array.from(frame.categoryNames), frame.categories, frame.header);
            const file = CifFile([block]);
            return file;
        }
    }
    else {
        console.warn('Could not get CifFile from Model, returning empty CifFile');
        return CifFile([]);
    }
}
function annotationSourceFromSpec(s) {
    switch (s.source.name) {
        case 'url':
            return { kind: 'url', ...s.source.params };
        case 'source-cif':
            return { kind: 'source-cif' };
    }
}
