"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitySourceColorThemeProvider = exports.EntitySourceColorThemeParams = void 0;
exports.getEntitySourceColorThemeParams = getEntitySourceColorThemeParams;
exports.EntitySourceColorTheme = EntitySourceColorTheme;
const structure_1 = require("../../mol-model/structure");
const color_1 = require("../../mol-util/color");
const param_definition_1 = require("../../mol-util/param-definition");
const palette_1 = require("../../mol-util/color/palette");
const number_1 = require("../../mol-util/number");
const lists_1 = require("../../mol-util/color/lists");
const mmcif_1 = require("../../mol-model-formats/structure/mmcif");
const categories_1 = require("./categories");
const DefaultList = 'dark-2';
const DefaultColor = (0, color_1.Color)(0xFAFAFA);
const Description = 'Gives ranges of a polymer chain a color based on the entity source it originates from (e.g. gene, plasmid, organism).';
exports.EntitySourceColorThemeParams = {
    ...(0, palette_1.getPaletteParams)({ type: 'colors', colorList: DefaultList }),
};
function getEntitySourceColorThemeParams(ctx) {
    const params = param_definition_1.ParamDefinition.clone(exports.EntitySourceColorThemeParams);
    if (ctx.structure) {
        if (getMaps(ctx.structure.root.models).srcKeySerialMap.size > lists_1.ColorLists[DefaultList].list.length) {
            params.palette.defaultValue.name = 'colors';
            params.palette.defaultValue.params = {
                ...params.palette.defaultValue.params,
                list: { kind: 'interpolate', colors: (0, lists_1.getColorListFromName)(DefaultList).list }
            };
        }
    }
    return params;
}
function modelEntityKey(modelIndex, entityId) {
    return `${modelIndex}|${entityId}`;
}
function srcKey(modelIndex, entityId, organism, srcId, plasmid, gene) {
    return `${modelIndex}|${entityId}|${organism}|${gene ? gene : (plasmid ? plasmid : srcId)}`;
}
function addSrc(seqToSrcByModelEntity, srcKeySerialMap, modelIndex, model, entity_src, scientific_name, plasmid_name, gene_src_gene) {
    const { entity_id, pdbx_src_id, pdbx_beg_seq_num, pdbx_end_seq_num } = entity_src;
    for (let j = 0, jl = entity_src._rowCount; j < jl; ++j) {
        const entityId = entity_id.value(j);
        const mK = modelEntityKey(modelIndex, entityId);
        let seqToSrc;
        if (!seqToSrcByModelEntity.has(mK)) {
            const entityIndex = model.entities.getEntityIndex(entityId);
            const seq = model.sequence.sequences[entityIndex].sequence;
            seqToSrc = new Int16Array(seq.length);
            seqToSrcByModelEntity.set(mK, seqToSrc);
        }
        else {
            seqToSrc = seqToSrcByModelEntity.get(mK);
        }
        const plasmid = plasmid_name ? plasmid_name.value(j) : '';
        const gene = gene_src_gene ? gene_src_gene.value(j)[0] : '';
        const sK = srcKey(modelIndex, entityId, scientific_name.value(j), pdbx_src_id.value(j), plasmid, gene);
        // may not be given (= 0) indicating src is for the whole seq
        const beg = pdbx_beg_seq_num.valueKind(j) === 0 /* Column.ValueKinds.Present */ ? pdbx_beg_seq_num.value(j) : 1;
        const end = pdbx_end_seq_num.valueKind(j) === 0 /* Column.ValueKinds.Present */ ? pdbx_end_seq_num.value(j) : seqToSrc.length;
        let srcIndex; // serial no starting from 1
        if (srcKeySerialMap.has(sK)) {
            srcIndex = srcKeySerialMap.get(sK);
        }
        else {
            srcIndex = srcKeySerialMap.size + 1;
            srcKeySerialMap.set(sK, srcIndex);
        }
        // set src index
        for (let i = beg, il = end; i <= il; ++i) {
            seqToSrc[i - 1] = srcIndex;
        }
    }
}
function getMaps(models) {
    const seqToSrcByModelEntity = new Map();
    const srcKeySerialMap = new Map(); // serial no starting from 1
    for (let i = 0, il = models.length; i < il; ++i) {
        const m = models[i];
        if (!mmcif_1.MmcifFormat.is(m.sourceData))
            continue;
        const { entity_src_gen, entity_src_nat, pdbx_entity_src_syn } = m.sourceData.data.db;
        addSrc(seqToSrcByModelEntity, srcKeySerialMap, i, m, entity_src_gen, entity_src_gen.pdbx_gene_src_scientific_name, entity_src_gen.plasmid_name, entity_src_gen.pdbx_gene_src_gene);
        addSrc(seqToSrcByModelEntity, srcKeySerialMap, i, m, entity_src_nat, entity_src_nat.pdbx_organism_scientific, entity_src_nat.pdbx_plasmid_name);
        addSrc(seqToSrcByModelEntity, srcKeySerialMap, i, m, pdbx_entity_src_syn, pdbx_entity_src_syn.organism_scientific);
    }
    return { seqToSrcByModelEntity, srcKeySerialMap };
}
function getLabelTable(srcKeySerialMap) {
    let unnamedCount = 0;
    return Array.from(srcKeySerialMap.keys()).map(v => {
        const vs = v.split('|');
        const organism = vs[2];
        const name = (0, number_1.isInteger)(vs[3]) ? `Unnamed ${++unnamedCount}` : vs[3];
        return `${name}${organism ? ` (${organism})` : ''}`;
    });
}
function EntitySourceColorTheme(ctx, props) {
    let color;
    let legend;
    if (ctx.structure) {
        const l = structure_1.StructureElement.Location.create(ctx.structure);
        const { models } = ctx.structure.root;
        const { seqToSrcByModelEntity, srcKeySerialMap } = getMaps(models);
        const labelTable = getLabelTable(srcKeySerialMap);
        const valueLabel = (i) => labelTable[i];
        const palette = (0, palette_1.getPalette)(srcKeySerialMap.size, props, { valueLabel });
        legend = palette.legend;
        const getSrcColor = (location) => {
            const modelIndex = models.indexOf(location.unit.model);
            const entityId = structure_1.StructureProperties.entity.id(location);
            const mK = modelEntityKey(modelIndex, entityId);
            const seqToSrc = seqToSrcByModelEntity.get(mK);
            if (seqToSrc) {
                // minus 1 to convert seqId to array index
                const src = seqToSrc[structure_1.StructureProperties.residue.label_seq_id(location) - 1] - 1;
                // check for -1 as not all sequence ids have a src given
                return src === -1 ? DefaultColor : palette.color(src);
            }
            else {
                return DefaultColor;
            }
        };
        color = (location) => {
            if (structure_1.StructureElement.Location.is(location)) {
                return getSrcColor(location);
            }
            else if (structure_1.Bond.isLocation(location)) {
                l.unit = location.aUnit;
                l.element = location.aUnit.elements[location.aIndex];
                return getSrcColor(l);
            }
            return DefaultColor;
        };
    }
    else {
        color = () => DefaultColor;
    }
    return {
        factory: EntitySourceColorTheme,
        granularity: 'group',
        color,
        props,
        description: Description,
        legend
    };
}
exports.EntitySourceColorThemeProvider = {
    name: 'entity-source',
    label: 'Entity Source',
    category: categories_1.ColorThemeCategory.Chain,
    factory: EntitySourceColorTheme,
    getParams: getEntitySourceColorThemeParams,
    defaultValues: param_definition_1.ParamDefinition.getDefaultValues(exports.EntitySourceColorThemeParams),
    isApplicable: (ctx) => !!ctx.structure
};
