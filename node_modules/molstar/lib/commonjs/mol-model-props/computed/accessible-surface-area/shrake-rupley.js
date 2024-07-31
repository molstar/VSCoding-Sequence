"use strict";
/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Sebastian Bittrich <sebastian.bittrich@rcsb.org>
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessibleSurfaceArea = exports.ShrakeRupleyComputationParams = void 0;
const mol_task_1 = require("../../../mol-task");
// import { BitFlags } from '../../../mol-util';
const param_definition_1 = require("../../../mol-util/param-definition");
const linear_algebra_1 = require("../../../mol-math/linear-algebra");
const structure_1 = require("../../../mol-model/structure");
const radii_1 = require("./shrake-rupley/radii");
const common_1 = require("./shrake-rupley/common");
const area_1 = require("./shrake-rupley/area");
const int_1 = require("../../../mol-data/int");
exports.ShrakeRupleyComputationParams = {
    numberOfSpherePoints: param_definition_1.ParamDefinition.Numeric(92, { min: 12, max: 360, step: 1 }, { description: 'Number of sphere points to sample per atom: 92 (original paper), 960 (BioJava), 3000 (EPPIC) - see Shrake A, Rupley JA: Environment and exposure to solvent of protein atoms. Lysozyme and insulin. J Mol Biol 1973.' }),
    probeSize: param_definition_1.ParamDefinition.Numeric(1.4, { min: 0.1, max: 4, step: 0.01 }, { description: 'Corresponds to the size of a water molecule: 1.4 (original paper), 1.5 (occassionally used)' }),
    // buriedRasaThreshold: PD.Numeric(0.16, { min: 0.0, max: 1.0 }, { description: 'below this cutoff of relative accessible surface area a residue will be considered buried - see: Rost B, Sander C: Conservation and prediction of solvent accessibility in protein families. Proteins 1994.' }),
    nonPolymer: param_definition_1.ParamDefinition.Boolean(false, { description: 'Include non-polymer atoms as occluders.' }),
    traceOnly: param_definition_1.ParamDefinition.Boolean(false, { description: 'Compute only using alpha-carbons, if true increase probeSize accordingly (e.g., 4 A). Considers only canonical amino acids.' })
};
var AccessibleSurfaceArea;
(function (AccessibleSurfaceArea) {
    /**
     * Adapts the BioJava implementation by Jose Duarte. That implementation is based on the publication by Shrake, A., and
     * J. A. Rupley. "Environment and Exposure to Solvent of Protein Atoms. Lysozyme and Insulin." JMB (1973).
     */
    function compute(structure, props = {}) {
        const p = { ...param_definition_1.ParamDefinition.getDefaultValues(exports.ShrakeRupleyComputationParams), ...props };
        return mol_task_1.Task.create('Compute Accessible Surface Area', async (runtime) => {
            return await calculate(runtime, structure, p);
        });
    }
    AccessibleSurfaceArea.compute = compute;
    async function calculate(runtime, structure, props) {
        const ctx = initialize(structure, props);
        (0, radii_1.assignRadiusForHeavyAtoms)(ctx);
        await (0, area_1.computeArea)(runtime, ctx);
        const { area, serialResidueIndex } = ctx;
        return { area, serialResidueIndex };
    }
    function initialize(structure, props) {
        const { elementCount, atomicResidueCount } = structure;
        const { probeSize, nonPolymer, traceOnly, numberOfSpherePoints } = props;
        return {
            structure,
            probeSize,
            nonPolymer,
            traceOnly,
            spherePoints: generateSpherePoints(numberOfSpherePoints),
            scalingConstant: 4.0 * Math.PI / numberOfSpherePoints,
            maxLookupRadius: 2 * props.probeSize + 2 * common_1.VdWLookup[2], // 2x probe size + 2x largest VdW
            atomRadiusType: new Int8Array(elementCount),
            serialResidueIndex: new Int32Array(elementCount),
            area: new Float32Array(atomicResidueCount)
        };
    }
    /** Creates a collection of points on a sphere by the Golden Section Spiral algorithm. */
    function generateSpherePoints(numberOfSpherePoints) {
        const points = [];
        const inc = Math.PI * (3.0 - Math.sqrt(5.0));
        const offset = 2.0 / numberOfSpherePoints;
        for (let k = 0; k < numberOfSpherePoints; ++k) {
            const y = k * offset - 1.0 + (offset / 2.0);
            const r = Math.sqrt(1.0 - y * y);
            const phi = k * inc;
            points[points.length] = linear_algebra_1.Vec3.create(Math.cos(phi) * r, y, Math.sin(phi) * r);
        }
        return points;
    }
    AccessibleSurfaceArea.Flag = {
        NA: 0 /* Flags.NA */,
        Buried: 1 /* Flags.Buried */,
        Accessible: 2 /* Flags.Accessible */
    };
    /** Get relative area for a given component id */
    function normalize(compId, asa) {
        const maxAsa = common_1.MaxAsa[compId] || common_1.DefaultMaxAsa;
        return asa / maxAsa;
    }
    AccessibleSurfaceArea.normalize = normalize;
    function getValue(location, accessibleSurfaceArea) {
        const { area, serialResidueIndex } = accessibleSurfaceArea;
        const rSI = serialResidueIndex[int_1.SortedArray.indexOf(int_1.SortedArray.ofSortedArray(location.structure.root.serialMapping.elementIndices), location.element)];
        if (rSI === -1)
            return -1;
        return area[rSI];
    }
    AccessibleSurfaceArea.getValue = getValue;
    function getNormalizedValue(location, accessibleSurfaceArea) {
        const value = getValue(location, accessibleSurfaceArea);
        return value === -1 ? -1 : normalize(structure_1.StructureProperties.atom.label_comp_id(location), value);
    }
    AccessibleSurfaceArea.getNormalizedValue = getNormalizedValue;
    function getFlag(location, accessibleSurfaceArea) {
        const value = getNormalizedValue(location, accessibleSurfaceArea);
        return value === -1 ? 0 /* Flags.NA */ :
            value < 0.16 ? 1 /* Flags.Buried */ :
                2 /* Flags.Accessible */;
    }
    AccessibleSurfaceArea.getFlag = getFlag;
})(AccessibleSurfaceArea || (exports.AccessibleSurfaceArea = AccessibleSurfaceArea = {}));
